# FixMate (Client)

FixMate is an on-demand **Smart Device & Home Appliance Repair Service Booking Platform** frontend built with Next.js (App Router). Customers can browse approved services, request repairs, track job status, and pay via Stripe after completion. Technicians can manage services and job requests, and admins can moderate services, users, bookings, and transactions.

> This repository contains the **client only**. It is designed to work with a separate Express + MongoDB server API.

## Live URL

- Client: _add deployed client URL_
- Server: _add server repo/live URL_

## Admin Credentials

- Email: _add admin email_
- Password: _add admin password_

## Test Accounts

- Technician: _add technician credentials_
- Customer: _add customer credentials_

## Key Features

- Public pages: Home, Services (server-driven search/filter/sort), Service Details, About/How It Works
- Authentication: BetterAuth (email/password, role-based access for customer/technician/admin)
- Role-based dashboards:
  - **Customer:** overview, bookings, payments
  - **Technician:** overview, add service, my services (free-plan usage), requests, payments, subscription (Pro plan)
  - **Admin:** overview, users/roles, service approvals, bookings, transactions/revenue
- Profile management with ImgBB photo upload
- Stripe Checkout payment flow (success/cancel/verification pages)
- Shared UI patterns: badges, stats cards, empty states, confirmations, responsive layouts
- UX states: loading, not-found, error boundaries, toast feedback

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4 + shadcn/ui primitives
- BetterAuth (+ MongoDB adapter for auth handler)
- react-hook-form + zod
- sonner (toasts)
- recharts (charts)
- lucide-react + react-icons (X logo)
- ImgBB (image uploads)
- Stripe (checkout integration via server)

## Environment Variables

Create `.env.local` (or configure hosting env vars). See `.env.example`:

```bash
NEXT_PUBLIC_API_URL=            # Express server base URL
NEXT_PUBLIC_APP_URL=            # This client's URL
NEXT_PUBLIC_IMGBB_API_KEY=      # ImgBB upload key
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
MONGODB_URI=                    # only if BetterAuth runs in Next.js
```

The Stripe keys for the Pro Technician Plan live on the **server** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`). The server also reads `NEXT_PUBLIC_APP_URL` from this client environment to build Checkout success/cancel URLs.

> Never commit `.env.local`. Only `NEXT_PUBLIC_*` variables are available in client components.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env.local`.
3. Run development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run format` - format with Prettier
- `npm run typecheck` - TypeScript check

## Project Structure (high level)

- `app/(public)` - public pages and layout (Navbar/Footer)
- `app/(auth)` - sign-in/sign-up pages
- `app/dashboard` - role-based dashboard routes and profile
- `app/payment` - legacy Stripe success/cancel pages
- `app/dashboard/customer/payments/success` - shared booking payment success route
- `app/dashboard/technician/subscription/success` - shared Pro subscription success route
- `app/api/auth/[...all]` - BetterAuth route handler
- `components/layout` - Navbar, Footer, dashboard shell/sidebar/topbar, Logo
- `components/shared` - reusable UI (badges, stats, empty state, modal, cards)
- `lib` - auth, API wrapper, validators, ImgBB upload, constants
- `types` - shared TypeScript types

## NPM Packages Used

### Dependencies
- `@base-ui/react`
- `@better-auth/mongo-adapter`
- `@hookform/resolvers`
- `better-auth`
- `class-variance-authority`
- `cn`
- `lucide-react`
- `mongodb`
- `next`
- `next-themes`
- `react`
- `react-dom`
- `react-hook-form`
- `react-icons`
- `recharts`
- `shadcn`
- `sonner`
- `stripe`
- `tw-animate-css`
- `zod`

### Dev Dependencies
- `@tailwindcss/postcss`
- `@types/node`
- `@types/react`
- `@types/react-dom`
- `eslint`
- `eslint-config-next`
- `prettier`
- `prettier-plugin-tailwindcss`
- `tailwindcss`
- `typescript`

## Pro Technician Plan

Technician-only dashboard pages: `/dashboard/technician/subscription` (plan, Free vs Pro, upgrade/manage; `/dashboard/subscription` remains as a compatibility route) and `/dashboard/technician/payments` (booking payments plus receipts labelled “Pro subscription”).

- Free technicians can publish up to 3 services; My Services shows usage and disables **Add service** at the limit. The API still returns `403 PLAN_LIMIT_REACHED` for direct requests.
- Pro technicians get unlimited services and a teal **Verified Pro** badge in their dashboard header and subscription page.
- Cancelling/expiring Pro changes the plan back to Free without deleting existing services; new additions are blocked while at/above 3.
- Stripe webhooks (not the success redirect) grant and revoke the plan. See the server README for webhook events and local `stripe listen` setup. Test card: `4242 4242 4242 4242`.

## Payment Success Page

Both Checkout flows land on one shared success component:

- Booking: `/dashboard/customer/payments/success?session_id={CHECKOUT_SESSION_ID}`
- Pro: `/dashboard/technician/subscription/success?session_id={CHECKOUT_SESSION_ID}`

The page is API-driven, so refreshing works. It polls `GET /api/payments/verify` every 2 seconds for up to ~30 seconds while webhooks catch up, then shows the transaction details, copyable transaction ID, and receipt/print actions. Missing, invalid, failed, or other users' sessions show a safe error card. Both payment-history pages show the transaction ID and a "View receipt" link when Stripe provides one.

## Notes

- Server-driven behavior: services search/filter/sort and secure business rules should be enforced by the Express API.
- Stripe: client only initiates checkout and verifies sessions via server endpoints; never send payable amounts from the client.
- Some dashboard/service/request actions are scaffolded and require the corresponding backend endpoints/data to be fully operational.
- Add production domain to BetterAuth `trustedOrigins` and server CORS settings before deployment.
