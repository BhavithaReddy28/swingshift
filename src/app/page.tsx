import Link from "next/link";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/MotionWrapper";
import { Heart, Trophy, Target, ArrowRight, Sparkles, Users, Play } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatMonthPeriod } from "@/lib/utils";
import { FlipCountdown } from "@/components/ui/FlipCountdown";

export const revalidate = 60;

async function getHomeData() {
  const supabaseAdmin = createAdminClient();

  const { data: charities } = await supabaseAdmin
    .from("charities")
    .select("*")
    .eq("is_active", true);

  const featuredCharity = charities?.find((c) => c.is_featured) || charities?.[0];

  const { data: payments } = await supabaseAdmin.from("payments").select("charity_amount_pence");
  const totalRaisedPence = payments ? payments.reduce((sum, p) => sum + p.charity_amount_pence, 0) : 142500;

  const { data: activeSubs } = await supabaseAdmin.from("subscriptions").select("id").eq("status", "active");
  const activeCount = activeSubs ? activeSubs.length : 24;

  const { data: latestDraw } = await supabaseAdmin
    .from("draws")
    .select("*")
    .eq("status", "published")
    .order("period_month", { ascending: false })
    .limit(1)
    .maybeSingle();

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
    <div className="min-h-screen flex flex-col bg-[#0A0E1C] text-[#F4F1EA] selection:bg-[#FF5A36]/30">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION WITH AMBIENT GRADIENT BLOBS */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8">
          <div className="ambient-blobs">
            <div className="ambient-blob-1" />
            <div className="ambient-blob-2" />
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-vermillion text-vermillion text-xs sm:text-sm font-semibold mb-8 border border-vermillion/40">
                <Sparkles className="w-4 h-4 text-vermillion" />
                <span>Golf with Purpose • Monthly Jackpot • 10%+ Charity Share</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
                Turn Every Round of Golf Into <span className="bg-gradient-to-r from-vermillion via-vermillion-glow to-amber-400 bg-clip-text text-transparent">Life-Changing Impact</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mt-6 text-lg sm:text-xl text-periwinkle-muted max-w-2xl mx-auto font-light leading-relaxed">
                Log your last 5 golf scores, pick 5 lucky numbers, enter monthly cash draw pools, and automatically direct a minimum of 10% of your fee to the charity you care about most.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-display font-bold text-lg bg-gradient-to-r from-vermillion to-amber-600 text-white shadow-xl shadow-vermillion/30 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <Trophy className="w-5 h-5 text-white" />
                  Subscribe & Play (£20/mo)
                  <ArrowRight className="w-5 h-5" />
                </Link>

                {data.latestDraw && (
                  <Link
                    href={`/results/${data.latestDraw.id}/reveal`}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-display font-bold text-lg glass-panel-chartreuse text-chartreuse hover:bg-chartreuse/20 transition-all flex items-center justify-center gap-2 border border-chartreuse/40"
                  >
                    <Play className="w-5 h-5 text-chartreuse fill-chartreuse/20" />
                    Watch Live Draw Reveal
                  </Link>
                )}
              </div>
            </FadeIn>

            {/* LIVE IMPACT & JACKPOT TICKER COUNTERS */}
            <FadeIn delay={0.4}>
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="glass-panel p-6 rounded-3xl border border-white/10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-periwinkle/10 text-periwinkle mx-auto mb-3">
                    <Heart className="w-6 h-6 fill-periwinkle/30" />
                  </div>
                  <div className="font-display text-3xl font-extrabold text-white">
                    {formatCurrency(data.totalRaisedPence)}
                  </div>
                  <div className="text-xs text-periwinkle-muted font-medium uppercase tracking-wider mt-1">
                    Total Raised for Charities
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-white/10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-periwinkle/10 text-periwinkle mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="font-display text-3xl font-extrabold text-white">
                    {data.charityCount} Partner Charities
                  </div>
                  <div className="text-xs text-periwinkle-muted font-medium uppercase tracking-wider mt-1">
                    Direct Impact Partners
                  </div>
                </div>

                <div className="glass-panel-vermillion p-6 rounded-3xl border border-vermillion/40 glow-vermillion">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-vermillion/20 text-vermillion mx-auto mb-3">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="font-display text-3xl font-extrabold text-vermillion bg-gradient-to-r from-vermillion to-amber-400 bg-clip-text text-transparent">
                    {formatCurrency(data.currentJackpotPence)}
                  </div>
                  <div className="text-xs text-vermillion-glow font-medium uppercase tracking-wider mt-1">
                    Est. Next Jackpot Pool
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FEATURED CHARITY SPOTLIGHT */}
        {data.featuredCharity && (
          <section className="py-16 bg-[#131A2E] border-y border-white/5 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-periwinkle bg-periwinkle/10 px-3.5 py-1.5 rounded-full border border-periwinkle/20">
                  Featured Cause Spotlight
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-4">
                  Where Your Golf Fees Make a Real Difference
                </h2>
              </div>

              <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-periwinkle/10 text-periwinkle text-xs font-semibold uppercase tracking-wider">
                    {data.featuredCharity.category}
                  </span>
                  <h3 className="font-display text-3xl font-bold text-white">
                    {data.featuredCharity.name}
                  </h3>
                  <p className="text-periwinkle-muted leading-relaxed">
                    {data.featuredCharity.long_description}
                  </p>
                  <Link
                    href={`/charities/${data.featuredCharity.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-periwinkle/20 text-periwinkle border border-periwinkle/40 font-semibold text-sm transition-all hover:bg-periwinkle/30"
                  >
                    View Charity Profile & Events
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src={data.featuredCharity.hero_image_url}
                    alt={data.featuredCharity.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1C] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white p-2 shadow-lg flex items-center justify-center shrink-0">
                      <img src={data.featuredCharity.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">{data.featuredCharity.name}</div>
                      <div className="text-xs text-periwinkle-muted">{data.featuredCharity.short_description}</div>
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
            <p className="mt-4 text-periwinkle-muted text-lg">
              No complex handicap math. Track your rounds, pick your lucky numbers, and support grass-roots charities.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StaggerItem>
              <div className="glass-panel p-8 rounded-3xl border border-white/10 relative h-full flex flex-col hover:border-vermillion/40 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-vermillion/10 text-vermillion font-display font-extrabold text-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  1
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  Log Your Rolling 5 Scores
                </h3>
                <p className="text-periwinkle-muted text-sm leading-relaxed flex-1">
                  Keep your last 5 golf scores (1–45 range) up to date in your dashboard. Any new score automatically keeps your profile active for monthly draws.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass-panel p-8 rounded-3xl border border-white/10 relative h-full flex flex-col hover:border-chartreuse/40 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-chartreuse/10 text-chartreuse font-display font-extrabold text-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  2
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  Select 5 Lucky Numbers
                </h3>
                <p className="text-periwinkle-muted text-sm leading-relaxed flex-1">
                  Choose 5 numbers between 1 and 45. Match 5 for the Jackpot (40% pool), 4 for Tier Two (35%), or 3 for Tier Three (25%). Unclaimed pools roll over!
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass-panel p-8 rounded-3xl border border-white/10 relative h-full flex flex-col hover:border-periwinkle/40 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-periwinkle/10 text-periwinkle font-display font-extrabold text-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  3
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  Direct Your Charity Impact
                </h3>
                <p className="text-periwinkle-muted text-sm leading-relaxed flex-1">
                  Allocate between 10% and 100% of your subscription fee to any partner charity. Track direct contributions transparently in your user portal.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* MOST RECENT DRAW RESULTS */}
        {data.latestDraw && data.latestDraw.winning_numbers && (
          <section className="py-16 bg-[#131A2E] border-t border-white/5 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <span className="text-xs font-bold uppercase tracking-widest text-chartreuse bg-chartreuse/10 px-3.5 py-1.5 rounded-full border border-chartreuse/20">
                Latest Published Draw • {formatMonthPeriod(data.latestDraw.period_month)}
              </span>
              <h2 className="font-display text-3xl font-extrabold text-white">
                Winning Numbers
              </h2>

              <div className="flex flex-wrap justify-center gap-4">
                {data.latestDraw.winning_numbers.map((num: number, idx: number) => (
                  <div
                    key={idx}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-chartreuse-glow via-chartreuse to-chartreuse-dark text-[#0A0E1C] font-display font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-xl glow-chartreuse"
                  >
                    {num}
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <Link
                  href={`/results/${data.latestDraw.id}/reveal`}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-vermillion to-amber-500 text-white font-bold text-sm shadow-xl shadow-vermillion/25 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" /> Replay Live Reveal Experience
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
