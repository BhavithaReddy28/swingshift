import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateCharityPreferenceSchema } from "@/lib/zod-schemas";

import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const isDemo = cookieStore.get("dh_demo_user")?.value;

    if (isDemo) {
      return NextResponse.json({
        profile: {
          id: "demo-user-1",
          full_name: "Demo Hero",
          role: isDemo === "admin" ? "admin" : "subscriber",
          charity_id: "c1111111-1111-1111-1111-111111111111",
          charity_percentage: 25,
          lucky_numbers: [7, 14, 21, 28, 35],
          created_at: new Date().toISOString(),
          charities: {
            id: "c1111111-1111-1111-1111-111111111111",
            name: "Golf for Youth Foundation",
          }
        },
        subscription: {
          id: "demo-sub-1",
          user_id: "demo-user-1",
          plan: "monthly",
          status: "active",
        }
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, charities(*)")
      .eq("id", user.id)
      .single();

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.json({ profile, subscription });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const isDemo = cookieStore.get("dh_demo_user")?.value;

    if (isDemo) {
      const body = await req.json();
      const parsed = updateCharityPreferenceSchema.parse(body);
      return NextResponse.json({
        profile: {
          charity_id: parsed.charityId || "demo",
          charity_percentage: parsed.charityPercentage || 25,
        }
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateCharityPreferenceSchema.parse(body);

    const updates: Record<string, any> = {};
    if (parsed.charityId !== undefined) updates.charity_id = parsed.charityId;
    if (parsed.charityPercentage !== undefined) updates.charity_percentage = parsed.charityPercentage;

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("*, charities(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 400 });
  }
}
