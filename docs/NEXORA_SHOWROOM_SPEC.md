# Nexora — Premium gadget showroom specification

## 0. Brief

Redesign the Nexora storefront homepage for Bangladesh-based shoppers discovering phones, computers, audio, accessories, gaming and everyday gadgets. Preserve the existing Next.js 15 / React 19 architecture, catalog routes, all 13 parent categories, search, cart, account, offers, admin, support chat and preview/live data boundary.

**Mood:** tactile, editorial, precise, quietly confident.
**Signature:** a real-time Three.js product studio showing a phone, smartwatch, headphones and earbuds as a single curated collection. It should feel like a physical product shoot, not a sci-fi dashboard.
**Scope:** homepage and shared storefront chrome first; product/category/checkout routes retain their existing behavior and receive compatible shared tokens.

## 1. Art direction

Use a warm-paper retail canvas around a deep graphite product studio. The page has one memorable dark 3D hero; all sections below it are calm and bright. Avoid competing hero banners, floating badges, animated blobs, multiple unrelated gradients, or excessive UI decoration.

Palette:
- Paper: #F4F3EF; surface: #FFFFFF; ink: #17232D; muted: #66737D; line: #E4E4DF.
- Studio: #0B151F; studio-mid: #132536; accent: #E58A63; accent-soft: #F5E7DF.
- Dark theme paper: #0C151E; surface: #14232F; ink: #E6EDF2; muted: #AAB8C1; line: #2B3C49; accent: #F0A07B.
- Accent is reserved for primary CTAs, small active states and a few micro-labels. No purple gradients or neon glow.

Typography: use the existing Inter family for UI and body. Use a restrained display scale with a 500-weight headline, tight tracking (-0.04em), line-height 0.94. Hero H1: clamp(48px, 6.1vw, 88px); body: 15px/1.65, max-width 32rem; section headings: clamp(28px, 3.4vw, 42px). Micro-labels: 9–11px, uppercase, tracking 0.16em. Do not introduce more font downloads.

## 2. Header

Sticky, 76px desktop main row, warm-white translucent surface, 1px bottom rule and 16px backdrop blur. Preserve the original logo assets. Layout: logo, flexible search, theme/offers/account/cart actions. Search is a 44px pill with a calm surface and visible focus ring. Cart is the only dark filled header action. Category navigation remains a single horizontal row with all 13 categories, 40px high, scrollable without wrapping on narrower desktop widths. Category labels are 10–11px, dark ink in light mode and pale ink in dark mode. Mobile keeps the current two-row search/header and bottom navigation; the category row moves into the existing accessible drawer.

## 3. Hero — Nexora Product Studio

One rounded 24px panel, min-height 660px desktop, two columns 0.88fr / 1.12fr. Left copy column has 56–76px gutters; right stage is the only media plane. Background #0B151F with a subtle studio falloff; no orbit rings, floating glass labels or moving glow blobs.

Copy:
- Eyebrow: scene-specific label, 9px uppercase, warm accent, preceded by a 6px static dot.
- H1: two manually broken lines, “Good tech.” / “Better every day.”; second line in muted warm accent.
- Subline: “Find the devices and everyday essentials that fit your life—from the first charge to the last song.”
- Primary CTA: “Shop the collection” to /shop, 48px high, pill, warm accent fill and dark text.
- Secondary: “Browse categories” to the category grid, text link with arrow.
- Slide control: three small progress bars and previous/next icon buttons, 36px circles; controls pause autoplay while focused. Autoplay every 6.5s, no visible timer, no autoplay under reduced motion or hidden tab.

3D stage: actual Three.js scene, transparent canvas, 34° product-shot camera, RoomEnvironment PMREM, one soft key, one cool rim and a low-intensity warm rim. PBR titanium, glass, soft silicone and acoustic fabric. The four models share one balanced product composition, with a soft low-contrast grounding shadow rather than a bulky display podium. The 3D group is the only moving visual. Mouse/touch horizontal drag rotates the collection with restrained inertia; vertical touch remains page scroll; keyboard arrows rotate. Reduced-motion mode renders a still state until input. Pause rendering when off-screen or tab-hidden; cap DPR at 1.5 desktop / 1.2 mobile and frame rate at 45 / 30 FPS. Keep the CSS fallback visible until WebGL is ready and on context loss or failure.

## 4. Homepage section order

1. Hero.
2. Trust strip: four factual service cues (delivery information, order tracking, shopping help, clear policies). Do not claim free shipping, guaranteed delivery or payment security without verified configuration.
3. Featured Categories: all 13 parent categories in a 5-column desktop grid, 3-column tablet grid and 2-column mobile grid. Each card has one line icon, category name and concise taxonomy hint; every card links to its own category route.
4. Brand directory: horizontal/compact, only brands present in the current catalog. In preview mode, clearly label sample brand data.
5. Featured Products, Trending Products, New Arrivals and Student Picks only when available. Four product cards per shelf on desktop; two on mobile. Do not render a long list of category-specific product shelves on the homepage—those belong on their category pages.
6. Two editorial promo panels: Student Picks and Gifts. Keep these as secondary destinations, not competing heroes.
7. Existing footer, newsletter, floating support and cookie controls.

## 5. Product cards and sections

Cards use 16px radii, thin neutral borders, white surfaces, square/4:5 image windows and contained product imagery without forced multiply blending. Image area #F1F2EF in light mode and #1A2A36 in dark mode. Product title 14px/1.4, brand/category metadata 9–10px, price 16px semibold. Hover lift ≤4px and a soft 0 12px 28px rgba(20,35,45,.08) shadow. Buttons and interactive targets are at least 44px on touch. Preview products keep their “Preview” badge and disabled purchase actions; no sample price, stock or discount is represented as live inventory.

## 6. Motion and responsive behavior

Entrance: nav 0.0s, eyebrow 0.15s, H1 0.28s, sub 0.42s, CTA 0.55s; each 0.7s with cubic-bezier(.22,1,.36,1). Hero product intro completes within 1.6s. Hover transitions 180–260ms. Avoid infinite movement except the restrained idle sway of the 3D product stage and the existing automatic hero slides. Respect prefers-reduced-motion globally.

Desktop: 1320px content max, 48–64px gutters. Tablet: 790px breakpoint, stacked hero copy/stage, 3 category columns. Mobile: 540px breakpoint, 18–20px gutters, 2 category columns, 2 product columns, 350–390px 3D stage, no horizontal overflow. Use 100dvh where viewport-height layouts exist, safe-area insets for bottom navigation, and keep primary CTA visible.

## 7. Acceptance and QA

- All 13 category routes and subcategories remain intact.
- Search, cart, theme toggle, account, offers, chat, newsletter and admin entry points still work.
- Light and dark themes have readable text and visible focus states.
- Preview products remain clearly labelled and cannot be purchased.
- No invented live inventory, discounts, delivery promises or backend status.
- 375px mobile width has no horizontal overflow; hero CTA and category navigation remain usable.
- No console errors, failed image requests or WebGL context leaks.
- Run contract tests, TypeScript, production build and preview HTTP smoke tests. Capture desktop, mobile and early-load screenshots; review contrast, composition, 3D framing, image failures and mobile overflow. Fix the three weakest areas and repeat up to three rounds.
