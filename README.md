# Digital Heroes

Digital Heroes is a full-stack subscription platform for golfers that seamlessly combines rolling golf score tracking (5 scores, 1–45 range), a monthly number-match jackpot draw, and transparent charitable giving.

Subscribers pay monthly (£20) or yearly (£200), keep their last 5 golf scores up to date, pick 5 lucky numbers, are entered into monthly jackpot draws, and direct a minimum of 10% of their subscription fee to a chosen partner charity.

---

## Technical Stack

- **Framework**: Next.js (latest App Router) with strict TypeScript mode
- **Styling & UI**: Tailwind CSS, CSS Custom Properties, Glassmorphism, Framer Motion
- **Database & Storage**: Supabase PostgreSQL, Storage Buckets, Row Level Security (RLS)
- **Payments**: Stripe Checkout Sessions & Webhook Handlers
- **Validation**: Zod input validation on all API endpoints
- **Testing**: Vitest unit test suite

---

## Local Setup Instructions

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd digital-heroes
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_SEED_EMAIL=admin@digitalheroes.test
ADMIN_SEED_PASSWORD=Admin#2026
```

### 3. Run Database Migrations
Apply the PostgreSQL migration schema located at `supabase/migrations/0001_init.sql` to your Supabase project.

### 4. Seed Database
Execute the idempotent seed script:
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Quality Verification

Run unit tests for rolling score logic, duplicate date rejection, score range bounds, match calculation, prize splitting with ties, and rollover arithmetic:
```bash
npm run test
```

Run Next.js production build verification:
```bash
npm run build
```

---

## Deployment Steps (Vercel & Stripe)

1. **Git Commit**: Commit all project files to main branch.
2. **Vercel Project**: Import repository into Vercel and add environment variables listed in `.env.local`. Ensure `NEXT_PUBLIC_SITE_URL` points to your production domain (e.g. `https://digitalheroes.vercel.app`).
3. **Stripe Webhook**:
   - Add endpoint URL: `https://<domain>/api/webhooks/stripe`
   - Subscribe to events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET` in Vercel.
4. **Seed Production Database**:
   ```bash
   npx tsx scripts/seed.ts
   ```

---

## Test Credentials

| Account Role | Email Address | Password | Notes |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@digitalheroes.test` | `Admin#2026` | Full access to `/admin` dashboard |
| **Demo Subscriber** | `demo@digitalheroes.test` | `Demo#2026` | Active sub, 5 scores, lucky numbers |

### Stripe Test Card
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g. `12/28`)
- **CVC**: Any 3 digits (e.g. `123`)
- **Postal Code**: Any valid code (e.g. `SW1A 1AA`)
