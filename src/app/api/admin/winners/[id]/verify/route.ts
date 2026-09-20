import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { verifyWinnerSchema } from "@/lib/zod-schemas";

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

    const body = await req.json();
    const parsed = verifyWinnerSchema.parse(body);

    const supabaseAdmin = createAdminClient();

    const { data: updatedWinner, error } = await supabaseAdmin
      .from("winners")
      .update({
        verification_status: parsed.status,
        rejection_reason: parsed.status === "rejected" ? parsed.rejectionReason || "Proof document does not match score record" : null,
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ winner: updatedWinner });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to verify winner proof" }, { status: 400 });
  }
}
