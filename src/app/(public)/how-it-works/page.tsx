import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { Trophy, ShieldCheck, RefreshCw } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-white">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3.5 py-1.5 rounded-full border border-orange-500/20">
            Rules & Mechanics Explained
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mt-4">
            Transparent Draw Mechanics & Prize Tiers
          </h1>
          <p className="mt-4 text-gray-400 text-lg">
            Every active subscriber contributes a fixed £5 per month to the prize pool, while directing at least 10% to their chosen charity.
          </p>
        </div>

        {/* Lucky Numbers & Entry Eligibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-xl">
              1
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Selecting Your 5 Lucky Numbers</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Subscribers select 5 unique numbers between 1 and 45. You can update your numbers anytime from your dashboard prior to monthly draw publication. If you have no numbers selected when a draw runs, 5 random unique numbers are automatically assigned to ensure your entry is recorded.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xl">
              2
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Entry Eligibility & Snapshot</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              To be entered into a monthly draw, your subscription status must be <span className="text-teal-400 font-semibold">Active</span> AND you must have at least one score recorded in your 5-score rolling history. Entries are snapshotted into <code className="text-orange-300 bg-white/5 px-1.5 py-0.5 rounded">draw_entries</code> when the draw runs so later edits cannot retroactively alter published results.
            </p>
          </div>
        </div>

        {/* Tier Structure Table */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-extrabold text-white">Prize Pool & Tier Table</h2>
            <p className="text-gray-400 text-sm mt-2">
              Prize Pool = <code className="text-amber-400">Active Subscribers × £5</code> + Rollover Carryover.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-6">Match Tier</th>
                  <th className="py-4 px-6">Match Requirement</th>
                  <th className="py-4 px-6">Pool Share</th>
                  <th className="py-4 px-6">Winner Division & Rollover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 px-6 font-display font-bold text-amber-400 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" /> Jackpot Tier
                  </td>
                  <td className="py-5 px-6 text-white font-semibold">5 Matches</td>
                  <td className="py-5 px-6 text-orange-400 font-bold">40% of Pool</td>
                  <td className="py-5 px-6 text-gray-300">
                    Split equally among 5-match winners. Unclaimed 40% slice rolls over 100% into next month&apos;s Jackpot.
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 px-6 font-display font-bold text-teal-400">Tier Two</td>
                  <td className="py-5 px-6 text-white font-semibold">4 Matches</td>
                  <td className="py-5 px-6 text-teal-400 font-bold">35% of Pool</td>
                  <td className="py-5 px-6 text-gray-300">
                    Split equally among 4-match winners. Unclaimed shares are added to next month&apos;s Jackpot rollover.
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 px-6 font-display font-bold text-gray-300">Tier Three</td>
                  <td className="py-5 px-6 text-white font-semibold">3 Matches</td>
                  <td className="py-5 px-6 text-orange-400 font-bold">25% of Pool</td>
                  <td className="py-5 px-6 text-gray-300">
                    Split equally among 3-match winners. Unclaimed shares are added to next month&apos;s Jackpot rollover.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Modes & Verification Gate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-orange-400" />
              Draw Modes: Random & Algorithmic
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Draws can run in <span className="text-orange-400 font-semibold">Random Mode</span> (crypto-random seeded for auditability) or <span className="text-teal-400 font-semibold">Algorithmic Mode</span> (weighted by score frequency across all recorded scores). Mode snapshots are stored on the draw row for 100% reproducibility.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              Verification Gate & Payout Safety
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Winner payouts are protected by a verification gate. Winners must upload a screenshot of their score card to private storage. An admin verifies score integrity prior to setting the payout status to <span className="text-teal-400 font-semibold">Paid</span>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
