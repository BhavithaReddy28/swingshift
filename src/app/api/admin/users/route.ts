import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest) {
  try {
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
    const { userId, subscriptionStatus } = body;

    if (!userId || !subscriptionStatus) {
      return NextResponse.json({ error: "userId and subscriptionStatus required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const { data: sub, error } = await supabaseAdmin
      .from("subscriptions")
      .upsert({
        user_id: userId,
        status: subscriptionStatus,
        plan: "monthly",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ subscription: sub });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
