# Adapted from MotionSites Web Builder's screenshot/QA utility.
# Copyright (c) 2026 MotionSites. MIT License; see https://github.com/Motionsites-AI/claude-skill/blob/main/LICENSE
"""Screenshot + QA a page so you can SEE what you built.

Usage:
  python scripts/shoot.py path/to/index.html [out_dir] [--wait 2.5] [--full]
  python scripts/shoot.py http://localhost:5173 [out_dir]

Writes desktop (1440x900) and mobile (390x844) screenshots after entrance
animations settle, plus an "early" desktop frame (0.35s) to check the first
paint, then prints a QA report: console errors, failed requests (broken asset
URLs), horizontal overflow, fonts, videos and images that did not load.

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

VIEWS = [("desktop", 1440, 900), ("mobile", 390, 844)]

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
                                      is_mobile=name == "mobile", has_touch=name == "mobile")
            page = ctx.new_page()
            errors, failed = [], []
            page.on("console", lambda m: errors.append(m.text[:200]) if m.type == "error" else None)
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
                page.get_by_role("button", name="Show promotion 01").click(timeout=1200)
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
                page.locator(".nexora-hero-dots button").first.click(force=True, timeout=1200)
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
                    page.locator("body").click(position={"x": 5, "y": 220})
                    page.wait_for_selector("#nexora-category-mega-menu", state="detached", timeout=1500)
                except Exception as error:
                    raise RuntimeError(f"Category mega-menu interaction QA failed: {error}") from error
            qa = page.evaluate(QA_JS)
            try:
                page.evaluate("document.querySelector('.nexora-theme-toggle')?.click()")
                page.wait_for_function("document.documentElement.dataset.theme === 'dark'", timeout=2500)
                page.wait_for_timeout(250)
                page.screenshot(path=str(out / f"{name}-dark.png"), full_page=full)
            except Exception as error:
                print(f"[visual QA] dark theme capture: {error}")
            if engine != "chrome" and any(v["error"] == 4 for v in qa["videos"]):
                qa["videoNote"] = "This browser cannot decode the MP4; judge the video area from the poster/source, not as a bug."
            qa["consoleErrors"], qa["failedRequests"] = errors[:10], [f for f in failed if "ERR_ABORTED" not in f][:10]
            report[name] = qa
            ctx.close()
        browser.close()
    failures = []
    for name, qa in report.items():
        if not isinstance(qa, dict):
            continue
        if qa.get("horizontalOverflow"):
            failures.append(f"{name}: horizontal overflow ({qa.get('scrollWidth')}px > {qa.get('viewport')}px)")
        if qa.get("brokenImages"):
            failures.append(f"{name}: broken images: {', '.join(qa['brokenImages'])}")
        if qa.get("consoleErrors"):
            failures.append(f"{name}: browser console errors: {', '.join(qa['consoleErrors'])}")
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
