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
 assert.doesNotMatch(toolbar,/retail-filter-controls/);
 assert.match(toolbar,/Filter by connection type/);
 assert.match(toolbar,/Minimum price in BDT/);
 assert.match(toolbar,/In stock only/);
});
test("owner product editor saves connection type in product specs",()=>{
 const admin=read("app/admin/page.tsx");
 assert.match(admin,/connection_type/);
 assert.match(admin,/specs:connection_type/);
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
 assert.match(hero,/retail-slider-progress/);
 assert.doesNotMatch(hero,/Previous banner|Next banner|Pause automatic slideshow|Pause size|Play size/);
 assert.match(hero,/prefers-reduced-motion/);
});
test("shop category menu closes on navigation, escape and outside clicks",()=>{
 const menu=read("components/ShopCategoryMenu.tsx");
 const layout=read("app/layout.tsx");
 assert.match(menu,/usePathname/);
 assert.match(menu,/pointerdown/);
 assert.match(menu,/Escape/);
 assert.match(menu,/onClick=\{\(\)=>setOpen\(false\)\}/);
 assert.match(layout,/ShopCategoryMenu/);
 assert.ok(!layout.includes('<details className="retail-category-dropdown"'));
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
 assert.match(layout,/retail-header-actions"><OffersNavLink/);
 assert.match(layout,/OffersNavLink compact/);
 assert.match(page,/No offers now/);
 assert.match(page,/offer\.coupon_code/);
 assert.match(css,/nexora-offer-spin/);
});
