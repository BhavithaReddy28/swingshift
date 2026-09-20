import Link from "next/link";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/MotionWrapper";
import { Heart, Trophy, Target, ArrowRight, ShieldCheck, Sparkles, Users, Gift, CheckCircle2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatMonthPeriod } from "@/lib/utils";

export const revalidate = 60; // Refresh data every minute

async function getHomeData() {
  const supabaseAdmin = createAdminClient();

  // Fetch charities count & featured charity
  const { data: charities } = await supabaseAdmin
    .from("charities")
    .select("*")
    .eq("is_active", true);

  const featuredCharity = charities?.find((c) => c.is_featured) || charities?.[0];

  // Fetch payments for total raised & total subscribers
  const { data: payments } = await supabaseAdmin.from("payments").select("charity_amount_pence");
  const totalRaisedPence = payments ? payments.reduce((sum, p) => sum + p.charity_amount_pence, 0) : 142500; // default fallback if empty

  const { data: activeSubs } = await supabaseAdmin.from("subscriptions").select("id").eq("status", "active");
  const activeCount = activeSubs ? activeSubs.length : 24;

  // Fetch latest published draw
  const { data: latestDraw } = await supabaseAdmin
    .from("draws")
    .select("*")
    .eq("status", "published")
    .order("period_month", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Calculate current jackpot preview (activeCount * 500 * 0.4 + rollover_in)
  const estimatedPoolPence = activeCount * 500 + (latestDraw?.rollover_out_pence || 25000);
  const currentJackpotPence = Math.floor(estimatedPoolPence * 0.40);

  return {
    charityCount: charities?.length || 8,
    featuredCharity,
    totalRaisedPence,
    activeCount,
    currentJackpotPence,
    latestDraw,
  };
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-white">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/15 to-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-amber text-orange-400 text-xs sm:text-sm font-semibold mb-8 border border-orange-500/30">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Golf with Purpose • Monthly Jackpot • 10%+ Charity Share</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
                Turn Every Round of Golf Into <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Life-Changing Impact</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                Log your last 5 golf scores, pick 5 lucky numbers, enter monthly cash draw pools, and automatically direct a minimum of 10% of your fee to the charity you care about most.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-display font-semibold text-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xl shadow-orange-500/25 hover:from-orange-600 hover:to-amber-700 transition-all flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <Trophy className="w-5 h-5 text-white" />
                  Subscribe & Play (£20/mo)
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-display font-semibold text-lg glass-panel text-gray-200 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  How It Works
                </Link>
              </div>
            </FadeIn>

            {/* LIVE IMPACT COUNTERS BAR */}
            <FadeIn delay={0.4}>
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-orange-500/30 transition-all">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 mx-auto mb-3">
                    <Heart className="w-6 h-6 fill-orange-500/20" />
                  </div>
                  <div className="font-display text-3xl font-extrabold text-white">
                    {formatCurrency(data.totalRaisedPence)}
                  </div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">
                    Total Raised for Charities
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="font-display text-3xl font-extrabold text-white">
                    {data.charityCount} Partner Charities
                  </div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">
                    Direct Impact Partners
                  </div>
                </div>

                <div className="glass-panel-amber p-6 rounded-2xl border border-orange-500/40 amber-glow">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 mx-auto mb-3">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="font-display text-3xl font-extrabold text-amber-300">
                    {formatCurrency(data.currentJackpotPence)}
                  </div>
                  <div className="text-xs text-orange-300 font-medium uppercase tracking-wider mt-1">
                    Est. Next Jackpot Pool
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FEATURED CHARITY SPOTLIGHT */}
        {data.featuredCharity && (
          <section className="py-16 bg-[#070A10] border-y border-white/5 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-3.5 py-1.5 rounded-full border border-teal-500/20">
                  Featured Cause Spotlight
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-4">
                  Where Your Golf Fees Make a Real Difference
                </h2>
              </div>

              <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-500/10 text-orange-400 text-xs font-semibold uppercase tracking-wider">
                    {data.featuredCharity.category}
                  </div>
                  <h3 className="font-display text-3xl font-bold text-white">
                    {data.featuredCharity.name}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {data.featuredCharity.long_description}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link
                      href={`/charities/${data.featuredCharity.slug}`}
                      className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
                    >
                      View Charity Profile & Events
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  {/* Image render */}
                  <img
                    src={data.featuredCharity.hero_image_url}
                    alt={data.featuredCharity.name}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white p-2 shadow-lg flex items-center justify-center shrink-0">
                      <img
                        src={data.featuredCharity.logo_url}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">{data.featuredCharity.name}</div>
                      <div className="text-xs text-gray-300">{data.featuredCharity.short_description}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* THREE STEP HOW IT WORKS */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
              Three Simple Steps to Play & Give
            </h2>
            <p className="mt-4 text-gray-400 text-lg">
              No complex handicap math. Track your rounds, pick your lucky numbers, and support grass-roots charities.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StaggerItem>
              <div className="glass-panel p-8 rounded-2xl border border-white/10 relative h-full flex flex-col hover:border-orange-500/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 font-display font-extrabold text-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  1
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  Log Your Rolling 5 Scores
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  Keep your last 5 golf scores (1–45 range) up to date in your dashboard. Any new score automatically keeps your profile active for monthly draws.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass-panel p-8 rounded-2xl border border-white/10 relative h-full flex flex-col hover:border-amber-500/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 font-display font-extrabold text-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  2
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  Select 5 Lucky Numbers
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  Choose 5 numbers between 1 and 45. Match 5 for the Jackpot (40% pool), 4 for Tier Two (35%), or 3 for Tier Three (25%). Unclaimed pools roll over!
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass-panel p-8 rounded-2xl border border-white/10 relative h-full flex flex-col hover:border-teal-500/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 font-display font-extrabold text-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  3
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  Direct Your Charity Impact
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  Allocate between 10% and 100% of your subscription fee to any partner charity. Track direct contributions transparently in your user portal.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* MOST RECENT DRAW RESULTS */}
        {data.latestDraw && data.latestDraw.winning_numbers && (
          <section className="py-16 bg-[#070A10] border-t border-white/5 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
                Latest Published Draw • {formatMonthPeriod(data.latestDraw.period_month)}
              </span>
              <h2 className="font-display text-3xl font-extrabold text-white mt-4 mb-8">
                Winning Number Reveal
              </h2>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {data.latestDraw.winning_numbers.map((num: number, idx: number) => (
                  <div
                    key={idx}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 font-display font-extrabold text-2xl sm:text-3xl text-white flex items-center justify-center shadow-xl shadow-orange-500/30 border border-amber-300/30 animate-ball-flip"
                    style={{ animationDelay: `${idx * 0.15}s` }}
                  >
                    {num}
                  </div>
                ))}
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-xl mx-auto flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-400 block text-xs">Total Draw Pool</span>
                  <span className="font-bold text-white text-lg">
                    {formatCurrency(data.latestDraw.total_pool_pence)}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <span className="text-gray-400 block text-xs">Draw Mode</span>
                  <span className="font-semibold text-teal-400 uppercase tracking-wider text-xs">
                    {data.latestDraw.mode}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <Link
                  href="/results"
                  className="text-orange-400 hover:text-orange-300 font-semibold text-xs flex items-center gap-1"
                >
                  View Breakdown →
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
