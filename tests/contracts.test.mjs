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
 assert.match(src,/x-forwarded-host/);assert.match(src,/x-forwarded-proto/);assert.match(src,/source\.host\.toLowerCase\(\)===host/);
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
test("hero rotates every 6.5 seconds with accessible manual slide selection and reduced-motion support",()=>{
 const hero=read("components/RetailChrome.tsx");
 assert.match(hero,/window\.setInterval/);
 assert.match(hero,/6500/);
 assert.match(hero,/retail-slider-footer/);
 assert.match(hero,/aria-pressed/);
 assert.doesNotMatch(hero,/retail-slider-progress/);
 assert.doesNotMatch(hero,/Previous banner|Next banner|Pause automatic slideshow|Pause size|Play size/);
 assert.match(hero,/prefers-reduced-motion/);
 assert.match(hero,/pausedByFocus/);
});
test("category navigation keeps readable contrast in light mode and a light label in dark mode",()=>{
 const categories=read("app/category-experience.css");
 const theme=read("app/site-experience.css");
 assert.match(categories,/\.retail-nav-inner>a\.retail-category-nav-link\{[^}]*color:#273849/);
 assert.doesNotMatch(categories,/\.retail-nav-inner>a\.retail-category-nav-link\{[^}]*color:#f4f6f8/);
 assert.match(theme,/html\[data-theme="dark"\] \.retail-nav-inner>a,html\[data-theme="dark"\] \.retail-header-actions>a\{color:#c8d2d9\}/);
});
test("desktop category menu uses one controlled overlay and supports click-to-pin, toggle, outside click and Escape",()=>{
 const categoryNav=read("components/RetailCategoryNav.tsx");
 const menu=read("components/MobileMenu.tsx");
 const taxonomy=read("lib/store-taxonomy.ts");
 assert.match(categoryNav,/useState/);
 assert.match(categoryNav,/activeSlug/);
 assert.match(categoryNav,/setLocked\(true\)/);
 assert.match(categoryNav,/setLocked\(false\)/);
 assert.match(categoryNav,/aria-expanded/);
 assert.match(categoryNav,/aria-controls/);
 assert.match(categoryNav,/closeOnOutside/);
 assert.match(categoryNav,/const dismiss=\(\)=>\{/);
 assert.match(categoryNav,/onClick=\{dismiss\}/);
 assert.match(categoryNav,/closeOnEscape/);
 assert.match(categoryNav,/event\.key==="Escape"/);
 assert.match(categoryNav,/id="nexora-category-mega-menu"/);
 assert.match(categoryNav,/activeCategory\.subcategories\.map/);
 assert.doesNotMatch(categoryNav,/<details/);
 assert.doesNotMatch(categoryNav,/<summary/);
 assert.match(menu,/categories\.map/);assert.match(menu,/useStoreCategories/);
 assert.match(menu,/nexora-mobile-categories/);
 assert.match(taxonomy,/name:"Networking"/);
 assert.match(taxonomy,/name:"Camera"/);
});
test("desktop mega menu is a single full-width panel and cannot stack per hovered category",()=>{
 const css=read("app/startech-inspired.css");
 assert.match(css,/\.nexora-category-mega\{position:absolute;[^}]*left:0;right:0/);
 assert.match(css,/\.nexora-category-mega-links\{display:grid/);
 assert.doesNotMatch(css,/\.nexora-nav-category:hover/);
 assert.doesNotMatch(css,/\.nexora-nav-category\[open\]/);
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

test("homepage uses the original rotating retail promo hero instead of a 3D gadget showroom",()=>{
 const live=read("components/CommerceHome.tsx");
 const demo=read("components/Storefront.tsx");
 const chrome=read("components/RetailChrome.tsx");
 const layout=read("app/layout.tsx");
 assert.ok(live.includes("<RetailHero/>"));
 assert.ok(demo.includes("<RetailHero/>"));
 assert.ok(!live.includes("Nexora3DHero"));
 assert.ok(!demo.includes("Nexora3DHero"));
 assert.ok(chrome.includes("export function RetailHero()"));
 assert.ok(chrome.includes("window.setInterval"));
 assert.equal(existsSync(new URL("../components/Nexora3DHero.tsx",import.meta.url)),false);
 assert.equal(existsSync(new URL("../app/hero-3d.css",import.meta.url)),false);
 assert.ok(!layout.includes("hero-3d.css"));
});

test("StarTech-inspired storefront adds a utility strip and taxonomy-driven single mega category menu",()=>{
 const layout=read("app/layout.tsx");
 const nav=read("components/RetailCategoryNav.tsx");
 const css=read("app/startech-inspired.css");
 assert.match(layout,/nexora-utility-bar/);
 assert.match(layout,/RetailCategoryNav/);
 assert.match(nav,/categories\.map/);assert.match(nav,/useStoreCategories/);
 assert.match(nav,/activeCategory\.subcategories\.map/);
 assert.match(nav,/categoryHref\(activeCategory,subcategory\)/);
 assert.match(nav,/aria-expanded/);
 assert.match(nav,/onPointerLeave/);
 assert.doesNotMatch(nav,/<details/);
 assert.doesNotMatch(nav,/<summary/);
 assert.match(css,/nexora-category-mega/);
 assert.match(css,/retail-hero-side/);
 assert.match(css,/nexora-utility-bar/);
});
test("homepage places promotional cards before the product-first catalog",()=>{
 const home=read("components/CommerceHome.tsx");
 const demo=read("components/Storefront.tsx");
 assert.ok(home.indexOf("<RetailPromoBanners/>")<home.indexOf("<CommerceShop homepage/>"));
 assert.ok(demo.indexOf("<RetailPromoBanners/>")<demo.indexOf("<div className=\"retail-home-catalog\">"));
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
 assert.match(api,/parent_id:uuid/);assert.match(api,/Choose an active top-level parent category/);assert.match(admin,/Choose a top-level category/);assert.match(admin,/c\.active/);
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
 assert.match(hero,/6500/);
 assert.match(hero,/retail-slider-footer/);
 assert.match(hero,/aria-pressed/);
 assert.match(hero,/onFocusCapture/);
 assert.doesNotMatch(hero,/onMouseEnter/);
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



test("live category visibility is shared by navigation, mobile menu, category grid, filters and direct routes",()=>{
 const api=read("app/api/categories/route.ts"),hook=read("components/useStoreCategories.ts"),nav=read("components/RetailCategoryNav.tsx"),mobile=read("components/MobileMenu.tsx"),chrome=read("components/RetailChrome.tsx"),shop=read("components/CommerceShop.tsx"),page=read("app/category/[slug]/[[...subcategory]]/page.tsx");
 assert.match(api,/\.eq\("active",true\)/);assert.match(hook,/data\.live===true/);assert.match(nav,/useStoreCategories/);assert.match(mobile,/useStoreCategories/);assert.match(chrome,/useStoreCategories/);assert.match(shop,/useStoreCategories/);assert.match(page,/resolveCategory/);assert.match(page,/\.eq\("active",true\)/);
});
test("all 13 category destinations remain visible in the featured category grid",()=>{
 const chrome=read("components/RetailChrome.tsx");
 const taxonomy=read("lib/store-taxonomy.ts");
 assert.match(chrome,/retail-category-grid/);
 assert.match(chrome,/categories\.map/);
 for(const name of ["Phones","Mac","Phone Accessories","Tablets","Cases & Protectors","Watches","Headphones & Speakers","PC Accessories","Camera","Gadgets","Networking","Gaming","Drone"]){
  assert.ok(taxonomy.includes('name:"'+name+'"'),name);
 }
});


test("desktop and mobile visual QA runs in CI and catches broken images, overflow and console errors",()=>{
 const shoot=read("scripts/shoot.py");
 const workflow=read(".github/workflows/ci.yml");
 assert.ok(shoot.includes("desktop-early.png"));
 assert.ok(shoot.includes("horizontalOverflow"));
 assert.ok(shoot.includes("brokenImages"));
 assert.ok(shoot.includes("consoleErrors"));
 assert.ok(shoot.includes('("desktop-compact", 1280, 800)'));
 assert.ok(shoot.includes('("tablet", 768, 1024)'));
 assert.ok(shoot.includes('("mobile-small", 360, 800)'));
 assert.ok(workflow.includes("Install Playwright for visual QA"));
 assert.ok(workflow.includes("nexora-visual-review"));
 assert.ok(workflow.includes("Capture five responsive viewports"));
 assert.ok(workflow.includes("python scripts/shoot.py"));
});

test("cart clears after an accepted order and preserves saved items when store mode or live catalogue is unavailable",()=>{
 const cart=read("components/CartProvider.tsx"),page=read("app/cart/page.tsx"),checkout=read("app/checkout/page.tsx");
 assert.match(cart,/clear:\(\)=>void/);assert.match(cart,/const clear=useCallback\(\(\)=>setItems\(\[\]\)/);
 assert.match(page,/health\?\.mode==="configured"/);assert.match(page,/catalog\?\.live===false/);
 assert.match(page,/catalogAvailable/);assert.match(page,/mode!==true/);
 assert.match(page,/Product details temporarily unavailable/);assert.match(page,/mode===null\|\|mode===true/);
 assert.match(page,/Saved preview or unavailable items were removed/);
 assert.match(checkout,/const \{items,clear\}=useCart\(\)/);assert.match(checkout,/clear\(\)/);
});
test("configured storefront distinguishes catalogue outages from an empty catalogue and offers retry",()=>{
 const shop=read("components/CommerceShop.tsx");
 assert.match(shop,/catalogError/);assert.match(shop,/x\.live!==true\|\|!Array\.isArray\(x\.products\)/);
 assert.match(shop,/The catalogue is temporarily unavailable/);assert.match(shop,/We couldn't load the catalogue/);
 assert.match(shop,/setReloadCount\(value=>value\+1\)/);
});
test("preview checkout collects no personal or payment details and shows an explicit safe state",()=>{
 const checkout=read("app/checkout/page.tsx");assert.match(checkout,/Checkout is in preview mode/);assert.match(checkout,/No personal or payment information is collected/);assert.match(checkout,/!enabled\?/);assert.match(checkout,/items\.length===0\?/);
});
test("search only shows demo products when the catalogue API explicitly reports preview mode",()=>{
 const search=read("components/SiteSearch.tsx");assert.match(search,/data\.live===false/);assert.match(search,/setCatalogError\(true\)/);assert.doesNotMatch(search,/useState<SearchProduct\[]>\(demo\)/);
});
test("mobile navigation traps focus and restores the previous focus target",()=>{
 const menu=read("components/MobileMenu.tsx");assert.match(menu,/panelRef/);assert.match(menu,/event\.key!=="Tab"/);assert.match(menu,/event\.shiftKey\?last:first/);assert.match(menu,/previous\?\.focus/);
});
test("customer account deletion requires re-authentication, blocks owners and anonymizes retained orders",()=>{
 const api=read("app/api/account/delete/route.ts"),sql=read("database/010_account_privacy.sql"),page=read("app/account/page.tsx");
 assert.match(api,/signInWithPassword/);assert.match(api,/confirmEmail/);assert.match(api,/admin_memberships/);assert.match(api,/nexora_delete_customer_account/);
 assert.match(sql,/security definer/);assert.match(sql,/role=.owner./);assert.match(sql,/Deleted customer/);assert.match(sql,/privacy\.nexora\.invalid/);assert.match(sql,/revoke all on function/);
 assert.match(page,/deleteAccount/);assert.match(page,/Current password/);assert.match(page,/account\/delete/);
});
test("owner controls can hide categories and toggle variants, coupons, FAQs and delivery zones",()=>{
 const api=read("app/api/admin/catalog/route.ts"),dashboard=read("app/api/admin/dashboard/route.ts"),admin=read("app/admin/page.tsx");
 assert.match(api,/action==="category\.update"/);assert.match(api,/action==="coupon\.update"/);assert.match(api,/inventory/);
 assert.match(admin,/mutation\("category\.update"/);assert.match(admin,/mutation\("variant\.update"/);assert.match(admin,/mutation\("coupon\.update"/);assert.match(admin,/mutation\("faq\.update"/);assert.match(admin,/mutation\("delivery\.set"/);
 assert.match(dashboard,/audit_logs/);assert.match(admin,/data\.auditLogs/);
});
test("newsletter collection is unavailable until the private subscriber table exists",()=>{
 const api=read("app/api/newsletter/route.ts"),ui=read("components/NewsletterSignup.tsx");assert.match(api,/export async function GET/);assert.match(api,/available:!error/);assert.match(ui,/availability==="unavailable"/);assert.match(ui,/No email is collected/);
});

test("same-origin protection respects the forwarded host while rejecting cross-origin chat requests",()=>{
 const server=read("lib/server.ts"),workflow=read(".github/workflows/ci.yml");
 assert.match(server,/x-forwarded-host/);assert.match(server,/x-forwarded-proto/);assert.match(server,/source\.host\.toLowerCase\(\)===host/);
 assert.match(workflow,/attacker\.example/);assert.match(workflow,/api\/chat/);
});

test("homepage preview imagery is valid and visual QA fails on broken assets or overflow",()=>{
 const catalog=read("lib/catalog.ts");
 const shoot=read("scripts/shoot.py");
 assert.doesNotMatch(catalog,/photo-1609592806596-b43badaf3b26/);
 assert.match(catalog,/photo-1601898532138-9f145a2ad69e/);
 assert.ok(shoot.includes('if qa.get("horizontalOverflow"):'));
 assert.ok(shoot.includes('if qa.get("brokenImages"):'));
 assert.ok(shoot.includes('if qa.get("consoleErrors"):'));
 assert.ok(shoot.includes("document.querySelector('.nexora-theme-toggle')?.click()"));
 assert.ok(shoot.includes('page.get_by_role("button", name="Phones", exact=True)'));
 assert.ok(shoot.includes('page.screenshot(path=str(out / "desktop-category-menu.png"))'));
 assert.ok(shoot.includes('page.keyboard.press("Escape")'));
 assert.ok(shoot.includes('Category mega-menu interaction QA failed'));
});


test("customer and owner price displays use a readable BDT fallback instead of a missing Taka glyph",()=>{
 const files=[
  "components/CommerceDetail.tsx",
  "components/CommerceShop.tsx",
  "lib/catalog.ts",
  "app/cart/page.tsx",
  "app/checkout/page.tsx",
  "app/admin/page.tsx",
  "app/track/page.tsx"
 ];
 for(const path of files){
  const source=read(path);
  assert.doesNotMatch(source,/৳/,path+" should not render an unsupported currency glyph");
  assert.match(source,/BDT/,path+" should label monetary values in BDT");
 }
});


test("accepted orders email a PDF invoice to the verified account email or guest checkout email",()=>{
 const orders=read("app/api/orders/route.ts"),account=read("app/api/account/route.ts"),checkout=read("app/checkout/page.tsx");
 const email=read("lib/email.ts"),pdf=read("lib/invoice-pdf.ts"),download=read("app/api/orders/invoice/route.ts");
 assert.match(orders,/user\?\.email_confirmed_at&&user\.email/);
 assert.match(orders,/p_details:customerDetails/);
 assert.match(account,/emailVerified:!!user\.email_confirmed_at/);
 assert.match(checkout,/setAccountEmail\(data\.email\)/);
 assert.match(checkout,/readOnly=\{label==="Email address"&&!!accountEmail\}/);
 assert.match(checkout,/Your invoice will be sent to this verified account email/);
 assert.match(email,/buildInvoicePdf\(order,items\)/);
 assert.match(email,/outbox\.kind==="order_received"/);
 assert.match(email,/attachment:\{name:string;content:string\}/);
 assert.match(email,/payload\.attachment=\[attachment\]/);
 assert.match(email,/order_items/);
 assert.match(email,/outbox\.recipient\|\|order\.email/);
 assert.match(pdf,/TOTAL DUE \(BDT\)/);
 assert.match(download,/buildInvoicePdf\(order,items\)/);
});


test("checkout confirmation tells the customer which email received the invoice and whether delivery succeeded",()=>{
 const api=read("app/api/orders/route.ts"),page=read("app/checkout/page.tsx"),css=read("app/commerce.css");
 assert.match(api,/invoiceEmail:customerDetails\.email/);
 assert.match(api,/invoiceEmailStatus:invoiceMessage\?\.status\|\|"queued"/);
 assert.match(page,/invoiceEmailStatus==="sent"/);
 assert.match(page,/invoiceEmailStatus==="failed"/);
 assert.match(page,/order\.invoiceEmail/);
 assert.match(page,/PDF invoice sent/);
 assert.match(css,/\.checkout-invoice-notice/);
});


test("new order invoice is prioritized and atomically claimed before older queued messages",()=>{
 const email=read("lib/email.ts"),orders=read("app/api/orders/route.ts");
 assert.match(email,/preferredOrderId\?:string/);
 assert.match(email,/eq\("kind","order_received"\)/);
 assert.match(email,/eq\("status","queued"\)/);
 assert.match(email,/eq\("attempts",pending\.attempts\)/);
 assert.match(email,/status:"sending"/);
 assert.match(orders,/deliverPendingEmails\(1,data\.id\)/);
});


test("every Nexora product detail route has theme-aware dark-mode text, controls, tabs, specs and reviews",()=>{
 const retail=read("app/retail-store.css");
 const theme=read("app/startech-inspired.css");
 const page=read("app/product/[slug]/page.tsx");
 const live=read("components/CommerceDetail.tsx");
 const shoot=read("scripts/shoot.py");
 assert.match(retail,/\.detail-page \.detail-copy h1\{[^}]*color:var\(--product-detail-ink\)/);
 assert.match(retail,/\.detail-page \.detail-description\{[^}]*color:var\(--product-detail-muted\)/);
 assert.match(retail,/\.detail-page \.detail-price\{[^}]*border-color:var\(--product-detail-border\)/);
 assert.match(theme,/--product-detail-ink:#f1f5f8/);
 assert.match(theme,/--product-detail-muted:#c1cdd6/);
 for(const selector of [
  /html\[data-theme="dark"\] \.detail-page \.detail-copy h1/,
  /html\[data-theme="dark"\] \.detail-page \.detail-description/,
  /html\[data-theme="dark"\] \.detail-page \.detail-notice/,
  /html\[data-theme="dark"\] \.detail-page \.variant-button/,
  /html\[data-theme="dark"\] \.detail-page \.detail-info-tabs/,
  /html\[data-theme="dark"\] \.detail-page \.spec-table th/,
  /html\[data-theme="dark"\] \.detail-page \.detail-no-reviews/,
  /html\[data-theme="dark"\] \.detail-page \.detail-review-form input/
 ]) assert.match(theme,selector);
 assert.match(page,/className="detail-page"/);
 assert.match(live,/className="detail-page"/);
 assert.match(shoot,/PRODUCT_CONTRAST_JS/);
 assert.match(shoot,/contrast < 4\.5/);
 assert.match(shoot,/productPagesDarkModeChecked/);
 assert.match(shoot,/product detail contrast failed|product dark-mode contrast failed/i);
});
