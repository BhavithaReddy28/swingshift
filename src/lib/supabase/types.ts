export type UserRole = "subscriber" | "admin";
export type SubscriptionPlan = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "lapsed";
export type DrawMode = "random" | "algorithmic";
export type DrawStatus = "draft" | "simulated" | "published";
export type VerificationStatus = "not_submitted" | "pending" | "approved" | "rejected";
export type PaymentStatus = "pending" | "paid";

export interface Charity {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  logo_url: string;
  hero_image_url: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  charity_id: string | null;
  charity_percentage: number;
  lucky_numbers: number[] | null;
  created_at: string;
  charities?: Charity;
}

export interface CharityEvent {
  id: string;
  charity_id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  amount_total_pence: number;
  charity_amount_pence: number;
  prize_pool_amount_pence: number;
  charity_id: string | null;
  paid_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  played_on: string;
  created_at: string;
}

export interface Draw {
  id: string;
  period_month: string;
  mode: DrawMode;
  winning_numbers: number[] | null;
  seed: string | null;
  frequency_snapshot: Record<string, number> | null;
  status: DrawStatus;
  total_pool_pence: number;
  rollover_in_pence: number;
  rollover_out_pence: number;
  published_at: string | null;
  created_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  numbers: number[];
  match_count: number;
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  tier: 3 | 4 | 5;
  prize_amount_pence: number;
  proof_url: string | null;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  payment_status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
  profiles?: Profile;
  draws?: Draw;
}

export interface Donation {
  id: string;
  user_id: string | null;
  charity_id: string;
  amount_pence: number;
  stripe_payment_intent_id: string | null;
  donor_email: string;
  created_at: string;
}
