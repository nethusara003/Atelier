# Atelier Voss — Premium Digital Gallery

A complete, production-ready full-stack web application for an independent art & craft
artist. High-end digital gallery aesthetic: warm neutrals, editorial layouts, serif
typography, film grain, and restrained, luxurious motion.

**Artist persona:** Elena Voss — painter & ceramicist, Atelier Voss, Paris (fictional,
with realistic sample catalogue, journal and press).

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript 5 (strict) |
| Styling | Tailwind CSS 3, PostCSS, `next/font` (Cormorant Garamond + Inter) |
| Motion | Framer Motion (reveals, drawer, page transitions) + GSAP ScrollTrigger (hero parallax) |
| Database/Auth/Storage | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Payments | PayHere (default) or Stripe via PAYMENT_PROVIDER |
| Email | Resend (optional; console-log fallback in dev) |
| Validation | Zod, client + server |

## Project structure

```
atelier-gallery/
├── src/app/                    # Routes (App Router)
│   ├── page.tsx                # Home: hero, intro, collections, works, process, press, journal, newsletter
│   ├── gallery/                # Filterable artwork grid (category, collection, material, availability, price)
│   ├── artwork/[slug]/         # Detail: zoom gallery, story, specs, purchase panel, JSON-LD
│   ├── about/ commissions/ journal/ contact/
│   ├── cart/ checkout/          # Cart page + provider checkout flow (PayHere/Stripe)
│   ├── account/                # Order history + saved artworks (auth-guarded)
│   ├── login/ signup/
│   ├── admin/                  # Role-guarded dashboard: products, collections, orders,
│   │                           # commissions, journal, enquiries, settings
│   ├── api/
│   │   ├── checkout/session/   # Creates pending order (service role) → payment provider
│   │   ├── webhooks/{payhere,stripe}/  # Verified callbacks; paid → stock decrement + emails
│   │   ├── contact/ commissions/ newsletter/
│   ├── sitemap.ts robots.ts layout.tsx globals.css
├── src/components/             # ui/ layout/ motion/ gallery/ artwork/ cart/ admin/ seo/ auth/ …
├── src/lib/                    # supabase clients, payhere/stripe, orders, email, validations,
│                               # admin actions (server), admin-auth, format, constants
├── src/types/database.ts       # Hand-written DB types
├── supabase/
│   ├── schema.sql              # Full DDL: tables, indexes, RLS, storage, triggers, is_admin()
│   └── seed.sql                # Elena Voss catalogue: 12 artworks, 3 collections, 4 posts, testimonials
├── scripts/generate-images.mjs # Sharp script → tasteful abstract imagery in public/images/
└── public/images/              # Generated artwork, journal + studio imagery
```

**Demo mode:** without Supabase/payment env vars the site runs on the bundled dataset
(`src/lib/mock-data.ts`, mirroring `seed.sql`) so every page renders. The admin shows
sample data with a “Demo mode” banner and disabled mutations. Configure env to go live.

## Prerequisites

- Node.js 18.17+
- A Supabase project (free tier works)
- A PayHere business account (sandbox.payhere.lk for testing)
- Optional: a Resend API key for email

## Setup

### 1. Install
```bash
npm install
```

### 2. Create the database
In your Supabase project → **SQL Editor**, run in order:
1. `supabase/schema.sql` — tables, indexes, RLS policies, storage buckets, triggers
2. `supabase/seed.sql` — artist catalogue and content

Or with the Supabase CLI:
```bash
supabase db push   # if you keep the SQL files under supabase/migrations/
```

### 3. Storage buckets
`schema.sql` creates them (`artworks`, `journal` public; `commission-references` private).
To serve artwork images from Storage instead of `public/images/`, upload the generated
files and replace the `/images/…` paths in `seed.sql` (or via the admin product editor).

### 4. Environment
```bash
cp .env.example .env.local
```
Fill in:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `PAYMENT_PROVIDER=payhere` (default) plus `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, `PAYHERE_SANDBOX=true`
- `RESEND_API_KEY` (optional), `EMAIL_FROM`, `ADMIN_EMAIL`
- `NEXT_PUBLIC_SITE_URL`

### 5. Promote an admin user
Sign up at `/signup`, then in the Supabase SQL editor:
```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

### 6. PayHere setup
1. Create a business account at [payhere.lk](https://www.payhere.lk) — for testing,
   create a separate account at [sandbox.payhere.lk](https://sandbox.payhere.lk).
2. In your PayHere account find your **Merchant ID** and **Merchant Secret** and
   put them in `.env.local` (`PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`).
   Keep `PAYHERE_SANDBOX=true` until you go live, then flip it to `false` and
   swap in your live credentials.
3. Run the payment migration in the Supabase SQL editor:
   `supabase/migrations/002_payhere.sql` (adds `payment_provider` /
   `payment_reference` to `orders`).
4. PayHere's `notify_url` (`/api/webhooks/payhere`) must be publicly reachable —
   it cannot call `localhost`. For local testing, expose your dev server with a
   tunnel (e.g. `npx localtunnel --port 3000`) and set `NEXT_PUBLIC_SITE_URL` to
   the tunnel URL for that session; on Vercel it works out of the box.
5. PayHere notifies with `md5sig`-signed form posts; the webhook verifies the
   signature, cross-checks the amount against the order in your DB, then marks
   the order `paid`, decrements stock, and emails buyer + admin. Status `2` =
   success, `0` = pending, `-1/-2/-3` = cancelled/failed/charged back.

> **Stripe (optional):** set `PAYMENT_PROVIDER=stripe` and fill in the Stripe
> keys to use Stripe Checkout instead. Note: Stripe does not support Sri Lankan
> businesses receiving payments, so PayHere is the right default for LK. The
> Stripe webhook endpoint is `https://your-domain.com/api/webhooks/stripe`
> (events: `checkout.session.completed`, `payment_intent.payment_failed`).

### 7. Run
```bash
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

### 8. Regenerate imagery (optional)
```bash
npm run generate:images   # deterministic abstract art via sharp → public/images/
```

## Deployment to Vercel

1. Push this repo to GitHub (no secrets — `.env*` is gitignored).
2. Import the project in Vercel.
3. Add **all** variables from `.env.example` in Project → Settings → Environment Variables.
4. Deploy. Then set `NEXT_PUBLIC_SITE_URL` to the production URL (used for OG tags,
   sitemap, JSON-LD, and the PayHere `return_url`/`cancel_url`/`notify_url`).
5. Supabase Auth → URL Configuration: add the production URL to redirect URLs.

## Key design decisions

- **Server-first data layer** (`src/lib/data.ts`): every public page is a server component
  reading Supabase (or demo data). Filters that need joins are applied in JS to keep
  queries simple and RLS-friendly.
- **Checkout never trusts client prices**: `/api/checkout/session` re-fetches each
  artwork with the service-role client, verifies stock/status, and builds the
  payment from DB prices. Orders start `pending`; the payment webhook moves them
  to `paid` and decrements `stock` / `edition_available` (one-of-one → `sold` at
  zero). Handlers are idempotent against provider retries.
- **Payments are provider-switched** (`PAYMENT_PROVIDER`): PayHere is the default
  (redirect form-POST with a server-generated MD5 `hash`; `md5sig`-verified
  `notify_url` webhook at `/api/webhooks/payhere`; shared fulfilment logic in
  `src/lib/orders.ts`). Stripe Checkout remains available via `PAYMENT_PROVIDER=stripe`.
- **RLS**: public read only for published catalogue/journal/testimonials; public insert
  for commissions/inquiries/newsletter; everything else via `is_admin()` or the
  service-role API routes. Storage: public `artworks`/`journal`, private
  `commission-references` (per-user folders).
- **Admin** uses server actions with a role check (`requireAdminAction`) — mutations
  revalidate the affected routes. The admin layout redirects non-admins server-side.
- **Motion**: Framer Motion for reveals/stagger/drawer/page transitions; GSAP
  ScrollTrigger for hero parallax + clip reveal. `Reveal`/`TextReveal`/`ParallaxImage`
  all respect `prefers-reduced-motion`, plus a global CSS kill-switch.
- **SEO**: per-page metadata, dynamic OG for artwork/journal, `sitemap.ts`,
  `robots.ts`, JSON-LD (Product, Person, Organization, BreadcrumbList), semantic HTML,
  alt text, `next/image` with sizes.

## Manual steps only you can do

- [ ] Create the Supabase project and run `schema.sql` + `seed.sql` + `migrations/002_payhere.sql`
- [ ] Create a PayHere business account (sandbox for testing); copy Merchant ID + Secret
- [ ] (Optional) Create a Resend API key and verify your sending domain
- [ ] Sign up in the app and promote yourself to admin with the SQL above
- [ ] Replace generated placeholder imagery with real photography when ready
      (upload to Supabase Storage `artworks` bucket and update image URLs in admin)
- [ ] Set production env vars in Vercel and update `NEXT_PUBLIC_SITE_URL`
- [ ] Test a full checkout in PayHere sandbox before going live (flip `PAYHERE_SANDBOX=false` + live keys for production)
