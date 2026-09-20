# Digital Heroes Architecture

This document describes the folder layout, database schema ER diagram, request sequence flows, and scalability considerations for the Digital Heroes platform.

---

## Folder Structure

```
digital heroes prd/
├── .env.local
├── .env.example
├── README.md
├── ASSUMPTIONS.md
├── ARCHITECTURE.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── vitest.config.ts
├── supabase/
│   └── migrations/
│       └── 0001_init.sql
├── scripts/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (public)/
│   │   │   ├── charities/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── how-it-works/page.tsx
│   │   │   └── results/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── DashboardClient.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── draws/page.tsx
│   │   │   ├── charities/page.tsx
│   │   │   ├── winners/page.tsx
│   │   │   └── reports/page.tsx
│   │   └── api/
│   │       ├── stripe/
│   │       ├── webhooks/stripe/
│   │       ├── scores/
│   │       ├── numbers/
│   │       ├── profile/
│   │       ├── winners/
│   │       └── admin/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── stripe.ts
│   │   ├── zod-schemas.ts
│   │   ├── draw-engine.ts
│   │   └── utils.ts
│   ├── components/
│   │   ├── navigation/
│   │   ├── shared/
│   │   └── ui/
│   └── tests/
│       └── draw-engine.test.ts
```

---

## Data Model (Mermaid ER Diagram)

```mermaid
erDiagram
    PROFILES ||--o{ SUBSCRIPTIONS : owns
    PROFILES ||--o{ SCORES : records
    PROFILES ||--o{ PAYMENTS : pays
    PROFILES ||--o{ WINNERS : wins
    CHARITIES ||--o{ PROFILES : designated_by
    CHARITIES ||--o{ CHARITY_EVENTS : hosts
    CHARITIES ||--o{ PAYMENTS : receives
    CHARITIES ||--o{ DONATIONS : receives
    DRAWS ||--o{ DRAW_ENTRIES : includes
    DRAWS ||--o{ WINNERS : produces

    PROFILES {
        uuid id PK
        string full_name
        string role
        uuid charity_id FK
        int charity_percentage
        int_array lucky_numbers
        timestamptz created_at
    }

    CHARITIES {
        uuid id PK
        string name
        string slug
        string category
        boolean is_featured
        boolean is_active
    }

    SUBSCRIPTIONS {
        uuid id PK
        uuid user_id FK
        string stripe_customer_id
        string plan
        string status
    }

    SCORES {
        uuid id PK
        uuid user_id FK
        int score
        date played_on
    }

    DRAWS {
        uuid id PK
        date period_month
        string mode
        int_array winning_numbers
        string status
        int total_pool_pence
        int rollover_in_pence
        int rollover_out_pence
    }

    WINNERS {
        uuid id PK
        uuid draw_id FK
        uuid user_id FK
        int tier
        int prize_amount_pence
        string verification_status
        string payment_status
    }
```

---

## Request Flows

### 1. Subscription & Payment Splitting Flow

```mermaid
sequenceDiagram
    autonumber
    actor Subscriber
    participant NextApp as Next.js App Router
    participant Stripe as Stripe Checkout
    participant Webhook as /api/webhooks/stripe
    participant Supabase as Supabase Postgres

    Subscriber->>NextApp: Submit Signup Form (Charity + % + Plan)
    NextApp->>Stripe: Create Checkout Session (metadata: userId, charityId, %)
    Stripe-->>Subscriber: Render Payment UI
    Subscriber->>Stripe: Complete Payment (£20/mo)
    Stripe->>Webhook: Event: checkout.session.completed
    Webhook->>Supabase: Upsert Subscription (status = 'active')
    Webhook->>Supabase: Split Payment (Charity % & £5 Prize Pool)
    Webhook->>Supabase: Insert Payments Row
```

### 2. Draw Simulation & Publication Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant AdminUI as /admin/draws
    participant DrawAPI as /api/admin/draws/[id]/publish
    participant Engine as src/lib/draw-engine.ts
    participant DB as Supabase Postgres

    Admin->>AdminUI: Click "Simulate Draw"
    AdminUI->>Engine: Run random or algorithmic weighted sampling
    Engine-->>AdminUI: Render Winning Numbers & Prize Splits
    Admin->>AdminUI: Click "Publish & Lock Draw"
    AdminUI->>DrawAPI: POST Publish Draw Request
    DrawAPI->>DB: Snapshot Entries into draw_entries
    DrawAPI->>DB: Write Winners Rows into winners (verification = 'not_submitted')
    DrawAPI->>DB: Lock Draw (status = 'published', rollover_out stored)
    DrawAPI-->>AdminUI: Draw Locked & Published
```

---

## Scalability & Performance Strategy

1. **Database Indexing**:
   - Unique composite index on `scores(user_id, played_on)` for instant duplicate date lookups.
   - Index on `subscriptions(status, user_id)` for high-speed active subscriber filtering during draw simulation.
   - Foreign key indexes on `winners(draw_id)` and `draw_entries(draw_id)`.

2. **Draw Snapshotting Rationale**:
   - Entry configurations and match counts are snapshotted into `draw_entries` at draw execution time. This guarantees that user score updates or profile edits after a draw runs can never corrupt historical draw audits.

3. **Caching & Queue Architecture at Scale**:
   - **Static Revalidation**: Public directory pages (`/charities`, `/results`) use Next.js `revalidate = 60` for ISR caching.
   - **Background Queue**: For scale beyond 100,000 active subscribers, draw calculation and proof image processing would be offloaded to an asynchronous background worker queue (e.g. QStash / BullMQ) with chunked batch DB writes.
