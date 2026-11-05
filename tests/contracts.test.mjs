import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=(p)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("database contains unique order idempotency and transaction IDs",()=>{
 const sql=read("database/001_commerce.sql");
 assert.match(sql,/idempotency_key uuid not null unique/i);
 assert.match(sql,/unique\(provider,transaction_id\)/i);
 assert.match(sql,/for update of i/i);
});
test("checkout requires an explicit production switch and rate limits",()=>{
 const src=read("app/api/orders/route.ts");
 assert.match(src,/NEXORA_LIVE_ORDERS/);
 assert.match(src,/rateAllow/);
 assert.match(src,/tokenFor/);
 assert.match(src,/shopSettings/);
});
test("server validates owner membership before administrative actions",()=>{
 const src=read("lib/server.ts");
 assert.match(src,/getUser\(auth.slice\(7\)\)/);
 assert.match(src,/admin_memberships/);
 assert.match(src,/timingSafeEqual/);
 assert.ok(src.includes("new URL(origin).origin===new URL(req.url).origin"));
 assert.match(src,/\.eq\("role","owner"\)/);
});
test("secret-bearing local environment files are ignored",()=>{
 const ignore=read(".gitignore");
 assert.match(ignore,/\.env\.\*/);
 assert.ok(existsSync(new URL("../.env.example",import.meta.url)));
});
test("shipping fees and payment reviews are database-controlled",()=>{
 assert.match(read("database/005_delivery_zones.sql"),/nexora_apply_delivery_fee/);
 assert.match(read("database/004_payment_reconciliation.sql"),/nexora_review_payment_claim/);
});

test("shop renders the shared brand and connectivity filter toolbar",()=>{
 const live=read("components/CommerceShop.tsx");
 const demo=read("components/Storefront.tsx");
 const toolbar=read("components/ShopFilterToolbar.tsx");
 assert.match(live,/ShopFilterToolbar/);
 assert.doesNotMatch(live,/retail-shop-sidebar/);
 assert.match(demo,/ShopFilterToolbar/);
 assert.doesNotMatch(demo,/retail-shop-sidebar/);
 assert.match(toolbar,/Filter by brand/);
 assert.match(toolbar,/retail-filter-drawer/);
 assert.match(toolbar,/aria-modal="true"/);
 assert.match(toolbar,/drawerRef/);
 assert.match(toolbar,/event.key!=="Tab"/);
 assert.doesNotMatch(toolbar,/retail-filter-controls/);
 assert.match(toolbar,/Filter by connection type/);
 assert.match(toolbar,/Minimum price in BDT/);
 assert.match(toolbar,/In stock only/);
});
test("owner product editor saves connection type in product specs",()=>{
 const admin=read("app/admin/page.tsx");
 assert.match(admin,/connection_type/);
 assert.match(admin,/parseSpecsJson/);
 assert.match(admin,/connection_type\?\{connection_type\}:\{\}/);
});

test("Nexora displays owner-supplied assets across header and footer",()=>{
 const layout=read("app/layout.tsx");
 assert.ok(layout.includes("/brand/nexora-logo-dark.png"));
 assert.ok(layout.includes("/brand/nexora-logo-light.png"));
 assert.ok(layout.includes("/favicon.png"));
 for(const path of ["public/brand/nexora-logo-dark.png","public/brand/nexora-logo-light.png","public/favicon.png"]){
  assert.ok(existsSync(new URL("../"+path,import.meta.url)),path+" must exist");
 }
});

test("development indicator and redundant storefront banners are disabled",()=>{
 assert.match(read("next.config.ts"),/devIndicators:\s*false/);
 assert.ok(!read("app/layout.tsx").includes('className="retail-topbar"'));
 assert.ok(!read("components/CommerceHome.tsx").includes('className="retail-announcement"'));
 assert.ok(!read("components/Storefront.tsx").includes('className="retail-announcement"'));
});
test("hero is automatic, has no manual carousel controls and respects reduced motion",()=>{
 const hero=read("components/RetailChrome.tsx");
 assert.match(hero,/window\.setInterval/);
 assert.doesNotMatch(hero,/retail-slider-progress|retail-slider-footer/);
 assert.doesNotMatch(hero,/Previous banner|Next banner|Pause automatic slideshow|Pause size|Play size/);
 assert.match(hero,/prefers-reduced-motion/);
 assert.match(hero,/pausedByFocus/);
 assert.doesNotMatch(hero,/Previous banner|Next banner|Pause automatic slideshow/);
});
test("category navigation keeps readable contrast in light mode and a light label in dark mode",()=>{
 const categories=read("app/category-experience.css");
 const theme=read("app/site-experience.css");
 assert.match(categories,/\.retail-nav-inner>a\.retail-category-nav-link\{[^}]*color:#273849/);
 assert.doesNotMatch(categories,/\.retail-nav-inner>a\.retail-category-nav-link\{[^}]*color:#f4f6f8/);
 assert.match(theme,/html\[data-theme="dark"\] \.retail-nav-inner>a,html\[data-theme="dark"\] \.retail-header-actions>a\{color:#c8d2d9\}/);
});
test("desktop category tabs and mobile category drawer expose the complete hierarchy",()=>{
 const layout=read("app/layout.tsx");
 const menu=read("components/MobileMenu.tsx");
 const taxonomy=read("lib/store-taxonomy.ts");
 assert.match(layout,/storeCategories\.map/);
 assert.match(layout,/retail-category-nav-link/);
 assert.match(menu,/storeCategories\.map/);
 assert.match(menu,/nexora-mobile-categories/);
 assert.match(taxonomy,/name:"Networking"/);
 assert.match(taxonomy,/name:"Camera"/);
});

test("offers are scheduled, owner-managed and publicly time-filtered",()=>{
 const migration=read("database/006_store_offers.sql");
 const publicApi=read("app/api/offers/route.ts");
 const adminApi=read("app/api/admin/catalog/route.ts");
 const dashboard=read("app/api/admin/dashboard/route.ts");
 assert.match(migration,/create table if not exists public\.store_offers/i);
 assert.match(migration,/enable row level security/i);
 assert.match(migration,/revoke all on public\.store_offers from anon,authenticated/i);
 assert.match(publicApi,/\.eq\("active",true\)/);
 assert.match(publicApi,/Date\.parse\(offer\.starts_at\)/);
 assert.match(publicApi,/Date\.parse\(offer\.ends_at\)/);
 assert.match(adminApi,/action==="offer\.create"/);
 assert.match(adminApi,/action==="offer\.update"/);
 assert.match(adminApi,/requireOwner\(req\)/);
 assert.match(dashboard,/store_offers/);
});
test("offers navigation glows only with active offers and offers page has empty state",()=>{
 const nav=read("components/OffersNavLink.tsx");
 const page=read("components/OffersPage.tsx");
 const layout=read("app/layout.tsx");
 const css=read("app/offers.css");
 assert.match(nav,/is-live/);
 assert.match(nav,/No offers/);
 assert.match(layout,/retail-header-actions"><ThemeToggle\/><OffersNavLink/);
 assert.match(layout,/OffersNavLink compact/);
 assert.match(page,/No offers now/);
 assert.match(page,/offer\.coupon_code/);
 assert.match(css,/nexora-offer-spin/);
});

test("customer reviews are verified-purchase, private by default and owner moderated",()=>{
 const migration=read("database/007_product_reviews.sql");
 const publicApi=read("app/api/reviews/route.ts");
 const adminApi=read("app/api/admin/reviews/route.ts");
 const dashboard=read("app/api/admin/dashboard/route.ts");
 const admin=read("app/admin/page.tsx");
 assert.match(migration,/unique\(product_id,user_id\)/i);
 assert.match(migration,/enable row level security/i);
 assert.match(migration,/revoke all on public\.product_reviews from anon,authenticated/i);
 assert.match(migration,/o\.order_status='delivered'/);
 assert.match(migration,/new\.verified_purchase:=true/);
 assert.match(migration,/status text not null default 'pending'/);
 assert.match(publicApi,/email_confirmed_at/);
 assert.match(publicApi,/rateAllow/);
 assert.match(publicApi,/status:"pending"/);
 assert.match(publicApi,/eq\("status","approved"\)/);
 assert.match(adminApi,/requireOwner\(req\)/);
 assert.match(adminApi,/status:z\.enum\(\["approved","rejected"\]\)/);
 assert.match(dashboard,/product_reviews/);
 assert.match(read("lib/catalog-live.ts"),/nexora_product_review_summaries/);
 assert.match(read("components/CommerceShop.tsx"),/retail-card-rating/);
 assert.match(read("components/CommerceShop.tsx"),/Featured Products/);
 assert.match(admin,/moderateReview/);
});
test("storefront private routes are excluded from search crawlers",()=>{
 const robots=read("app/robots.ts");
 assert.match(robots,/\/admin/);
 assert.match(robots,/\/checkout/);
 assert.match(robots,/\/api/);
});

test("sensitive file and invoice endpoints enforce bounded request rates",()=>{
 assert.match(read("app/api/orders/invoice/route.ts"),/rateAllow/);
 assert.match(read("app/api/account/avatar/route.ts"),/rateAllow/);
 assert.match(read("app/api/admin/upload/route.ts"),/rateAllow/);
 assert.match(read("app/api/orders/track/route.ts"),/tokenMatches/);
 assert.match(read("app/api/orders/invoice/route.ts"),/tokenMatches/);
});

test("product owner tools support real technical specification data and product SEO",()=>{
 const admin=read("app/admin/page.tsx");
 const page=read("app/product/[slug]/page.tsx");
 assert.match(admin,/parseSpecsJson/);
 assert.match(admin,/Technical specifications \(JSON\)/);
 assert.match(page,/generateMetadata/);
 assert.match(page,/openGraph/);
});
test("home catalog includes curated featured picks and live brand discovery",()=>{
 const shop=read("components/CommerceShop.tsx");
 assert.match(shop,/Featured Products/);
 assert.match(shop,/RetailBrandDirectory/);
 assert.match(shop,/review_average/);
});

test("review rating control uses an accessible fieldset and keyboard-operable buttons",()=>{
 const detail=read("components/CommerceDetail.tsx");
 assert.match(detail,/detail-rating-field/);
 assert.match(detail,/aria-pressed/);
 assert.match(detail,/role="img"/);
});

test("Nexora homepage uses a real-time WebGL gadget studio and category-first merchandising",()=>{
 const live=read("components/CommerceHome.tsx");
 const demo=read("components/Storefront.tsx");
 const hero=read("components/Nexora3DHero.tsx");
 const scene=read("components/Nexora3DScene.tsx");
 const css=read("app/hero-3d.css");
 const pkg=read("package.json");
 assert.match(live,/Nexora3DHero/);
 assert.match(demo,/Nexora3DHero/);
 assert.match(hero,/Nexora3DScene/);
 assert.match(hero,/window\.setInterval/);
 assert.match(scene,/new THREE\.WebGLRenderer/);
 assert.match(scene,/RoundedBoxGeometry/);
 assert.match(scene,/MeshPhysicalMaterial/);
 assert.match(scene,/RoomEnvironment/);
 assert.match(scene,/makeBrushedMetalTexture/);
 assert.match(scene,/roughnessMap:brushedTexture/);
 assert.match(scene,/new THREE\.ExtrudeGeometry/);
 assert.match(scene,/new THREE\.TorusGeometry/);
 assert.match(scene,/Rear camera island/);
 assert.match(scene,/setPointerCapture/);
 assert.match(scene,/onKeyDown=\{handleKeyDown\}/);
 assert.match(scene,/1000\/30/);
 assert.match(scene,/isCompact \? 0\.84 : 1/);
 assert.match(scene,/powerPreference:compactDevice\?"low-power"/);
 assert.match(scene,/IntersectionObserver/);
 assert.match(scene,/prefers-reduced-motion/);
 assert.match(scene,/dataset\.webgl="fallback"/);
 assert.match(pkg,/"three": "\^0\.180\.0"/);
 assert.match(css,/nexora-webgl-stage/);
 assert.match(css,/nexora-hero-visual/);
 assert.match(css,/data-webgl="loading"/);
 assert.match(css,/focus-visible/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(read("app/layout.tsx"),/hero-3d\.css/);
 assert.match(read("app/layout.tsx"),/retail-category-nav-link/);
});
test("Nexora taxonomy has separate Camera and Networking categories with customer subcategories and owner management",()=>{
 const taxonomy=read("lib/store-taxonomy.ts");
 const migration=read("database/009_hierarchical_categories.sql");
 const route=read("app/category/[slug]/[[...subcategory]]/page.tsx");
 const admin=read("app/admin/page.tsx");
 const api=read("app/api/admin/catalog/route.ts");
 const dashboard=read("app/api/admin/dashboard/route.ts");
 for(const name of ["Phones","Mac","Phone Accessories","Tablets","Cases & Protectors","Watches","Headphones & Speakers","PC Accessories","Camera","Gadgets","Networking","Gaming","Drone"])assert.ok(taxonomy.includes('name:"'+name+'"'),name);
 assert.match(taxonomy,/name:"Power Banks"/);
 assert.match(taxonomy,/name:"Chargers & Adapters"/);
 assert.match(taxonomy,/name:"TP-Link Routers"/);
 assert.match(taxonomy,/name:"Gaming Consoles"/);
 assert.match(taxonomy,/name:"Daily Lifestyle"/);
 assert.match(migration,/parent_id uuid references public\.categories/);
 assert.match(route,/CommerceShop initialCategory/);
 assert.match(route,/DemoShop initialCategory/);
 assert.match(admin,/categoryParentId/);
 assert.match(api,/parent_id:uuid\.nullable\(\)\.optional\(\)/);
 assert.match(dashboard,/categories/);
});
test("price/product card links remain bound to Nexora products, without fake claims",()=>{
 const live=read("components/CommerceShop.tsx");
 assert.match(live,/product.review_count>0/);
 assert.match(live,/href=\{"\/product\/"\+product.slug\}/);
 assert.match(live,/product.variants.some/);
});

test("hero carousel rotates automatically without a visible countdown bar or hover pause",()=>{
 const hero=read("components/RetailChrome.tsx");
 const css=read("app/filter-ui.css");
 assert.match(hero,/window\.setInterval\(\(\)=>setActive/);
 assert.match(hero,/5000/);
 assert.match(hero,/onFocusCapture/);
 assert.doesNotMatch(hero,/onMouseEnter/);
 assert.doesNotMatch(hero,/retail-slider-footer/);
 assert.doesNotMatch(hero,/retail-slider-progress/);
 assert.doesNotMatch(css,/nexora-hero-progress/);
});

test("Nexora header logo is compact and responsive while footer branding stays unchanged",()=>{
 const css=read("app/logo-brand.css");
 assert.match(css,/retail-brand-header\{width:125px/);
 assert.match(css,/retail-brand-header\{width:118px/);
 assert.match(css,/retail-brand-header\{width:98px/);
 assert.match(css,/retail-brand-header\{width:88px/);
 assert.match(css,/retail-brand-footer\{width:175px/);
});

test("global Nexora experience includes accessible theme, search, mobile menu and utilities",()=>{
 const layout=read("app/layout.tsx"),experience=read("components/SiteExperience.tsx"),search=read("components/SiteSearch.tsx"),menu=read("components/MobileMenu.tsx"),css=read("app/site-experience.css");
 assert.match(layout,/ConfirmProvider/);assert.match(layout,/id="main-content"/);assert.match(layout,/skip-link/);assert.match(layout,/ThemeToggle/);assert.match(layout,/SiteSearch/);assert.match(layout,/MobileMenu/);
 assert.match(experience,/requestAnimationFrame/);assert.match(experience,/nexora_cookie_choice/);assert.match(experience,/utm_source/);assert.match(experience,/navigator\.clipboard/);
 assert.match(search,/\/api\/catalog/);assert.match(menu,/aria-modal="true"/);assert.match(css,/html\[data-theme="dark"\]/);assert.match(css,/nexora-scroll-progress/);assert.match(css,/nexora-scroll-top/);assert.match(css,/nexora-floating-contact/);
});
test("newsletter requires explicit consent, server validation, rate limits and private database storage",()=>{
 const api=read("app/api/newsletter/route.ts"),sql=read("database/008_newsletter_subscribers.sql"),ui=read("components/NewsletterSignup.tsx");
 assert.match(api,/z\.literal\(true\)/);assert.match(api,/sameOrigin/);assert.match(api,/rateAllow/);assert.match(api,/newsletter_subscribers/);
 assert.match(sql,/enable row level security/i);assert.match(sql,/revoke all on public\.newsletter_subscribers from anon,authenticated/i);assert.match(ui,/setState\("success"\)/);
 assert.match(read("app/api/admin/dashboard/route.ts"),/newsletterSubscribers/);
});
test("destructive actions use styled confirmation dialogs and password visibility is available",()=>{
 const provider=read("components/ConfirmProvider.tsx"),account=read("app/account/page.tsx"),admin=read("app/admin/page.tsx"),chat=read("components/ChatWidget.tsx");
 assert.match(provider,/role="alertdialog"/);assert.match(account,/confirmAction/);assert.match(admin,/confirmAction/);assert.doesNotMatch(admin,/if\(!confirm\(/);assert.match(chat,/confirmAction/);
 assert.match(read("components/PasswordField.tsx"),/visible\?"text":"password"/);
});
test("customer help includes expandable FAQs and last-reviewed metadata",()=>{
 assert.match(read("app/contact/page.tsx"),/FaqAccordion/);assert.match(read("app/contact/page.tsx"),/LastUpdated/);assert.match(read("app/policies/page.tsx"),/LastUpdated/);assert.match(read("components/FaqAccordion.tsx"),/<details/);
});
test("custom 404 and print stylesheet are installed",()=>{
 assert.match(read("app/not-found.tsx"),/Browse gadgets/);assert.match(read("app/loading.tsx"),/nexora-route-loading/);assert.match(read("app/print.css"),/@media print/);assert.match(read("app/layout.tsx"),/print\.css/);
});


test("Nexora homepage follows the premium showroom spec and keeps the first screen focused",()=>{
 const spec=read("docs/NEXORA_SHOWROOM_SPEC.md");
 const hero=read("components/Nexora3DHero.tsx");
 const live=read("components/CommerceShop.tsx");
 const demo=read("components/Storefront.tsx");
 const css=read("app/nexora-showroom.css");
 const layout=read("app/layout.tsx");
 assert.match(spec,/Signature:\*\* a real-time Three\.js product studio/);
 assert.match(hero,/Good tech\./);
 assert.match(hero,/Better every day\./);
 assert.match(hero,/Shop the collection/);
 assert.match(hero,/Browse categories/);
 assert.match(hero,/6500/);
 assert.match(live,/items\.slice\(0,4\)/);
 assert.match(demo,/items\.slice\(0,4\)/);
 assert.doesNotMatch(live,/homeGroups/);
 assert.doesNotMatch(demo,/\["Phones","Phone Accessories","Headphones & Speakers"/);
 assert.match(css,/--nx-bg:#f4f3ef/);
 assert.match(css,/html\[data-theme="dark"\]/);
 assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/retail-mobile-nav/);
 assert.match(layout,/nexora-showroom\.css/);
});
test("3D showroom uses real drag inertia, touch scroll, reduced-motion still rendering and visibility pause",()=>{
 const scene=read("components/Nexora3DScene.tsx");
 const css=read("app/nexora-showroom.css");
 assert.match(scene,/state\.yaw\+=yawDelta/);
 assert.match(scene,/Math\.exp\(-3\.5\*dt\)/);
 assert.match(scene,/event\.pointerType==="touch"\?0:dy\*\.0036/);
 assert.match(scene,/onPointerCancel=\{handlePointerUp\}/);
 assert.match(scene,/onKeyDown=\{handleKeyDown\}/);
 assert.match(scene,/const keepAnimating=!reducedMotion/);
 assert.match(scene,/IntersectionObserver/);
 assert.match(scene,/visibilitychange/);
 assert.match(css,/touch-action:pan-y/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
test("all 13 category destinations remain visible in the featured category grid",()=>{
 const chrome=read("components/RetailChrome.tsx");
 const taxonomy=read("lib/store-taxonomy.ts");
 assert.match(chrome,/id="featured-categories"/);
 assert.match(chrome,/storeCategories\.map/);
 for(const name of ["Phones","Mac","Phone Accessories","Tablets","Cases & Protectors","Watches","Headphones & Speakers","PC Accessories","Camera","Gadgets","Networking","Gaming","Drone"]){
  assert.ok(taxonomy.includes('name:"'+name+'"'),name);
 }
});


test("MotionSites visual review is repeatable in CI and scroll reveals remain progressive enhancement",()=>{
 const shoot=read("scripts/shoot.py");
 const workflow=read(".github/workflows/ci.yml");
 const experience=read("components/SiteExperience.tsx");
 const css=read("app/nexora-showroom.css");
 assert.match(shoot,/desktop-early\.png/);
 assert.match(shoot,/horizontalOverflow/);
 assert.match(shoot,/brokenImages/);
 assert.match(workflow,/Install Playwright for visual QA/);
 assert.match(workflow,/nexora-visual-review/);
 assert.match(workflow,/python scripts\/shoot\.py/);
 assert.match(experience,/new IntersectionObserver/);
 assert.match(experience,/new MutationObserver/);
 assert.match(experience,/prefers-reduced-motion/);
 assert.match(css,/\.nexora-reveal\.is-visible/);
 assert.match(css,/@keyframes nexora-copy-rise/);
});
test("3D studio protects low-data devices and WebGL lifecycle",()=>{
 const scene=read("components/Nexora3DScene.tsx");
 assert.match(scene,/connection\?\.saveData/);
 assert.match(scene,/webglcontextlost/);
 assert.match(scene,/compileAsync\(activeScene,camera\)/);
 assert.match(scene,/webglLost/);
 assert.match(scene,/removeEventListener\("webglcontextlost"/);
});


test("3D hero avoids an oversized podium and the floating support affordance is not duplicated",()=>{
 const scene=read("components/Nexora3DScene.tsx");
 const css=read("app/nexora-showroom.css");
 const shoot=read("scripts/shoot.py");
 assert.doesNotMatch(scene,/CylinderGeometry\(2\.55/);
 assert.doesNotMatch(scene,/ShadowMaterial/);
 assert.match(scene,/root\.rotation\.y=-\.9/);
 assert.match(css,/nexora-floating-contact\{display:none!important\}/);
 assert.match(shoot,/desktop-first-visit\.png/);
 assert.match(shoot,/mobile-first-visit\.png/);
 assert.match(shoot,/Switch to dark mode/);
 assert.match(shoot,/nexora-cookie-close/);
});
