import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";
import { Users, Trophy, Heart, ShieldCheck, ArrowRight, Award } from "lucide-react";

export const revalidate = 0;

async function getAdminOverviewStats() {
  const supabaseAdmin = createAdminClient();

  const { count: userCount } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: activeSubCount } = await supabaseAdmin
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { data: payments } = await supabaseAdmin.from("payments").select("*");

  const totalCharityPence = payments
    ? payments.reduce((sum, p) => sum + p.charity_amount_pence, 0)
    : 0;

  const totalPrizePoolPence = payments
    ? payments.reduce((sum, p) => sum + p.prize_pool_amount_pence, 0)
    : 0;

  const { data: pendingWinners } = await supabaseAdmin
    .from("winners")
    .select("*")
    .eq("verification_status", "pending");

  return {
    userCount: userCount || 0,
    activeSubCount: activeSubCount || 0,
    totalCharityPence,
    totalPrizePoolPence,
    pendingWinnersCount: pendingWinners ? pendingWinners.length : 0,
  };
}

export default async function AdminPage() {
  const stats = await getAdminOverviewStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Admin Control Center</h1>
        <p className="text-muted text-sm mt-1">Platform overview, draw engine, user management, and verification queue.</p>
      </div>

      {/* STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-border space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <div className="font-display font-extrabold text-3xl text-white">{stats.userCount}</div>
          <span className="text-xs text-support">{stats.activeSubCount} Active Subscribers</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-border space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Charity Raised</span>
            <Heart className="w-5 h-5 text-support fill-teal-400/20" />
          </div>
          <div className="font-display font-extrabold text-3xl text-support">
            {formatCurrency(stats.totalCharityPence)}
          </div>
          <span className="text-xs text-muted">Distributed to partners</span>
        </div>

        <div className="glass-panel-amber p-6 rounded-3xl border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Prize Pool</span>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="font-display font-extrabold text-3xl text-amber-300">
            {formatCurrency(stats.totalPrizePoolPence)}
          </div>
          <span className="text-xs text-amber-200">£5/sub per month</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-border space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Verification Queue</span>
            <Award className="w-5 h-5 text-secondary" />
          </div>
          <div className="font-display font-extrabold text-3xl text-white">{stats.pendingWinnersCount}</div>
          <span className="text-xs text-secondary font-semibold">Pending Proof Uploads</span>
        </div>
      </div>

      {/* QUICK ACTION TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Link
          href="/admin/draws"
          className="glass-panel p-8 rounded-3xl border border-border hover:border-amber-500/40 transition-all group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-white flex items-center justify-between">
            Draw Engine Simulator <ArrowRight className="w-5 h-5 text-amber-400" />
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Create monthly draws, run random or algorithmic simulations repeatedly, preview prize splits, and publish draws.
          </p>
        </Link>

        <Link
          href="/admin/winners"
          className="glass-panel p-8 rounded-3xl border border-border hover:border-teal-500/40 transition-all group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-support flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-white flex items-center justify-between">
            Winners & Proof Approvals <ArrowRight className="w-5 h-5 text-support" />
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Inspect uploaded scorecard proof images via signed storage URLs, approve or reject proofs, and mark payouts Paid.
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="glass-panel p-8 rounded-3xl border border-border hover:border-primary/40 transition-all group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-secondary flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-white flex items-center justify-between">
            User Accounts & Overrides <ArrowRight className="w-5 h-5 text-secondary" />
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Search subscriber database, override subscription statuses, edit scores, and manage profile roles.
          </p>
        </Link>
      </div>
    </div>
  );
}
