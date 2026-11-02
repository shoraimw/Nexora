# Nexora — go-live checklist

**Do not process real money or customer personal data until every critical item has passed.**

## Accounts and hosting
- [ ] Supabase free project exists and all migrations ran without SQL errors
- [ ] Both owners have verified accounts and MFA, with least-privilege admin membership
- [ ] Database RLS policies, grants and storage bucket rules tested
- [ ] PostgreSQL backups exported/restorable; restore practice completed
- [ ] HTTPS, hosting rate limits, robots/sitemap, verified domain and redirects configured
- [ ] Commercial-permitted hosting chosen (Vercel Hobby remains preview-only)
- [ ] No credit card, paid provider account or automatic upgrades enabled

## Catalog and customer experience
- [x] Original transparent Nexora logo provided and applied to header, footer, and browser tab
- [ ] Demo products removed; real images, variant prices, warranties and stock reviewed
- [ ] Mobile UI tested on common phones and slow mobile connections
- [ ] Search, filters, cart and variant switching tested
- [ ] Hero autoplay, reduced-motion behaviour and mobile filter drawer tested
- [ ] Product descriptions/specifications checked for accuracy
- [ ] Review submission requires a verified delivered purchase; pending reviews are not public; owner moderation and aggregate ratings tested
- [ ] Active offer schedule, coupon validity and automatic expiry display verified
- [ ] Privacy notices, returns terms and delivery ETA/charges finalized
- [ ] Product image and avatar upload safety checks verified

## Orders and payments
- [ ] Real checkout behind NEXORA_LIVE_ORDERS flag until sign-off
- [ ] District delivery zones and server-side final total (migration 005) tested against live PostgreSQL
- [ ] Official bKash/Nagad receiver numbers published and independently verified
- [ ] COD zones, cancellation and non-delivery handling confirmed
- [ ] Simultaneous checkout stock race and transaction rollback tested
- [ ] Customer price tampering cannot change server total
- [ ] Duplicate order idempotency and duplicate transaction ID tested
- [ ] Separate claims and overpayment detection tested on real database
- [ ] Verify payment only after real merchant ledger confirmation
- [ ] Refunds recorded only after external transfer, never automatically
- [ ] Steadfast dispatch and tracking working with actual consignment IDs

## Communication and privacy
- [ ] Sender domain/email verified; order received/verified/shipped/delivered emails tested
- [ ] Email failure retry and duplicate-delivery protections tested
- [ ] Guest tracking token cannot be guessed; another person's invoice inaccessible
- [ ] Chat opt-in, browser retention and account deletion tested
- [ ] Gemini free-tier eligibility/age/privacy terms reviewed before enabling
- [ ] Customer address/phone never sent to the LLM
- [ ] Delivery and warranty answers never invented by chatbot

## Security verification
- [ ] Dynamic API role checks, CSRF/Origin, rate limits, input validation tested
- [ ] Both owner accounts are provisioned with role `owner`; manager memberships cannot perform owner-only actions
- [ ] Product-review RLS, verified-purchase trigger and moderation authorization tested
- [ ] No service-role keys leaked in browser JavaScript, logs or repository
- [ ] Backups, incident escalation and account recovery documented
- [ ] Supabase service role scoped to server runtime; secrets rotated after suspected exposure

Only then switch `NEXORA_LIVE_ORDERS=true` and monitor test orders first.
