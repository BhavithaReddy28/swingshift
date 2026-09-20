import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createDrawSchema } from "@/lib/zod-schemas";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin";
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient();
    const { data: draws, error } = await supabaseAdmin
      .from("draws")
      .select("*")
      .order("period_month", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ draws });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createDrawSchema.parse(body);

    const supabaseAdmin = createAdminClient();

    // Check existing draw for month
    const { data: existing } = await supabaseAdmin
      .from("draws")
      .select("id")
      .eq("period_month", parsed.periodMonth)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `A draw for ${parsed.periodMonth} already exists.` },
        { status: 400 }
      );
    }

    // Fetch latest published draw to get rollover_out_pence as rollover_in_pence
    const { data: lastDraw } = await supabaseAdmin
      .from("draws")
      .select("rollover_out_pence")
      .eq("status", "published")
      .order("period_month", { ascending: false })
      .limit(1)
      .maybeSingle();

    const rolloverInPence = lastDraw?.rollover_out_pence || 0;

    const { data: draw, error } = await supabaseAdmin
      .from("draws")
      .insert({
        period_month: parsed.periodMonth,
        mode: parsed.mode,
        status: "draft",
        rollover_in_pence: rolloverInPence,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ draw });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create draw" }, { status: 400 });
  }
}
