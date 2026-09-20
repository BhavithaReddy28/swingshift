import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { directDonationSchema } from "@/lib/zod-schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = directDonationSchema.parse(body);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Direct Charity Donation - Digital Heroes",
              description: "100% of this direct donation goes to the selected charity.",
            },
            unit_amount: parsed.amountPence,
          },
          quantity: 1,
        },
      ],
      customer_email: parsed.donorEmail,
      metadata: {
        type: "direct_donation",
        charityId: parsed.charityId,
        donorEmail: parsed.donorEmail,
        amountPence: parsed.amountPence.toString(),
      },
      success_url: `${siteUrl}/charities?donation=success`,
      cancel_url: `${siteUrl}/charities?donation=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Direct donation error:", error);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.json({
      url: `${siteUrl}/charities?donation=success&demo=true`,
      warning: "Demo fallback donation checkout used",
    });
  }
}
