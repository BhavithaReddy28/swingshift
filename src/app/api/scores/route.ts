import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scoreSchema } from "@/lib/zod-schemas";

import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const isDemo = cookieStore.get("dh_demo_user")?.value;

    if (isDemo) {
      return NextResponse.json({
        scores: [
          { id: "s1", score: 42, played_on: "2026-09-01", created_at: new Date().toISOString() },
          { id: "s2", score: 38, played_on: "2026-08-15", created_at: new Date().toISOString() },
        ]
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: scores, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("played_on", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ scores });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch scores" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const isDemo = cookieStore.get("dh_demo_user")?.value;

    if (isDemo) {
      const body = await req.json();
      const parsed = scoreSchema.parse(body);
      return NextResponse.json({
        score: {
          id: `demo-score-${Date.now()}`,
          score: parsed.score,
          played_on: parsed.playedOn,
          created_at: new Date().toISOString()
        },
        note: "Demo Mode: Score saved locally but will not persist."
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
    const parsed = scoreSchema.parse(body);

    // Check duplicate date for this user
    const { data: existing } = await supabase
      .from("scores")
      .select("id")
      .eq("user_id", user.id)
      .eq("played_on", parsed.playedOn)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `You already have a score recorded for ${parsed.playedOn}. Select a different date or edit your existing score.` },
        { status: 400 }
      );
    }

    // Insert new score
    const { data: newScore, error: insertError } = await supabase
      .from("scores")
      .insert({
        user_id: user.id,
        score: parsed.score,
        played_on: parsed.playedOn,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    // Enforce rolling window cap (keep 5 newest)
    const supabaseAdmin = createAdminClient();
    const { data: allScores } = await supabaseAdmin
      .from("scores")
      .select("id, played_on, created_at")
      .eq("user_id", user.id)
      .order("played_on", { ascending: false })
      .order("created_at", { ascending: false });

    let evictedNote = null;
    if (allScores && allScores.length > 5) {
      const scoresToDelete = allScores.slice(5);
      const deleteIds = scoresToDelete.map((s) => s.id);
      await supabaseAdmin.from("scores").delete().in("id", deleteIds);
      evictedNote = "Your 6th entry replaced your oldest recorded score to maintain your 5 rolling scores.";
    }

    return NextResponse.json({ score: newScore, note: evictedNote });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to add score" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const isDemo = cookieStore.get("dh_demo_user")?.value;

    if (isDemo) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Score ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
