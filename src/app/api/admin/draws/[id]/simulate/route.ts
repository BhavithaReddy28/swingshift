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
  req: NextRequest,
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

    // Fetch draw
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
        { error: "Published draws cannot be simulated or edited." },
        { status: 400 }
      );
    }

    // Fetch active subscribers who have at least one score recorded
    const { data: activeSubs } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active");

    const activeUserIds = activeSubs ? activeSubs.map((s) => s.user_id) : [];

    // Filter subscribers with at least 1 score
    const { data: usersWithScores } = await supabaseAdmin
      .from("scores")
      .select("user_id")
      .in("user_id", activeUserIds);

    const eligibleUserIds = Array.from(
      new Set(usersWithScores ? usersWithScores.map((s) => s.user_id) : [])
    );

    // Fetch profiles of eligible subscribers for lucky numbers
    const { data: subscriberProfiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, lucky_numbers")
      .in("id", eligibleUserIds);

    // Build entry list for simulation
    const entries: { userId: string; numbers: number[]; fullName: string }[] = [];
    if (subscriberProfiles) {
      for (const sub of subscriberProfiles) {
        let numbers = sub.lucky_numbers;
        // Auto-assign 5 random unique numbers if lucky_numbers is not set
        if (!numbers || numbers.length !== 5) {
          const { winningNumbers: autoAssigned } = generateRandomWinningNumbers();
          numbers = autoAssigned;
        }
        entries.push({
          userId: sub.id,
          numbers,
          fullName: sub.full_name,
        });
      }
    }

    // Generate winning numbers based on draw mode
    let winningNumbers: number[] = [];
    let seed: string | null = null;
    let frequencySnapshot: Record<string, number> | null = null;

    if (draw.mode === "random") {
      const result = generateRandomWinningNumbers();
      winningNumbers = result.winningNumbers;
      seed = result.seed;
    } else {
      // Algorithmic mode: fetch all scores
      const { data: allScores } = await supabaseAdmin
        .from("scores")
        .select("score");
      const scoreInputs = allScores ? allScores.map((s) => ({ score: s.score })) : [];
      const result = generateAlgorithmicWinningNumbers(scoreInputs);
      winningNumbers = result.winningNumbers;
      frequencySnapshot = result.frequencySnapshot;
    }

    // Compute prize splits & matches
    const prizeSplit = calculatePrizeSplits(
      eligibleUserIds.length,
      entries,
      winningNumbers,
      draw.rollover_in_pence
    );

    // Update draw status to 'simulated' and store preview state
    const { data: updatedDraw, error: updateError } = await supabaseAdmin
      .from("draws")
      .update({
        status: "simulated",
        winning_numbers: winningNumbers,
        seed,
        frequency_snapshot: frequencySnapshot,
        total_pool_pence: prizeSplit.totalPoolPence,
        rollover_out_pence: prizeSplit.rolloverOutPence,
      })
      .eq("id", drawId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      draw: updatedDraw,
      simulation: {
        eligibleCount: eligibleUserIds.length,
        winningNumbers,
        seed,
        frequencySnapshot,
        prizeSplit,
        entries: entries.map((e) => ({
          ...e,
          matchCount: calculateMatchCount(e.numbers, winningNumbers),
        })),
      },
    });
  } catch (error: any) {
    console.error("Simulation error:", error);
    return NextResponse.json({ error: error.message || "Failed to simulate draw" }, { status: 500 });
  }
}
