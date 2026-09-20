import Link from "next/link";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { Trophy, Sparkles } from "lucide-react";
import { formatCurrency, formatMonthPeriod, formatDate } from "@/lib/utils";
import { DEFAULT_DRAWS } from "@/lib/constants";

export const revalidate = 60;

async function getPublishedDraws() {
  const fetchPromise = (async () => {
    try {
      const supabaseAdmin = createAdminClient();
      const { data: draws } = await supabaseAdmin
        .from("draws")
        .select("*, winners(*, profiles(full_name))")
        .eq("status", "published")
        .order("period_month", { ascending: false });

      if (draws && draws.length > 0) return draws;
      return DEFAULT_DRAWS;
    } catch (_err) {
      return DEFAULT_DRAWS;
    }
  })();

  const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(DEFAULT_DRAWS), 800));

  return (await Promise.race([fetchPromise, timeoutPromise])) as typeof DEFAULT_DRAWS;
}

export default async function ResultsPage() {
  const draws = await getPublishedDraws();

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-white">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
            Official Draw Archive
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mt-4">
            Published Monthly Results & Winners
          </h1>
          <p className="mt-4 text-gray-400 text-lg">
            Complete historical record of winning numbers, total prize pools, and tier winner allocations.
          </p>
        </div>

        {/* Draws List */}
        {draws.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-white/10">
            <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">No published draws yet</h3>
            <p className="text-gray-400 text-sm mt-1">The first monthly draw will be published soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {draws.map((draw) => {
              const winners = draw.winners || [];
              const jackpotWinners = winners.filter((w: any) => w.tier === 5);
              const tier4Winners = winners.filter((w: any) => w.tier === 4);
              const tier3Winners = winners.filter((w: any) => w.tier === 3);

              return (
                <div
                  key={draw.id}
                  className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                      <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                        Published {draw.published_at ? formatDate(draw.published_at) : ""}
                      </span>
                      <h2 className="font-display text-2xl font-bold text-white mt-1">
                        {formatMonthPeriod(draw.period_month)} Draw
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/results/${draw.id}/reveal`}
                        className="px-4 py-2 rounded-xl bg-[#C4F135]/20 text-[#C4F135] hover:bg-[#C4F135]/30 border border-[#C4F135]/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                      >
                        <Sparkles className="w-4 h-4 text-[#C4F135]" />
                        Watch Live Reveal
                      </Link>

                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Total Pool</span>
                        <span className="font-display font-extrabold text-amber-400 text-xl">
                          {formatCurrency(draw.total_pool_pence)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Winning Balls */}
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                      Winning Numbers
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {draw.winning_numbers?.map((num: number, idx: number) => (
                        <div
                          key={idx}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 font-display font-extrabold text-xl text-white flex items-center justify-center shadow-lg shadow-orange-500/20 border border-amber-300/30"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tier Winners Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Jackpot (5 Matches)</span>
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="text-lg font-bold text-white">
                        {jackpotWinners.length} Winner{jackpotWinners.length !== 1 ? "s" : ""}
                      </div>
                      <div className="text-xs text-gray-300">
                        {jackpotWinners.length > 0
                          ? `${formatCurrency(jackpotWinners[0].prize_amount_pence)} per winner`
                          : `Rolled over ${formatCurrency(draw.rollover_out_pence)}`}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-1">
                      <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                        Tier 2 (4 Matches)
                      </div>
                      <div className="text-lg font-bold text-white">
                        {tier4Winners.length} Winner{tier4Winners.length !== 1 ? "s" : ""}
                      </div>
                      <div className="text-xs text-gray-300">
                        {tier4Winners.length > 0
                          ? `${formatCurrency(tier4Winners[0].prize_amount_pence)} per winner`
                          : "Unclaimed → Rolled Over"}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Tier 3 (3 Matches)
                      </div>
                      <div className="text-lg font-bold text-white">
                        {tier3Winners.length} Winner{tier3Winners.length !== 1 ? "s" : ""}
                      </div>
                      <div className="text-xs text-gray-300">
                        {tier3Winners.length > 0
                          ? `${formatCurrency(tier3Winners[0].prize_amount_pence)} per winner`
                          : "Unclaimed → Rolled Over"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
