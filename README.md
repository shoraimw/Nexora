# Nexora — Premium Gadget E-Commerce Project

> **Status: DEVELOPMENT PREVIEW ONLY — NOT A LIVE SHOP.** This version intentionally uses demo product data and does not collect customer PII, accept orders, verify payments, or send email.

### Built for
Wajidullah Shoraim and the Nexora team. GitHub: https://github.com/shoraimw/Nexora

### Tech
Next.js (App Router), React, TypeScript, CSS, Lucide icons. No external keys or backend accounts required to preview the site.

### Local run
```bash
npm install
npm run dev
npm run typecheck
npm run build
```
Visit http://localhost:3000.

### Implemented now
- Responsive homepage with curated category tabs, demo products and search
- Product-detail routes and localStorage demo cart
- bKash, Nagad and COD checkout *preview* (submission disabled)
- Basic catalog/FAQ chatbot at /api/chat (no Gemini, no live product inventory)
- Optional device-local chat history (consent control + delete)
- Locked /admin page; no insecure public dashboard
- Security headers; robots noindex; sample data visibly labelled
- Zero API keys, zero payment acceptance, zero paid services

### Next
Connect Supabase (free plan), migrate owner-confirmed product catalog, configure private admin accounts with MFA, implement stock-safe server-side orders, transaction ID reconciliation, invoicing and email, Steadfast shipping, then add Gemini only if appropriate free-tier eligibility and customer privacy terms are met. See docs/ROADMAP.md.

### Deploy
Import this repository into a Vercel project configured as **development preview**. Next.js should auto-detect; no environment variables are required. Do not enable real orders on a Vercel Hobby plan: it restricts commercial use even for student businesses. For commercial launch choose hosting that permits sales without billing, or a plan separately approved by owners.

### Branding
The included N icon is a **temporary placeholder**, not Nexora's final approved logo. Replace it with the actual transparent branding asset when supplied.

**Never commit secrets**, especially SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, receiving-account information or customer data. No billing accounts, paid APIs or automatic upgrades are configured.
