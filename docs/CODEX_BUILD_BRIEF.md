# Nexora — Full Website Build Brief for Codex

## Assignment

Repository: https://github.com/shoraimw/Nexora  
Start branch: `codex/nexora-full-build`  
Product: Nexora — Bangladesh-focused gadget and everyday-tech e-commerce storefront.

Read the root `AGENTS.md` first and follow it throughout the task.

Build and polish the entire Nexora website—not just a landing-page mockup. Audit the existing implementation, preserve useful features, finish incomplete journeys, redesign weak UI, implement missing behavior where it is safe, and verify the result. Work autonomously through implementation and QA; do not stop at a plan or a list of suggestions.

## Owner's design preferences

- The result should feel like a real, established, premium electronics retailer: clean, confident, product-first, trustworthy, fast, and visually memorable.
- Use StarTech as a reference for retail information architecture and shopping usability, not as a pixel-perfect clone. Keep Nexora's own logo, brand identity, copy, and visual system.
- The owner previously rejected realistic 3D product scenes. Do not reintroduce Three.js, WebGL, 3D product models, or a 3D showroom. Use strong 2D product photography, carefully composed editorial banners, and restrained CSS motion.
- Keep the original Nexora brand assets and the current navy/blue + warm orange direction unless the audit proves a better cohesive palette.
- Avoid generic templates and visual clutter. Give every section a purpose and remove repetitive or empty sections.
- Make mobile feel intentionally designed, not a compressed desktop layout.
- The hero should auto-advance every 6.5 seconds and should not show Play/Pause controls. Respect reduced-motion and page visibility.

## Current repository facts to verify before acting

- Stack in `package.json`: Next.js 15, React 19, TypeScript, Supabase JS, Zod, and lucide-react.
- The home route switches between configured commerce mode and non-transactional preview mode based on server configuration.
- The repository already contains customer storefront, category taxonomy, product pages, filtering, cart/checkout, account, admin, chatbot, order tracking, manual payment claims, review moderation, offer management, SQL migrations, and security primitives. Inspect these instead of replacing them blindly.
- Latest mainline commit at brief creation: `06be0ee54df3fc599db6c7a478ceaf2534a6b59c`. It contains the recent single controlled mega-menu fix. Preserve its behavior.
- The Vercel project currently has no environment variables visible through the connected project metadata, and the repo documentation says Supabase/live commerce configuration is pending. Re-check current state; never assume credentials are configured.
- The current documented launch checklist is `docs/GO_LIVE_CHECKLIST.md`; setup details are in `docs/SETUP.md`.

## Required scope

### 1. Audit and architecture
- Map every route, shared layout, API route, server action, database migration, test, and preview/configured mode.
- Identify unfinished flows, dead links, visual inconsistencies, duplicate CSS, accessibility gaps, unsafe assumptions, and runtime errors.
- Make a prioritized implementation plan, then execute it.
- Keep existing routes and database contracts backward-compatible unless a migration is justified and documented.

### 2. Full storefront design
- Header with clear utility information, Nexora logo, useful search, account/cart actions, offers when active, and responsive navigation.
- Single desktop mega-menu with click-to-pin, toggle, category switching, outside click, Escape, focus, and route dismissal. No overlapping or stuck menu.
- Mobile navigation drawer with proper focus, touch targets, and dismissal.
- Strong hero with 6.5-second auto-rotation, no Play/Pause controls, meaningful CTAs, accessible inactive slides, reduced-motion handling, and no layout shift.
- Purposeful category discovery, active promotion banners, featured/trending/new-arrival/student-pick sections, brand directory, trust/service information, and a polished footer.
- Hide empty or inactive promotional sections. Do not invent discounts or promotions.
- Add clear breadcrumbs, page headings, loading states, empty states, error states, and useful 404 behavior.

### 3. Product discovery and product detail
- Search with sensible suggestions and keyboard navigation.
- Functional category/subcategory navigation and filters for brand, wired/wireless, price, availability, sale, and sorting.
- Product cards with consistent image crops, clear product naming, brand, truthful price/discount, stock state, authentic ratings, and useful actions.
- Product detail pages with gallery, variants, specifications, description, price, stock, reviews, delivery/warranty data only when configured, and related products.
- Make image failures graceful and prevent broken remote images.
- Preview products must be explicitly marked as demo/illustrative. Never label sample inventory as real stock.

### 4. Cart and checkout
- Test add/remove/change quantity, cart persistence, variant selection, subtotal, delivery, coupon, and final totals.
- Server must recalculate all prices and delivery charges; never trust client-supplied totals.
- Support guest checkout and signed-in customer checkout when configured.
- COD and manual bKash/Nagad transaction-reference claims must be represented honestly.
- Prevent duplicate submissions and transaction IDs, reserve stock atomically, and roll back failed transactions safely.
- Keep real checkout disabled until all go-live conditions pass. Never simulate successful payment verification.

### 5. Customer account and order experience
- Verify sign-up/sign-in, profile, order history, guest tracking, private invoice access, order timeline, and account deletion/privacy flows.
- Prevent one customer from accessing another customer's order, invoice, chat history, or personal data.
- Make delivery and return policy information easy to find and consistent with configured store data.

### 6. Owner admin
- Preserve two-owner role-based access. Do not invent owner IDs/emails or bypass server authorization.
- Complete product/category/variant CRUD, stock and image uploads, order management, payment-claim review, coupon/offer scheduling, FAQ/settings, delivery-zone management, review moderation, email retry, and audit history.
- Confirm destructive actions and show clear success/error feedback.
- Never mark a payment verified without owner confirmation against the real merchant ledger.
- Keep refunds and courier dispatch as documented manual external actions unless a real approved integration exists.

### 7. Catalog-grounded support chatbot
- Answer product availability, price, variants, categories, and FAQs only from current database/catalog/store-policy data.
- Never invent delivery dates, warranties, inventory, or payment state.
- Keep retrieval/rules behavior available without an LLM.
- Gemini remains optional and OFF by default; only use it if current free-tier, privacy, age, and terms requirements are verified. Do not add paid AI APIs or send personal customer data to any model.

### 8. Security, privacy, and operations
- Review all API routes and RLS policies; test unauthenticated, customer, manager (if supported), and owner access boundaries.
- Keep service-role and all secrets server-only.
- Verify origin/CSRF protections, rate limits, Zod validation, upload validation, idempotency, tracking-token hashing, private invoice access, and safe error messages.
- Do not weaken protections to make tests pass.
- Keep health endpoints non-sensitive.
- Do not commit credentials, real customer data, real transactions, or environment files.
- Preserve the $0-first constraint. Do not add paid APIs, credit-card requirements, subscriptions, or automatic billing.
- Vercel Hobby remains preview-only under the project's documented commercial restriction. Do not enable live sales on it.

### 9. Visual and functional QA
Test at minimum:
- Desktop: 1440×900 and 1280×800.
- Tablet: 768×1024.
- Mobile: 390×844 and 360×800.
- Homepage, category mega-menu, mobile drawer, search, filters, product details, cart, preview checkout, account, tracking, chatbot, and admin access boundaries.
- Keyboard-only navigation, focus states, Escape/outside click, reduced motion, and touch behavior.
- Broken images, horizontal overflow, console errors, and major layout shifts.

Run the repository's actual checks:
```bash
npm install
npm test
npm run typecheck
npm run build
```
Use existing visual/browser QA scripts where available. If a command cannot run due to missing credentials, browser tooling, or environment limits, state that honestly and test the safe alternative.

## Constraints and final delivery

- Do not copy another retailer's exact design, product catalogue, proprietary photos, or text.
- Do not invent real products, prices, ratings, reviews, stock, payment numbers, shipping rates, policies, or credentials.
- Do not add a 3D showroom.
- Do not switch on `NEXORA_LIVE_ORDERS`, deploy a live sales flow, or merge to main without explicit owner approval.
- Create a clear implementation summary, test report, and screenshots if the environment supports them.
- Commit the work on a dedicated Codex feature branch and open a pull request to `main`. Do not merge it automatically.
- If owner-supplied assets, catalog data, credentials, or business decisions are missing, finish everything possible in safe preview mode and list the exact remaining inputs at the end.
