import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  generateRandomWinningNumbers,
  generateAlgorithmicWinningNumbers,
  calculatePrizeSplits,
  calculateMatchCount,
} from "@/lib/draw-engine";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: drawId } = await params;

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

    const { data: draw } = await supabaseAdmin
      .from("draws")
      .select("*")
      .eq("id", drawId)
      .single();

    if (!draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }

    if (draw.status === "published") {
      return NextResponse.json(
        { error: "Draw is already published and locked." },
        { status: 400 }
      );
    }

    const { data: activeSubs } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active");

    const activeUserIds = activeSubs ? activeSubs.map((s) => s.user_id) : [];

    const { data: usersWithScores } = await supabaseAdmin
      .from("scores")
      .select("user_id")
      .in("user_id", activeUserIds);

    const eligibleUserIds = Array.from(
      new Set(usersWithScores ? usersWithScores.map((s) => s.user_id) : [])
    );

    const { data: subscriberProfiles } = await supabaseAdmin
      .from("profiles")
      .select("id, lucky_numbers")
      .in("id", eligibleUserIds);

    const entries: { userId: string; numbers: number[] }[] = [];
    if (subscriberProfiles) {
      for (const sub of subscriberProfiles) {
        let numbers = sub.lucky_numbers;
        if (!numbers || numbers.length !== 5) {
          const { winningNumbers: autoAssigned } = generateRandomWinningNumbers();
          numbers = autoAssigned;
          await supabaseAdmin
            .from("profiles")
            .update({ lucky_numbers: numbers })
            .eq("id", sub.id);
        }
        entries.push({ userId: sub.id, numbers });
      }
    }

    let winningNumbers = draw.winning_numbers;
    let seed = draw.seed;
    let frequencySnapshot: Record<string, number> | null = draw.frequency_snapshot;

    if (!winningNumbers || winningNumbers.length !== 5) {
      if (draw.mode === "random") {
        const res = generateRandomWinningNumbers();
        winningNumbers = res.winningNumbers;
        seed = res.seed;
      } else {
        const { data: allScores } = await supabaseAdmin
          .from("scores")
          .select("score");
        const scoreInputs = allScores ? allScores.map((s) => ({ score: s.score })) : [];
        const res = generateAlgorithmicWinningNumbers(scoreInputs);
        winningNumbers = res.winningNumbers;
        frequencySnapshot = res.frequencySnapshot;
      }
    }

    const prizeSplit = calculatePrizeSplits(
      eligibleUserIds.length,
      entries,
      winningNumbers,
      draw.rollover_in_pence
    );

    const drawEntriesToInsert = entries.map((e) => ({
      draw_id: drawId,
      user_id: e.userId,
      numbers: e.numbers,
      match_count: calculateMatchCount(e.numbers, winningNumbers),
    }));

    if (drawEntriesToInsert.length > 0) {
      await supabaseAdmin.from("draw_entries").insert(drawEntriesToInsert);
    }

    const winnerRowsToInsert = prizeSplit.winners.map((w) => ({
      draw_id: drawId,
      user_id: w.userId,
      tier: w.tier,
      prize_amount_pence: w.prizeAmountPence,
      verification_status: "not_submitted",
      payment_status: "pending",
    }));

    if (winnerRowsToInsert.length > 0) {
      await supabaseAdmin.from("winners").insert(winnerRowsToInsert);
    }

    const { data: publishedDraw, error: publishError } = await supabaseAdmin
      .from("draws")
      .update({
        status: "published",
        winning_numbers: winningNumbers,
        seed,
        frequency_snapshot: frequencySnapshot,
        total_pool_pence: prizeSplit.totalPoolPence,
        rollover_out_pence: prizeSplit.rolloverOutPence,
        published_at: new Date().toISOString(),
      })
      .eq("id", drawId)
      .select()
      .single();

    if (publishError) {
      return NextResponse.json({ error: publishError.message }, { status: 400 });
    }

    return NextResponse.json({
      draw: publishedDraw,
      winnerCount: winnerRowsToInsert.length,
      rolloverOutPence: prizeSplit.rolloverOutPence,
    });
  } catch (error: any) {
    console.error("Publish error:", error);
    return NextResponse.json({ error: error.message || "Failed to publish draw" }, { status: 500 });
  }
}
