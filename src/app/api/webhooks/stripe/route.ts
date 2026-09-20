import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Unverified payload in local dev test mode without secret
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`Webhook Signature Verification Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};

        if (metadata.type === "direct_donation") {
          // Record direct donation
          await supabaseAdmin.from("donations").insert({
            charity_id: metadata.charityId,
            amount_pence: Number(metadata.amountPence),
            stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
            donor_email: metadata.donorEmail,
          });
        } else {
          // Subscription checkout completed
          const userId = metadata.userId || session.client_reference_id;
          const charityId = metadata.charityId;
          const charityPercentage = Number(metadata.charityPercentage) || 10;
          const plan = (metadata.plan === "yearly" ? "yearly" : "monthly") as "yearly" | "monthly";
          const amountTotalPence = session.amount_total || (plan === "yearly" ? 20000 : 2000);

          if (userId) {
            // Update profile with charity preferences if provided
            if (charityId) {
              await supabaseAdmin
                .from("profiles")
                .update({ charity_id: charityId, charity_percentage: charityPercentage })
                .eq("id", userId);
            }

            // Create or update subscription row
            await supabaseAdmin.from("subscriptions").upsert({
              user_id: userId,
              stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
              stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
              plan,
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + (plan === "yearly" ? 365 : 30) * 86400000).toISOString(),
              cancel_at_period_end: false,
            });

            // Split payment into charity and prize pool amounts
            const charityAmountPence = Math.round(amountTotalPence * (charityPercentage / 100));
            const prizePoolAmountPence = 500; // Fixed £5 prize contribution per active subscriber

            // Write payment history row
            await supabaseAdmin.from("payments").insert({
              user_id: userId,
              stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
              amount_total_pence: amountTotalPence,
              charity_amount_pence: charityAmountPence,
              prize_pool_amount_pence: prizePoolAmountPence,
              charity_id: charityId || null,
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : null;
        let status: "active" | "cancelled" | "past_due" | "lapsed" = "active";

        if (sub.status === "active") status = "active";
        else if (sub.status === "past_due") status = "past_due";
        else if (sub.status === "canceled") status = "cancelled";
        else status = "lapsed";

        if (customerId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status,
              cancel_at_period_end: sub.cancel_at_period_end,
              current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : null;
        if (customerId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "lapsed" })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
        if (customerId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook execution failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
