import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: winnerId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient();

    // Check winner record and verification status
    const { data: winner } = await supabaseAdmin
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .single();

    if (!winner) {
      return NextResponse.json({ error: "Winner record not found" }, { status: 404 });
    }

    // VERIFICATION GATE: Block payment unless proof is approved!
    if (winner.verification_status !== "approved") {
      return NextResponse.json(
        {
          error: "Verification Gate Blocked: Winner payout cannot be marked Paid until score proof upload is approved by an admin.",
        },
        { status: 400 }
      );
    }

    // Update payment_status to 'paid' and record paid_at timestamp
    const { data: updatedWinner, error } = await supabaseAdmin
      .from("winners")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ winner: updatedWinner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process payout" }, { status: 500 });
  }
}
