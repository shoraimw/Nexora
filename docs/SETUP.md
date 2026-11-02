# Nexora — backend setup (when ready)

## 1. Prerequisites (no billing)

- GitHub: `shoraimw/Nexora`
- Vercel for **development previews only**, or commercial-compatible no-billing hosting for live selling
- Supabase **Free** project with PostgreSQL, Auth, Storage
- No credit card, subscriptions, paid APIs, premium upgrades or automatic billing
- Optional Brevo Free sender configured after verifying permitted sender identity
- Optional Gemini Free Tier only if free availability, privacy and age restrictions are acceptable

## 2. SQL setup

1. In Supabase SQL Editor, execute `database/001_commerce.sql` in full.
2. Then `database/002_queues_and_limits.sql`.
3. Then `database/003_stock_and_avatar.sql`.
4. Then `database/004_payment_reconciliation.sql`.
5. Then `database/005_delivery_zones.sql` (delivery fee trigger and shipping zones).
6. Then `database/006_store_offers.sql` (owner-managed offers with scheduled visibility).
7. Confirm RLS is enabled on every public table, and non-admin users cannot query orders, claims, admin memberships or audit logs directly.
8. Confirm storage buckets exist: `nexora-products` (public product imagery) and `nexora-avatars` (private signed URLs).
9. These migrations have NOT been tested against a live Supabase instance in this conversation. Test using a fresh staging database and a representative order lifecycle before launch.

## 3. Environment variables (place in hosting Secrets UI, NOT GitHub)

| Name | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes for backend | Project URL, public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes for backend | Publishable/anon key, public |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes for backend | **SERVER ONLY**, never expose |
| `TRACKING_SECRET` | Yes for checkout | Random ≥32-character secret; preserve across deployments |
| `RATE_LIMIT_SECRET` | Recommended | Another random ≥32-character secret; per-IP hashes |
| `NEXORA_LIVE_ORDERS` | No; default disabled | Set to `true` ONLY after go-live checks |
| `BREVO_API_KEY` | For emails | Server-only Free tier transactional API |
| `BREVO_SENDER_EMAIL` | For emails | Verified sender address, server-only |
| `GEMINI_API_KEY` | Optional | Server-only Gemini free-tier key; never expose |
| `GEMINI_FREE_ENABLED` | Optional; default false | Only set to `true` after terms and age/privacy review |
| `GEMINI_MODEL` | Optional | Verified currently free model, e.g. flash-lite |

**Do not configure payment numbers as environment secrets**—the two owners can enter official receiving numbers from the dashboard. These numbers are public checkout information.

Generate secrets locally, e.g. `openssl rand -hex 32`. Store them in your hosting provider's encrypted environment variables.

## 4. Create two owner accounts

1. Activate Supabase Auth email/password and verify email confirmation settings.
2. Each owner registers at `/account`.
3. In Supabase Auth > Users, confirm both user IDs. Never guess them.
4. From the Supabase SQL Editor (run manually by project owner):

```sql
insert into public.admin_memberships(user_id, role, enabled)
select id, 'owner', true
from auth.users
where email in ('OWNER1_VERIFIED_EMAIL', 'OWNER2_VERIFIED_EMAIL')
on conflict (user_id) do update set enabled=true, role='owner';
```

Replace the placeholders with the verified addresses. Check that exactly two intended users were provisioned. Use MFA for both owner accounts, plus strong unique passwords; verify it works end-to-end before allowing real order data.

## 5. Admin catalog and payments

- Sign in at `/admin`.
- Create categories and products, then real variants/SKUs, prices and stock.
- Upload actual product pictures and publish only verified listings.
- Enter the authentic **Brand** and **Connection type** (Wireless, Wired, or Wireless & Wired) for each product under **Edit details**. The storefront filter intentionally uses this explicit metadata. USB-C charging alone does not mean wired audio connectivity.
- Add a **Compare-at price (BDT)** only when it represents a legitimate previous/reference price and is not below the selling price. This powers the sale filter and discount sorting; validate promotional price disclosures before launching.
- Brand search suggestions are generated only from the active catalog. Illustrative "Sample ..." brand names in the no-database preview are NOT real stock.
- Under Promotions & FAQ, configure bKash, Nagad, COD and verified receiving numbers. Add delivery notices and support email.
- Add at least one district-specific delivery zone or a `*` nationwide fallback rate in the admin Promotions tab. Validate the fee against courier terms. Add official warranty, return and privacy policies before sales.
- In **Storefront offers**, create a promotion and optionally attach an existing active coupon. Activate it and set its start/end times; the header glow and Offers page appear only while the offer is within that window. Paused, future and expired offers stay hidden.
- Check the recipient account's genuine transaction history before verifying *each* claim.
- Record overpayments and process refunds **outside the website** through the actual provider first. Only then record refund reference in admin.
- Steadfast booking is initially manual. Enter the real consignment ID and approved tracking URL before marking shipped.

## 6. Emails

- Set up and verify a Brevo Free sender and server-side API key.
- After an order transaction is committed, the database creates an outbox message. The server tries to dispatch it.
- On failure, email stays failed for manual retry from the admin Marketing area. Email failure must never mark payment verified.
- Brevo free-tier quotas, sender limits and deliverability can change. Check them before public use.

## 7. Chatbot

- Rules/retrieval-based product recommendations work when Supabase catalog is connected.
- Gemini is **optional and off** until legal/age/privacy/free-tier eligibility are checked. Requests send only database-derived public product information, never customers' private conversations.
- Guest chat text is available; product image cards are authenticated. Account history requires explicit opt-in.
- When Gemini quota expires or the key is absent, database-grounded search remains available.

## 8. Local verification

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Visit `/api/health` to see preview vs configured mode, but never expose actual credentials in this endpoint.
Before switching on real orders, simulate stock races, duplicate idempotency keys, duplicate TX IDs, partial/overpayments, email failures, unauthorized admin requests, private invoice access and refunds.
