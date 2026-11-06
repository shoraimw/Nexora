# Adapted from MotionSites Web Builder's screenshot/QA utility.
# Copyright (c) 2026 MotionSites. MIT License; see https://github.com/Motionsites-AI/claude-skill/blob/main/LICENSE
"""Screenshot + QA a page so you can SEE what you built.

Usage:
  python scripts/shoot.py path/to/index.html [out_dir] [--wait 2.5] [--full]
  python scripts/shoot.py http://localhost:5173 [out_dir]

Writes five responsive viewport captures (1440, 1280, 768, 390 and 360px),
plus route and interaction screenshots for search, filters, category navigation,
product detail, cart, checkout, account, tracking, help, policies and the mobile
drawer. It reports console errors, horizontal overflow, fonts, videos and broken images.

Needs Playwright:  pip install playwright && python -m playwright install chromium
Falls back to headless Chrome (screenshots only, no QA) if Playwright is missing.
"""
import json, os, shutil, subprocess, sys, time
from pathlib import Path

args = [a for a in sys.argv[1:] if not a.startswith("--")]
flags = sys.argv[1:]
if not args:
    sys.exit(__doc__)
target = args[0]
out = Path(args[1] if len(args) > 1 else "shots")
out.mkdir(parents=True, exist_ok=True)
wait = float(flags[flags.index("--wait") + 1]) if "--wait" in flags else 2.5
full = "--full" in flags
url = target if "://" in target else Path(target).resolve().as_uri()

VIEWS = [("desktop", 1440, 900), ("desktop-compact", 1280, 800), ("tablet", 768, 1024), ("mobile", 390, 844), ("mobile-small", 360, 800)]

QA_JS = """() => {
  const vw = document.documentElement.clientWidth;
  const wide = [...document.querySelectorAll('body *')].filter(e => {
    const r = e.getBoundingClientRect(); return r.right > vw + 1 && getComputedStyle(e).position !== 'fixed';
  }).slice(0, 5).map(e => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''));
  const vids = [...document.querySelectorAll('video')].map(v => ({src: (v.currentSrc || v.src || '').slice(0, 90), ready: v.readyState, paused: v.paused, error: v.error ? v.error.code : null}));
  const imgs = [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src.slice(0, 90));
  const fonts = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, ''));
  const h1 = document.querySelector('h1');
  return {
    title: document.title,
    scrollWidth: document.documentElement.scrollWidth, viewport: vw,
    horizontalOverflow: document.documentElement.scrollWidth > vw + 1, overflowingElements: wide,
    pageHeight: document.documentElement.scrollHeight,
    videos: vids, brokenImages: imgs, fontsLoaded: [...new Set(fonts)],
    h1: h1 ? {text: h1.innerText.slice(0, 80), fontSize: getComputedStyle(h1).fontSize, font: getComputedStyle(h1).fontFamily.slice(0, 40)} : null,
  };
}"""

PRODUCT_CONTRAST_JS = """() => {
  const targets = [
    ["back link", ".detail-page .back-link"],
    ["product title", ".detail-page .detail-copy h1"],
    ["product description", ".detail-page .detail-description"],
    ["product price", ".detail-page .detail-price"],
    ["price availability note", ".detail-page .detail-price span"],
    ["variation label", ".detail-page .detail-label"],
    ["variation option", ".detail-page .variant-row span, .detail-page .variant-row button"],
    ["primary add-to-bag action", ".detail-page .buy-actions .primary-button, .detail-page .detail-add-button"],
    ["secondary view-bag action", ".detail-page .buy-actions .outline-btn"],
    ["product information notice", ".detail-page .detail-notice p"],
    ["concept feature list", ".detail-page .detail-copy li"],
    ["product information tab", ".detail-page .detail-info-tabs a"],
    ["information section heading", ".detail-page .detail-info-section h2"],
    ["long description", ".detail-page .detail-long-description"],
    ["specification label", ".detail-page .spec-table th"],
    ["specification value", ".detail-page .spec-table td"],
    ["supplementary product note", ".detail-page .detail-muted"],
    ["empty review title", ".detail-page .detail-no-reviews strong"],
    ["empty review description", ".detail-page .detail-no-reviews p"]
  ];
  const parse = value => {
    const match = value.match(/rgba?\\(([^)]+)\\)/);
    if (!match) return null;
    const parts = match[1].split(",").map(v => Number.parseFloat(v.trim()));
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
  };
  const luminance = rgb => {
    const channels = rgb.map(value => {
      const v = value / 255;
      return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
    });
    return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
  };
  const ratio = (foreground, background) => {
    const a = luminance(foreground), b = luminance(background);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  };
  const failures = [], missing = [], checks = [];
  for (const [label, selector] of targets) {
    const element = document.querySelector(selector);
    if (!element) { missing.push(label); continue; }
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height || style.display === "none" || style.visibility === "hidden") {
      missing.push(label + " (not visible)");
      continue;
    }
    const foreground = parse(style.color);
    let background = null;
    for (let node = element; node && !background; node = node.parentElement) {
      const candidate = parse(getComputedStyle(node).backgroundColor);
      if (candidate && candidate[3] >= .98) background = candidate.slice(0, 3);
    }
    if (!foreground || !background) { missing.push(label + " (colour unavailable)"); continue; }
    const contrast = ratio(foreground.slice(0, 3), background);
    checks.push({label, contrast: Number(contrast.toFixed(2)), color: style.color});
    if (contrast < 4.5) failures.push({label, contrast: Number(contrast.toFixed(2)), color: style.color, background: style.backgroundColor, tag: element.tagName.toLowerCase(), className: typeof element.className === "string" ? element.className : "", disabled: "disabled" in element ? element.disabled : null, hovered: element.matches(":hover"), focused: element.matches(":focus"), selector});
  }
  if (window.innerWidth <= 790) {
    const contact = document.querySelector(".nexora-floating-contact");
    if (contact && getComputedStyle(contact).display !== "none") {
      failures.push({label: "mobile contact shortcut must not cover product information", contrast: 0, selector: ".nexora-floating-contact"});
    }
  }
  return {checked: checks.length, checks, missing, failures};
}"""


def with_playwright():
    from playwright.sync_api import sync_playwright
    report = {}
    with sync_playwright() as p:
        # Real Chrome plays H.264 MP4s; Playwright's bundled Chromium cannot (videos stay black).
        try:
            browser, engine = p.chromium.launch(channel="chrome"), "chrome"
        except Exception:
            browser, engine = p.chromium.launch(), "chromium (no H.264: MP4 videos will not play)"
        report["browser"] = engine
        for name, w, h in VIEWS:
            ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                                      is_mobile=name in ("mobile", "mobile-small"), has_touch=name in ("tablet", "mobile", "mobile-small"))
            page = ctx.new_page()
            errors, failed = [], []
            page.on("console", lambda m: errors.append(f"{m.text[:200]} [at {m.location}]") if m.type == "error" else None)
            page.on("pageerror", lambda e: errors.append(str(e)[:200]))
            page.on("requestfailed", lambda r: failed.append(f"{r.url[:100]} ({r.failure})"))
            page.on("response", lambda r: failed.append(f"{r.url[:100]} (HTTP {r.status})") if r.status >= 400 else None)
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            if name == "desktop":
                page.wait_for_timeout(350)
                page.screenshot(path=str(out / "desktop-early.png"))
            try:
                page.wait_for_load_state("networkidle", timeout=15000)
            except Exception:
                pass
            page.wait_for_timeout(int(wait * 1000))
            try:
                page.locator(".retail-slider-dots button").first.click(timeout=1200)
                page.wait_for_timeout(120)
            except Exception:
                pass
            page.screenshot(path=str(out / f"{name}-first-visit.png"), full_page=full)
            page.evaluate("document.querySelector('.nexora-cookie-banner .nexora-cookie-close')?.click()");
            try:
                page.wait_for_function("!document.querySelector('.nexora-cookie-banner')", timeout=1800)
            except Exception:
                print("[visual QA] cookie notice remained visible after the consent click")
            try:
                page.locator(".retail-slider-dots button").first.click(force=True, timeout=1200)
                page.wait_for_timeout(120)
            except Exception:
                pass
            page.screenshot(path=str(out / f"{name}-viewport.png"), full_page=False)
            if full:
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(900)
                page.evaluate("window.scrollTo(0, 0)")
                page.wait_for_timeout(250)
            page.screenshot(path=str(out / f"{name}.png"), full_page=full)
            if name == "mobile":
                try:
                    page.get_by_role("button", name="Open navigation menu").click(timeout=2500)
                    panel = page.locator("#nexora-mobile-menu")
                    page.wait_for_selector("#nexora-mobile-menu", state="visible", timeout=1500)
                    page.screenshot(path=str(out / "mobile-menu.png"), full_page=False)
                    page.get_by_role("button", name="Close navigation menu").focus()
                    page.keyboard.press("Shift+Tab")
                    if not panel.evaluate("(el) => el.contains(document.activeElement)"):
                        raise RuntimeError("Keyboard focus escaped the mobile navigation dialog")
                    page.keyboard.press("Escape")
                    page.wait_for_selector("#nexora-mobile-menu", state="detached", timeout=1500)
                except Exception as error:
                    raise RuntimeError(f"Mobile navigation keyboard QA failed: {error}") from error
            if name == "desktop":
                # Exercise the category menu, not just the closed homepage.
                try:
                    menu = page.locator("#nexora-category-mega-menu")
                    phones = page.get_by_role("button", name="Phones", exact=True)
                    mac = page.get_by_role("button", name="Mac", exact=True)
                    phones.click(timeout=2500)
                    page.wait_for_selector("#nexora-category-mega-menu", state="visible", timeout=1500)
                    mac.click(timeout=2500)
                    page.wait_for_function(
                        "() => document.querySelector('#nexora-category-mega-menu')?.getAttribute('aria-label') === 'Mac category menu'",
                        timeout=1500,
                    )
                    if page.locator(".nexora-category-mega").count() != 1:
                        raise RuntimeError("More than one category panel is open")
                    page.screenshot(path=str(out / "desktop-category-menu.png"))
                    page.keyboard.press("Escape")
                    page.wait_for_selector("#nexora-category-mega-menu", state="detached", timeout=1500)
                    phones.click(timeout=2500)
                    page.wait_for_selector("#nexora-category-mega-menu", state="visible", timeout=1500)
                    phones.click(timeout=2500)
                    page.wait_for_selector("#nexora-category-mega-menu", state="detached", timeout=1500)
                    phones.click(timeout=2500)
                    page.wait_for_selector("#nexora-category-mega-menu", state="visible", timeout=1500)
                    page.locator("body").click(position={"x": 5, "y": 650})
                    page.wait_for_selector("#nexora-category-mega-menu", state="detached", timeout=1500)
                except Exception as error:
                    raise RuntimeError(f"Category mega-menu interaction QA failed: {error}") from error
            if name == "desktop":
                base = url.rstrip("/")
                # Header search must return catalogue-backed preview matches.
                page.goto(base, wait_until="domcontentloaded", timeout=60000)
                search = page.get_by_role("searchbox", name="Search the entire Nexora store")
                search.fill("aero")
                page.wait_for_timeout(450)
                page.wait_for_selector(".nexora-search-product", state="visible", timeout=5000)
                if page.locator(".nexora-search-product").count() < 1:
                    raise RuntimeError("Header product search did not return the preview catalogue match")
                page.screenshot(path=str(out / "desktop-search-results.png"), full_page=False)
                search.press("Escape")

                # Product filters must open as a keyboard-dismissible dialog.
                page.goto(base + "/shop", wait_until="domcontentloaded", timeout=60000)
                page.locator(".retail-filter-trigger").click(timeout=2500)
                page.wait_for_selector("#nexora-filter-drawer", state="visible", timeout=1500)
                page.screenshot(path=str(out / "desktop-shop-filters.png"), full_page=False)
                page.keyboard.press("Escape")
                page.wait_for_selector("#nexora-filter-drawer", state="detached", timeout=1500)

                # Add a preview product, verify the bag and confirm checkout stays disabled.
                page.goto(base + "/product/aero-buds", wait_until="domcontentloaded", timeout=60000)
                page.get_by_role("button", name="Add to demo bag").click(timeout=2500)
                page.screenshot(path=str(out / "desktop-product-detail.png"), full_page=True)
                page.goto(base + "/cart", wait_until="domcontentloaded", timeout=60000)
                page.wait_for_selector(".cart-item", state="visible", timeout=3000)
                page.screenshot(path=str(out / "desktop-cart.png"), full_page=True)
                page.goto(base + "/checkout", wait_until="domcontentloaded", timeout=60000)
                if page.locator(".preview-banner").count() != 1:
                    raise RuntimeError("Preview checkout banner is missing")
                if page.get_by_role("button", name="Place order").count() != 0:
                    raise RuntimeError("Preview checkout unexpectedly renders a live order button")
                if page.get_by_label("Full name").count() != 0:
                    raise RuntimeError("Preview checkout unexpectedly collects personal details")
                page.screenshot(path=str(out / "desktop-checkout-preview.png"), full_page=True)

                # Capture the remaining customer and owner routes.
                for route, filename in [
                    ("/account", "desktop-account-preview.png"),
                    ("/track", "desktop-order-tracking.png"),
                    ("/offers", "desktop-offers.png"),
                    ("/contact", "desktop-contact.png"),
                    ("/policies", "desktop-policies.png"),
                    ("/admin", "desktop-admin-preview.png"),
                ]:
                    page.goto(base + route, wait_until="domcontentloaded", timeout=60000)
                    page.wait_for_timeout(250)
                    page.screenshot(path=str(out / filename), full_page=True)

                # The assistant must open and answer using the preview catalogue.
                page.goto(base, wait_until="domcontentloaded", timeout=60000)
                page.get_by_role("button", name="Open assistant").click(timeout=2500)
                page.get_by_role("textbox", name="Ask Nexora").fill("earbuds")
                page.get_by_role("button", name="Send").click(timeout=2500)
                page.wait_for_timeout(900)
                page.screenshot(path=str(out / "desktop-shopping-assistant.png"), full_page=False)
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                page.wait_for_timeout(int(wait * 1000))
            qa = page.evaluate(QA_JS)
            try:
                page.evaluate("document.querySelector('.nexora-theme-toggle')?.click()")
                page.wait_for_function("document.documentElement.dataset.theme === 'dark'", timeout=2500)
                page.wait_for_timeout(250)
                page.screenshot(path=str(out / f"{name}-dark.png"), full_page=full)
            except Exception as error:
                raise RuntimeError(f"{name}: dark theme could not be enabled for visual QA: {error}") from error

            # The theme must persist across navigation, not only on the homepage.
            base = url.rstrip("/")
            page.goto(base + "/product/aero-buds", wait_until="domcontentloaded", timeout=60000)
            page.wait_for_selector(".detail-page .detail-copy h1", state="visible", timeout=5000)
            page.wait_for_function("document.documentElement.dataset.theme === 'dark'", timeout=5000)
            page.mouse.move(0, 0)
            # Let the 180ms theme/button transitions finish before measuring the resting state.
            page.wait_for_timeout(300)
            contrast = page.evaluate(PRODUCT_CONTRAST_JS)
            if contrast["missing"]:
                raise RuntimeError(f"{name}: product dark-mode QA could not find expected content: {contrast['missing']}")
            if contrast["failures"]:
                raise RuntimeError(f"{name}: product dark-mode contrast failed: {contrast['failures']}")
            page.screenshot(path=str(out / f"{name}-product-detail-dark.png"), full_page=full)
            qa["productDetailDarkMode"] = {"slug": "aero-buds", "checked": contrast["checked"], "failures": contrast["failures"]}

            if name == "desktop":
                # Discover every product route from the actual shop, then verify the shared
                # product template on every item rather than assuming one screenshot is enough.
                page.goto(base + "/shop", wait_until="domcontentloaded", timeout=60000)
                page.wait_for_selector("a.retail-product-name[href^='/product/']", state="visible", timeout=8000)
                product_paths = page.locator("a.retail-product-name[href^='/product/']").evaluate_all(
                    "(nodes) => Array.from(new Set(nodes.map(node => new URL(node.href).pathname)))"
                )
                if len(product_paths) < 30:
                    raise RuntimeError(f"Desktop product dark-mode QA found only {len(product_paths)} product routes; expected the full preview catalogue")
                for product_path in product_paths:
                    page.goto(base + product_path, wait_until="domcontentloaded", timeout=60000)
                    page.wait_for_selector(".detail-page .detail-copy h1", state="visible", timeout=5000)
                    page.wait_for_function("document.documentElement.dataset.theme === 'dark'", timeout=5000)
                    page.mouse.move(0, 0)
                    page.wait_for_timeout(300)
                    result = page.evaluate(PRODUCT_CONTRAST_JS)
                    if result["missing"] or result["failures"]:
                        raise RuntimeError(f"Product dark-mode QA failed for {product_path}: missing={result['missing']}, contrast={result['failures']}")
                qa["productPagesDarkModeChecked"] = len(product_paths)
                page.goto(base + "/product/aero-buds", wait_until="domcontentloaded", timeout=60000)
                page.wait_for_selector(".detail-page .detail-copy h1", state="visible", timeout=5000)
                page.wait_for_function("document.documentElement.dataset.theme === 'dark'", timeout=5000)
                page.screenshot(path=str(out / "desktop-all-products-dark-mode.png"), full_page=True)

            if engine != "chrome" and any(v["error"] == 4 for v in qa["videos"]):
                qa["videoNote"] = "This browser cannot decode the MP4; judge the video area from the poster/source, not as a bug."
            qa["consoleErrors"], qa["failedRequests"] = errors[:10], [f for f in failed if "ERR_ABORTED" not in f][:10]
            report[name] = qa
            ctx.close()
        browser.close()
    print(json.dumps(report, indent=1))
    failures = []
    for name, qa in report.items():
        if not isinstance(qa, dict):
            continue
        if qa.get("horizontalOverflow"):
            failures.append(f"{name}: horizontal overflow ({qa.get('scrollWidth')}px > {qa.get('viewport')}px)")
        if qa.get("brokenImages"):
            failures.append(f"{name}: broken images: {', '.join(qa['brokenImages'])}")
        if qa.get("consoleErrors"):
            failures.append(f"{name}: browser console errors: {', '.join(qa['consoleErrors'])}; failed requests: {', '.join(qa.get('failedRequests', []))}")
    if failures:
        raise RuntimeError("Visual QA failed:\\n" + "\\n".join(failures))
    return report


def with_chrome():
    chrome = next((c for c in ["google-chrome", "chromium", "chromium-browser",
                               "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
                   if shutil.which(c) or os.path.exists(c)), None)
    if not chrome:
        sys.exit("No Playwright and no Chrome found. Install: pip install playwright && python -m playwright install chromium")
    for name, w, h in VIEWS:
        subprocess.run([chrome, "--headless=new", "--hide-scrollbars", f"--window-size={w},{h}",
                        f"--virtual-time-budget={int(wait * 1000)}", f"--screenshot={out / (name + '.png')}", url],
                       capture_output=True, timeout=120)
    return {"note": "headless Chrome fallback: screenshots only, no QA report"}


try:
    import playwright  # noqa: F401
    rep = with_playwright()
except ImportError:
    rep = with_chrome()

print(json.dumps(rep, indent=1))
print("\nScreenshots:", ", ".join(str(p) for p in sorted(out.glob("*.png"))))
print("Now LOOK at them (open the PNGs) and review against references/review.md.")
