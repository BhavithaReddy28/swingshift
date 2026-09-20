-- Digital Heroes Database Migration
-- Section 4 Database Schema & RLS Policies

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('subscriber', 'admin');
CREATE TYPE subscription_plan AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'lapsed');
CREATE TYPE draw_mode AS ENUM ('random', 'algorithmic');
CREATE TYPE draw_status AS ENUM ('draft', 'simulated', 'published');
CREATE TYPE verification_status_enum AS ENUM ('not_submitted', 'pending', 'approved', 'rejected');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid');

-- 1. Charities Table
CREATE TABLE public.charities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    hero_image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'subscriber'::user_role NOT NULL,
    charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    charity_percentage INT DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
    lucky_numbers INT[] CHECK (cardinality(lucky_numbers) = 5 OR lucky_numbers IS NULL),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Charity Events Table
CREATE TABLE public.charity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charity_id UUID REFERENCES public.charities(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Subscriptions Table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan subscription_plan NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Payments Table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_intent_id TEXT,
    amount_total_pence INT NOT NULL,
    charity_amount_pence INT NOT NULL,
    prize_pool_amount_pence INT NOT NULL,
    charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    paid_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Scores Table
CREATE TABLE public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    score INT NOT NULL CHECK (score >= 1 AND score <= 45),
    played_on DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, played_on)
);

-- Rolling window of 5 scores Postgres Trigger
CREATE OR REPLACE FUNCTION enforce_rolling_five_scores()
RETURNS TRIGGER AS $$
DECLARE
    score_count INT;
BEGIN
    SELECT COUNT(*) INTO score_count FROM public.scores WHERE user_id = NEW.user_id;
    IF score_count > 5 THEN
        DELETE FROM public.scores
        WHERE id IN (
            SELECT id FROM public.scores
            WHERE user_id = NEW.user_id
            ORDER BY played_on ASC, created_at ASC
            LIMIT (score_count - 5)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_enforce_rolling_five_scores
AFTER INSERT ON public.scores
FOR EACH ROW
EXECUTE FUNCTION enforce_rolling_five_scores();

-- 7. Draws Table
CREATE TABLE public.draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_month DATE UNIQUE NOT NULL,
    mode draw_mode NOT NULL DEFAULT 'random',
    winning_numbers INT[] CHECK (cardinality(winning_numbers) = 5 OR winning_numbers IS NULL),
    seed TEXT,
    frequency_snapshot JSONB,
    status draw_status NOT NULL DEFAULT 'draft',
    total_pool_pence INT DEFAULT 0 NOT NULL,
    rollover_in_pence INT DEFAULT 0 NOT NULL,
    rollover_out_pence INT DEFAULT 0 NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Draw Entries Table
CREATE TABLE public.draw_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    numbers INT[] NOT NULL CHECK (cardinality(numbers) = 5),
    match_count INT NOT NULL CHECK (match_count >= 0 AND match_count <= 5),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(draw_id, user_id)
);

-- 9. Winners Table
CREATE TABLE public.winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tier INT NOT NULL CHECK (tier IN (3, 4, 5)),
    prize_amount_pence INT NOT NULL CHECK (prize_amount_pence >= 0),
    proof_url TEXT,
    verification_status verification_status_enum DEFAULT 'not_submitted' NOT NULL,
    rejection_reason TEXT,
    payment_status payment_status_enum DEFAULT 'pending' NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Donations Table
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    charity_id UUID REFERENCES public.charities(id) ON DELETE CASCADE NOT NULL,
    amount_pence INT NOT NULL CHECK (amount_pence > 0),
    stripe_payment_intent_id TEXT,
    donor_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Helper function: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "Profiles readable by owner or admin" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles updatable by owner or admin" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles insertable by owner or admin" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- Charities
CREATE POLICY "Charities readable by public" ON public.charities
    FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Charities full access by admin" ON public.charities
    FOR ALL USING (public.is_admin());

-- Charity Events
CREATE POLICY "Charity events readable by public" ON public.charity_events
    FOR SELECT USING (true);

CREATE POLICY "Charity events full access by admin" ON public.charity_events
    FOR ALL USING (public.is_admin());

-- Subscriptions
CREATE POLICY "Subscriptions readable by owner or admin" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Subscriptions full access by admin" ON public.subscriptions
    FOR ALL USING (public.is_admin());

-- Payments
CREATE POLICY "Payments readable by owner or admin" ON public.payments
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Payments insertable by admin/service" ON public.payments
    FOR ALL USING (public.is_admin());

-- Scores
CREATE POLICY "Scores selectable by owner or admin" ON public.scores
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Scores insertable by owner" ON public.scores
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Scores updatable by owner or admin" ON public.scores
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Scores deletable by owner or admin" ON public.scores
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Draws
CREATE POLICY "Draws readable by public if published or by admin" ON public.draws
    FOR SELECT USING (status = 'published' OR public.is_admin());

CREATE POLICY "Draws full access by admin" ON public.draws
    FOR ALL USING (public.is_admin());

-- Draw Entries
CREATE POLICY "Draw entries readable by owner or admin" ON public.draw_entries
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Draw entries full access by admin" ON public.draw_entries
    FOR ALL USING (public.is_admin());

-- Winners
CREATE POLICY "Winners readable by owner, published draw viewers, or admin" ON public.winners
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR EXISTS (
        SELECT 1 FROM public.draws WHERE id = winners.draw_id AND status = 'published'
    ));

CREATE POLICY "Winners updatable by owner (for proof) or admin" ON public.winners
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Winners full access by admin" ON public.winners
    FOR ALL USING (public.is_admin());

-- Donations
CREATE POLICY "Donations readable by owner or admin" ON public.donations
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Donations insertable by public/anyone" ON public.donations
    FOR INSERT WITH CHECK (true);
