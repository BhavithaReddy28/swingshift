import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DrawRevealExperience } from "@/components/draw/DrawRevealExperience";

export const revalidate = 0;

async function getRevealData(drawId: string) {
  const supabaseAdmin = createAdminClient();

  // Fetch draw
  const { data: draw } = await supabaseAdmin
    .from("draws")
    .select("*, winners(*)")
    .eq("id", drawId)
    .maybeSingle();

  if (!draw) return null;

  // Check current user subscriber entry & winnings
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let subscriberEntry = null;

  if (user) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*, charities(*)")
      .eq("id", user.id)
      .single();

    const { data: entry } = await supabaseAdmin
      .from("draw_entries")
      .select("*")
      .eq("draw_id", drawId)
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: winner } = await supabaseAdmin
      .from("winners")
      .select("*")
      .eq("draw_id", drawId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (entry || profile) {
      const numbers = entry?.numbers || profile?.lucky_numbers || [7, 14, 21, 28, 35];
      const matchCount = entry?.match_count || 0;

      subscriberEntry = {
        numbers,
        matchCount,
        winTier: winner?.tier,
        prizeAmountPence: winner?.prize_amount_pence || 0,
        charityName: profile?.charities?.name || "Selected Charity",
        charityAmountPence: 200, // default fee portion
      };
    }
  }

  // Build winners summary for breakdown panel
  const winners = draw.winners || [];
  const tier5Winners = winners.filter((w: any) => w.tier === 5);
  const tier4Winners = winners.filter((w: any) => w.tier === 4);
  const tier3Winners = winners.filter((w: any) => w.tier === 3);

  const winnersSummary = {
    tier5: {
      count: tier5Winners.length,
      prizePence: tier5Winners[0]?.prize_amount_pence || Math.floor(draw.total_pool_pence * 0.4),
    },
    tier4: {
      count: tier4Winners.length,
      prizePence: tier4Winners[0]?.prize_amount_pence || Math.floor(draw.total_pool_pence * 0.35),
    },
    tier3: {
      count: tier3Winners.length,
      prizePence: tier3Winners[0]?.prize_amount_pence || Math.floor(draw.total_pool_pence * 0.25),
    },
  };

  return { draw, subscriberEntry, winnersSummary };
}

export default async function DrawRevealPage({ params }: { params: Promise<{ drawId: string }> }) {
  const { drawId } = await params;
  const data = await getRevealData(drawId);

  if (!data) {
    notFound();
  }

  return (
    <DrawRevealExperience
      draw={data.draw}
      subscriberEntry={data.subscriberEntry}
      winnersSummary={data.winnersSummary}
    />
  );
}
