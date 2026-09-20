import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia" as any,
  typescript: true,
});

export const PLAN_PRICES = {
  monthly: {
    amountPence: 2000, // £20.00 / month
    name: "Monthly Subscription",
  },
  yearly: {
    amountPence: 20000, // £200.00 / year
    name: "Yearly Subscription",
  },
};
