# Nexora — Codex Engineering Instructions

These instructions apply to every Codex task in this repository. Treat this as a real Bangladesh-focused gadget-commerce product, not a disposable mockup.

## Mission and working standard

Act as a senior product engineer, visual designer, accessibility specialist, security-minded backend engineer, and QA owner. Build and refine Nexora end to end. Do not stop after giving a plan: inspect the repository, make the implementation, run the available checks, fix issues, and report evidence.

Work from the existing codebase. Preserve working behavior and established architecture unless you can explain why a change is necessary. Avoid superficial rewrites, placeholder-only implementations, and unrelated dependency churn.

## Read before changing code

Start by reading:
- `README.md`
- `docs/SETUP.md`
- `docs/GO_LIVE_CHECKLIST.md`
- `package.json`
- all relevant files under `app/`, `components/`, `lib/`, `database/`, and `tests/`

Inspect the current branch and recent history. The category mega-menu fix in the recent mainline commit is intentional; do not regress it. Map the customer, admin, API, database, and preview-mode flows before making broad changes.

## Product and design direction

Create a polished, trustworthy, premium gadget-shopping experience under the original Nexora identity.

- Use the existing Nexora logo and brand assets. Keep the established navy/blue and warm orange identity unless a measured design improvement is clearly justified.
- Take structural inspiration from strong Bangladesh electronics retailers (clear product discovery, category navigation, useful filters, confidence-building information), but create original Nexora layouts, copy, components, and styling. Do not clone another retailer pixel-for-pixel or copy its proprietary text, images, product catalogue, or branding.
- "Realistic" means a credible, production-quality retail experience: real product photography where licensed/available, believable product layouts, accurate information hierarchy, responsive behavior, polished typography, subtle motion, useful empty/loading/error states, and consistent details.
- Do NOT add realistic 3D product models, WebGL, Three.js scenes, or heavy 3D interactions. The owner previously asked to remove that direction. Prefer excellent 2D product photography and lightweight CSS motion.
- Avoid generic AI-template aesthetics, excessive gradients, giant rounded cards, gratuitous glassmorphism, over-animated transitions, fake trust badges, fake ratings, fake discounts, or invented testimonials.
- Use consistent spacing, type scale, color tokens, component states, hover/focus/pressed states, and responsive breakpoints. Prefer maintainable shared components over page-specific CSS patches.
- Make desktop, tablet, and mobile layouts intentionally designed. Test narrow widths, touch interactions, sticky elements, drawers, and overlays.
- Use optimized local assets and the existing image pipeline where practical. Never leave broken images. Do not hotlink images that are not licensed/available for the project. Add useful alt text.
- Keep the site fast: avoid unnecessary client components, large dependencies, layout shifts, and unoptimized media.

## Homepage and navigation

- Build a convincing retail homepage with a strong hero, useful category discovery, curated product sections, brand discovery, active offers, and shopping reassurance. Every section must have a working destination and should only display when it has meaningful data.
- Hero carousel target interval: 6.5 seconds. No visible Play/Pause controls unless the owner explicitly asks. Respect `prefers-reduced-motion`, pause when the tab is hidden, avoid inaccessible focus traps, and keep links in inactive slides out of keyboard navigation.
- Preserve a single controlled desktop category mega-menu. It must support click-to-pin, click-again-to-close, switching categories, outside-click dismissal, Escape dismissal, link navigation dismissal, keyboard focus, and no stacked/overlapping panels.
- Preserve and improve the mobile navigation drawer separately. Ensure menu layers do not block page interaction after closing.
- Search should be useful, keyboard accessible, and connected to the real catalogue when configured.

## Catalogue and product experience

- Support the existing category hierarchy and routes. Keep category, subcategory, brand, wired/wireless, price, availability, sale, and sorting filters consistent between the UI and query logic.
- Product cards should prioritize product photography, readable product names, authentic brand, current price, legitimate compare-at price, stock state, rating/review count only when real, and clear product/cart actions.
- Product detail pages should support gallery, description, technical specifications, variants, price, stock, delivery/warranty information, and verified-purchase reviews.
- Never invent real stock, warranty terms, ratings, customer reviews, delivery promises, product specifications, or sale prices.
- When Supabase is not configured, keep preview/demo mode clearly labelled. Demo items must be visibly illustrative and must never masquerade as live inventory or allow real orders.
- Ensure no-database preview controls are honest: disable or clearly explain actions that cannot complete without backend configuration.

## Commerce behavior

Preserve and verify the existing intended flows:
- Guest checkout and signed-in customer flows.
- Cart add/remove/quantity changes and server-calculated totals.
- COD and manual bKash/Nagad payment claims with transaction reference capture.
- Delivery-zone fees, order confirmation, order status, customer tracking, and invoice.
- Coupons and owner-managed scheduled offers.
- Order stock reservation and rollback behavior, duplicate prevention, idempotency, and safe handling of simultaneous orders.
- Email outbox/retry behavior where configured.
- Manual courier/Steadfast consignment tracking where configured.

Never claim a payment is verified from a submitted transaction ID alone. Owners must verify against the genuine merchant ledger. Never automatically transfer or refund money. Never enable real checkout just to make a demo look complete.

## Accounts and two-owner admin

- Preserve secure sign-up/sign-in, customer account, order history, profile, and private tracking.
- Admin authorization must be enforced on the server, not just hidden in the UI.
- Only the two explicitly provisioned owner memberships may perform owner-only actions. Do not invent owner email addresses or user IDs.
- Build coherent owner workflows for product/category/variant CRUD, stock, safe image uploads, order processing, payment claims, coupons/offers, FAQ, delivery settings, review moderation, email retry, and audit history.
- Customer reviews must remain private until verified-purchase and owner-moderation rules pass.
- Make destructive actions explicit, confirmed, and auditable.

## Chat assistant

- Keep answers grounded in the public, current product catalogue and configured store policies.
- Never invent price, stock, variants, warranty, delivery time, payment status, or return policy.
- Never send customer addresses, phone numbers, payment details, private order data, or other personal data to an LLM.
- Rules/catalog retrieval must continue to work without an LLM. Gemini is optional, must remain disabled by default, and may only be enabled after free-tier availability, privacy, age, and terms eligibility are checked. Do not introduce a paid AI dependency.

## Security, privacy, and data integrity

- Treat `SUPABASE_SERVICE_ROLE_KEY`, tracking/rate-limit secrets, email keys, and AI keys as server-only secrets. Never expose them in client bundles, logs, errors, screenshots, commits, or documentation examples with real values.
- Never commit `.env`, `.env.local`, credentials, tokens, real customer records, real order details, or private exports.
- Preserve and test Row Level Security, least-privilege grants, server-side owner checks, bearer-token verification, input validation (Zod where appropriate), origin/CSRF protections, rate limits, upload MIME/magic-byte/size checks, idempotency, and private invoice/tracking access.
- Do not weaken security to make a UI demo pass. Fail closed when critical configuration is missing.
- Do not expose private customer data in the chatbot, public API, health endpoint, logs, or client-side state.
- Keep health/status endpoints non-sensitive.

## Hosting and cost constraints

- Follow the repository's $0-first approach: no paid APIs, subscriptions, credit-card requirements, automatic upgrades, or surprise billing.
- Do not add paid third-party services or change providers without explicit approval.
- Vercel Hobby is for development/preview only under the project's documented constraints; do not present it as approved for commercial sales. Keep production checkout disabled until a commercially permitted hosting setup and all launch checks are complete.
- Never set `NEXORA_LIVE_ORDERS=true`, add real payment receiver details, provision owner accounts, create external merchant/courier transactions, or enable production sales without explicit owner action.

## Engineering and QA workflow

1. Audit the actual current implementation and identify what works, what is incomplete, and what is unsafe.
2. Write a short implementation plan with prioritized milestones, then execute it.
3. Reuse existing dependencies and patterns. Add dependencies only when they materially improve the product and are justified.
4. Keep TypeScript strict and fix type errors rather than suppressing them.
5. Add/update tests for behavior changes and important regressions.
6. Run:
   - `npm test`
   - `npm run typecheck`
   - `npm run build`
7. Use the repository's existing visual/browser QA scripts if present. If browser automation is available, test key desktop and mobile journeys, not just static screenshots.
8. Check keyboard navigation, focus visibility, accessible names, contrast, reduced motion, console errors, broken images, overflow, and layout shifts.
9. Test both configured and unconfigured preview behavior where possible. Do not pretend to have tested a live Supabase project if no credentials/project are available.
10. Fix all failures caused by your changes. Clearly distinguish tests run from tests not run.

## Definition of done

A task is not done merely because the homepage looks attractive. Deliver a coherent, responsive, accessible, functional experience across homepage, search, category, product detail, cart, checkout preview, customer account, order tracking, help/policies, chatbot, and owner admin. Preserve the existing security and launch boundaries.

At completion, report:
- What changed and why.
- Which pages and journeys were implemented or improved.
- Exact test/build commands and their actual results.
- Browser/device viewports and interactions actually checked.
- Any blockers requiring owner-supplied assets, product data, Supabase credentials, payment details, or policy decisions.
- The branch and pull request containing the work.

Do not merge to main or deploy a live production sales flow without explicit approval.
