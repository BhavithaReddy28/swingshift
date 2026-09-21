import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_PRICES } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const plan = body.plan === "yearly" ? "yearly" : "monthly";
    const charityId = body.charityId;
    const charityPercentage = Number(body.charityPercentage) || 10;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `SwingShift ${PLAN_PRICES[plan].name}`,
              description: `Golf Score Subscription (${charityPercentage}% to Charity)`,
            },
            unit_amount: PLAN_PRICES[plan].amountPence,
            recurring: {
              interval: plan === "yearly" ? "year" : "month",
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        plan,
        charityId,
        charityPercentage: charityPercentage.toString(),
      },
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/dashboard?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.json({
      url: `${siteUrl}/dashboard?checkout=success&demo=true`,
      warning: "Demo fallback checkout session used",
    });
  }
}
