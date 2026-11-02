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
 assert.match(demo,/ShopFilterToolbar/);
 assert.match(toolbar,/Filter by brand/);
 assert.match(toolbar,/Filter by connection type/);
 assert.match(toolbar,/Minimum price in BDT/);
 assert.match(toolbar,/In stock only/);
});
test("owner product editor saves connection type in product specs",()=>{
 const admin=read("app/admin/page.tsx");
 assert.match(admin,/connection_type/);
 assert.match(admin,/specs:connection_type/);
});
