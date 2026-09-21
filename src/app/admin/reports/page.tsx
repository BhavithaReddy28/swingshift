import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BarChart3, Users, Heart, Trophy, PieChart, TrendingUp } from "lucide-react";

export const revalidate = 0;

async function getReportData() {
  const supabaseAdmin = createAdminClient();

  // 1. User stats
  const { count: totalUsers } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: activeSubs } = await supabaseAdmin
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // 2. Financial totals
  const { data: payments } = await supabaseAdmin.from("payments").select("*, charities(name)");

  const totalRevenuePence = payments
    ? payments.reduce((sum, p) => sum + p.amount_total_pence, 0)
    : 0;

  const totalCharityPence = payments
    ? payments.reduce((sum, p) => sum + p.charity_amount_pence, 0)
    : 0;

  const totalPrizePoolPence = payments
    ? payments.reduce((sum, p) => sum + p.prize_pool_amount_pence, 0)
    : 0;

  // Breakdown per charity
  const charityBreakdown: Record<string, { name: string; totalPence: number; count: number }> = {};

  if (payments) {
    for (const p of payments) {
      const cName = p.charities?.name || "Unassigned Charity";
      if (!charityBreakdown[cName]) {
        charityBreakdown[cName] = { name: cName, totalPence: 0, count: 0 };
      }
      charityBreakdown[cName].totalPence += p.charity_amount_pence;
      charityBreakdown[cName].count += 1;
    }
  }

  // 3. Draw statistics
  const { data: draws } = await supabaseAdmin
    .from("draws")
    .select("*, winners(*)")
    .eq("status", "published")
    .order("period_month", { ascending: false });

  return {
    totalUsers: totalUsers || 0,
    activeSubs: activeSubs || 0,
    totalRevenuePence,
    totalCharityPence,
    totalPrizePoolPence,
    charityBreakdown: Object.values(charityBreakdown),
    publishedDraws: draws || [],
  };
}

export default async function AdminReportsPage() {
  const report = await getReportData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Financial & Impact Reports</h1>
        <p className="text-muted text-sm mt-1">
          Detailed metrics on platform subscription revenue, per-charity funding distributions, and draw statistics.
        </p>
      </div>

      {/* METRIC SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-border space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Subscription Volume</span>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <div className="font-display font-extrabold text-3xl text-white">
            {formatCurrency(report.totalRevenuePence)}
          </div>
          <span className="text-xs text-muted">Total Stripe payments processed</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-border space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Charity Funding</span>
            <Heart className="w-5 h-5 text-support fill-teal-400/20" />
          </div>
          <div className="font-display font-extrabold text-3xl text-support">
            {formatCurrency(report.totalCharityPence)}
          </div>
          <span className="text-xs text-support">10%–100% Subscriber allocations</span>
        </div>

        <div className="glass-panel-amber p-6 rounded-3xl border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Prize Contributions</span>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="font-display font-extrabold text-3xl text-amber-300">
            {formatCurrency(report.totalPrizePoolPence)}
          </div>
          <span className="text-xs text-amber-200">£5/active sub per month</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-border space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Subscriber Count</span>
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <div className="font-display font-extrabold text-3xl text-white">{report.activeSubs}</div>
          <span className="text-xs text-muted">Out of {report.totalUsers} registered users</span>
        </div>
      </div>

      {/* PER-CHARITY DISTRIBUTION BREAKDOWN */}
      <div className="glass-panel p-8 rounded-3xl border border-border space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-support flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">Charity Revenue Distribution</h2>
            <p className="text-xs text-muted">Funds raised broken down by partner charity</p>
          </div>
        </div>

        {report.charityBreakdown.length === 0 ? (
          <div className="p-8 text-center text-muted text-xs">No payment history recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {report.charityBreakdown.map((cb, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-ink-elevated border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-support font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-white text-base">{cb.name}</span>
                    <span className="text-xs text-muted block">{cb.count} Payment Allocations</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display font-extrabold text-support text-lg">
                    {formatCurrency(cb.totalPence)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
