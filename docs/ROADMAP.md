# Nexora roadmap — preview to production

## Milestone 1 (in repository)
- Next.js responsive storefront; illustrative products and categories
- Demo cart using local browser storage; simulated checkout
- Rule-based demo catalog assistant with optional local conversation history
- Locked admin placeholder and basic security response headers
- No live payments, no private customer information, no real email sending

## Milestone 2
- Owner-verified brand assets, product photos, prices, colors, warranties and stock
- Supabase PostgreSQL schema with RLS, admin MFA, two-owner permissions
- Real catalog API with caching/revalidation and safe stock transactions
- Guest checkout with privacy notice, idempotent order insertion, payment claim verification
- bKash/Nagad merchant receipt reconciliation, COD support and refunds
- Email outbox and reliable transactionally queued notifications
- Steadfast merchant workflow and customer order tracking

## Milestone 3
- Gemini API *only if* current free-tier terms allow all target users and no billing is required
- Do not send any customer PII, orders, payment IDs or private chat data to Gemini
- Database-grounded chat answers and disabled/fallback behavior when quota exceeded
- Signed-in customer history (opt-in), consent, retention, delete controls
- Formal accessibility, performance, security, backup and recovery testing

## Hosting and billing
- Preview: Vercel deployment with *no real selling* and no external payment credentials
- Vercel Hobby plan restricts commercial use; move paid orders to commercial-permitted hosting before launch.
- No credit card, paid API, billing automation or auto upgrades.
- Domain can be attached later without changing core product identifiers.
