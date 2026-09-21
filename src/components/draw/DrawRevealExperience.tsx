"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { soundEngine } from "@/lib/audio-effects";
import { formatCurrency, formatMonthPeriod } from "@/lib/utils";
import { FlipCountdown } from "@/components/ui/FlipCountdown";
import {
  Volume2,
  VolumeX,
  Trophy,
  Play,
  ArrowRight,
  TrendingUp,
  Heart,
  Award,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ConfettiBackground } from "@/components/illustrations/ConfettiBackground";

interface DrawRevealProps {
  draw: {
    id: string;
    period_month: string;
    winning_numbers: number[] | null;
    status: string;
    total_pool_pence: number;
    rollover_out_pence: number;
    mode: string;
    published_at: string | null;
  };
  subscriberEntry?: {
    numbers: number[];
    matchCount: number;
    winTier?: number;
    prizeAmountPence?: number;
    charityName?: string;
    charityAmountPence?: number;
  } | null;
  winnersSummary?: {
    tier5: { count: number; prizePence: number };
    tier4: { count: number; prizePence: number };
    tier3: { count: number; prizePence: number };
  };
  isAdminSimulation?: boolean;
}

export function DrawRevealExperience({
  draw,
  subscriberEntry,
  winnersSummary,
  isAdminSimulation = false,
}: DrawRevealProps) {
  const [soundOn, setSoundOn] = useState(false);
  const [revealState, setRevealState] = useState<"idle" | "revealing" | "completed">("idle");
  const [revealedBalls, setRevealedBalls] = useState<number[]>([]);
  const [activeSpinIndex, setActiveSpinIndex] = useState<number | null>(null);
  const [spinDigits, setSpinDigits] = useState<number[]>([1, 1, 1, 1, 1]);
  const [countUpPrize, setCountUpPrize] = useState<number>(0);

  const winningNumbers = draw.winning_numbers || [7, 14, 21, 28, 35];

  useEffect(() => {
    setSoundOn(soundEngine.isEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundEngine.setEnabled(next);
  };

  // Start sequential 5-ball slot-reel reveal
  const startReveal = () => {
    setRevealState("revealing");
    setRevealedBalls([]);
    setCountUpPrize(0);

    let ballIdx = 0;

    const revealNextBall = () => {
      if (ballIdx >= 5) {
        // Complete state
        setActiveSpinIndex(null);
        setRevealState("completed");
        handleRevealCompleted();
        return;
      }

      setActiveSpinIndex(ballIdx);

      // Rapid slot reel digit cycling for 800ms
      const spinInterval = setInterval(() => {
        setSpinDigits((prev) => {
          const copy = [...prev];
          copy[ballIdx] = Math.floor(Math.random() * 45) + 1;
          return copy;
        });
      }, 50);

      setTimeout(() => {
        clearInterval(spinInterval);
        const targetNum = winningNumbers[ballIdx];

        setRevealedBalls((prev) => [...prev, targetNum]);
        soundEngine.playBallLockIn(ballIdx);

        ballIdx++;

        // 600ms stagger to next ball
        setTimeout(revealNextBall, 600);
      }, 800);
    };

    revealNextBall();
  };

  // Post reveal effects
  const handleRevealCompleted = () => {
    const isWinner = (subscriberEntry?.winTier || 0) >= 3;

    if (isWinner && !isAdminSimulation) {
      // Sound sting
      soundEngine.playWinSting();

      // Canvas Confetti burst in vermillion (#FF5A36) and chartreuse (#C4F135)
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#FF5A36", "#C4F135", "#FF8A65", "#DFFF7A", "#FFFFFF"],
        });
      } catch {
        // Fallback swallow
      }

      // Prize count-up animation
      const targetPrize = subscriberEntry?.prizeAmountPence || 0;
      let start = 0;
      const step = Math.max(1, Math.floor(targetPrize / 30));
      const countTimer = setInterval(() => {
        start += step;
        if (start >= targetPrize) {
          setCountUpPrize(targetPrize);
          clearInterval(countTimer);
        } else {
          setCountUpPrize(start);
        }
      }, 30);
    }
  };

  const isWinner = (subscriberEntry?.winTier || 0) >= 3;
  const isDrawPublished = draw.status === "published" || isAdminSimulation;

  return (
    <div className="relative min-h-screen bg-transparent text-[#F4F1EA] flex flex-col justify-between overflow-hidden selection:bg-primary/30">
      {/* Background Hero Gradient & Ambient Blobs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-[#7A2E3D]/10 to-[#0A0E1C] pointer-events-none z-0" />
      <div className="ambient-blobs">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />
      </div>

      <ConfettiBackground count={25} className="z-0" />

      {/* TOP HEADER BAR */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link href="/results" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-xl text-white tracking-tight">
              Digital<span className="text-primary">Heroes</span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-periwinkle font-semibold -mt-1">
              Live Reveal Experience
            </span>
          </div>
        </Link>

        {/* Audio Mute/Unmute Toggle */}
        <button
          onClick={toggleSound}
          className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-semibold ${
            soundOn
              ? "bg-chartreuse/10 border-chartreuse/40 text-chartreuse shadow-lg shadow-chartreuse/10"
              : "bg-[#131A2E] border-border text-periwinkle-muted hover:text-white"
          }`}
          title={soundOn ? "Sound Enabled" : "Sound Muted"}
        >
          {soundOn ? <Volume2 className="w-5 h-5 text-chartreuse" /> : <VolumeX className="w-5 h-5" />}
          <span className="hidden sm:inline">{soundOn ? "Sound On" : "Muted"}</span>
        </button>
      </header>

      {/* MAIN REVEAL CONTENT AREA */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col items-center justify-center text-center space-y-10">
        {/* Draw Header */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-periwinkle bg-periwinkle/10 px-4 py-1.5 rounded-full border border-periwinkle/20">
            {formatMonthPeriod(draw.period_month)} Monthly Draw
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Official Number Reveal
          </h1>
          <p className="text-periwinkle-muted text-sm sm:text-base max-w-md mx-auto">
            Mode: <strong className="text-white uppercase">{draw.mode}</strong> • Total Pool:{" "}
            <strong className="text-chartreuse">{formatCurrency(draw.total_pool_pence)}</strong>
          </p>
        </div>

        {/* ANTICIPATION / COUNTDOWN STATE */}
        {revealState === "idle" && (
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-border max-w-xl w-full space-y-8 glow-vermillion">
            {!isDrawPublished ? (
              <div className="space-y-6">
                <div className="text-xs font-semibold text-periwinkle uppercase tracking-wider">
                  Draw Execution Countdown
                </div>
                <div className="flex justify-center">
                  <FlipCountdown targetDate={draw.period_month} />
                </div>
                <p className="text-xs text-periwinkle-muted">
                  The draw algorithm runs automatically on the 1st of every month.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto shadow-2xl shadow-primary/40 animate-pulse">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>

                <div>
                  <h2 className="font-display font-bold text-2xl text-white">Winning Numbers Ready</h2>
                  <p className="text-xs text-periwinkle-muted mt-1">
                    Click below to trigger the 5-number live reveal sequence.
                  </p>
                </div>

                <button
                  onClick={startReveal}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-primary-glow to-primary-glow text-white font-display font-extrabold text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                  Reveal Winning Numbers
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* REVEALING & COMPLETED BALL SLOTS REEL */}
        {(revealState === "revealing" || revealState === "completed") && (
          <div className="space-y-10 w-full">
            {/* 5 BALL SLOTS ROW */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {[0, 1, 2, 3, 4].map((idx) => {
                const isRevealed = idx < revealedBalls.length;
                const isSpinning = activeSpinIndex === idx;
                const ballValue = isRevealed
                  ? revealedBalls[idx]
                  : isSpinning
                  ? spinDigits[idx]
                  : "?";

                return (
                  <div
                    key={idx}
                    className={`w-20 h-20 sm:w-28 sm:h-28 rounded-3xl font-display font-extrabold text-3xl sm:text-5xl flex items-center justify-center transition-all duration-500 border ${
                      isRevealed
                        ? "bg-gradient-to-br from-chartreuse-glow via-chartreuse to-chartreuse-dark text-[#0A0E1C] border-chartreuse shadow-2xl glow-chartreuse animate-ball-bounce"
                        : isSpinning
                        ? "bg-[#131A2E] text-primary border-vermillion/50 animate-pulse glow-vermillion"
                        : "bg-[#131A2E] text-periwinkle-muted border-border"
                    }`}
                  >
                    {ballValue}
                  </div>
                );
              })}
            </div>

            {/* POST REVEAL OUTCOMES */}
            {revealState === "completed" && (
              <div className="space-y-8 max-w-xl mx-auto w-full animate-fadeIn">
                {/* 1. WINNER CELEBRATION CARD */}
                {isWinner && !isAdminSimulation && (
                  <div className="glass-panel-chartreuse p-8 rounded-3xl border border-chartreuse/40 space-y-4 glow-chartreuse">
                    <div className="w-12 h-12 rounded-2xl bg-chartreuse/20 text-chartreuse flex items-center justify-center mx-auto">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-chartreuse">
                      Congratulations Winner!
                    </span>
                    <h3 className="font-display font-extrabold text-3xl text-white">
                      You Matched {subscriberEntry?.matchCount} Numbers!
                    </h3>
                    <div className="font-display font-extrabold text-4xl text-chartreuse bg-gradient-to-r from-chartreuse-glow via-chartreuse to-chartreuse-dark bg-clip-text text-transparent">
                      {formatCurrency(countUpPrize)}
                    </div>
                    <p className="text-xs text-periwinkle-muted">
                      Tier {subscriberEntry?.winTier} Cash Prize Winner.
                    </p>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center w-full py-3.5 rounded-xl bg-chartreuse text-[#0A0E1C] font-display font-bold text-sm shadow-lg hover:bg-chartreuse-glow transition-all gap-2"
                    >
                      <Award className="w-4 h-4" /> Go to Dashboard & Upload Proof
                    </Link>
                  </div>
                )}

                {/* 2. NON-WINNER WARM PERIWINKLE CHARITY CARD */}
                {!isWinner && !isAdminSimulation && subscriberEntry && (
                  <div className="glass-panel-periwinkle p-8 rounded-3xl border border-periwinkle/30 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-periwinkle/20 text-periwinkle flex items-center justify-center mx-auto">
                      <Heart className="w-6 h-6 fill-periwinkle/30" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-white">
                      No Match This Month — But You Still Made an Impact!
                    </h3>
                    <p className="text-sm text-periwinkle-muted leading-relaxed">
                      Your numbers matched {subscriberEntry.matchCount} numbers this draw. Even without a cash prize, your subscription directly sent{" "}
                      <strong className="text-periwinkle font-semibold">
                        {formatCurrency(subscriberEntry.charityAmountPence || 200)}
                      </strong>{" "}
                      to <strong className="text-white">{subscriberEntry.charityName || "your selected charity"}</strong> this month.
                    </p>
                  </div>
                )}

                {/* 3. JACKPOT ROLLOVER BANNER */}
                {draw.rollover_out_pence > 0 && (
                  <div className="glass-panel-vermillion p-6 rounded-2xl border border-vermillion/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-vermillion/20 text-primary flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Unclaimed Jackpot Carryover
                        </span>
                        <h4 className="font-display font-bold text-white text-base">
                          Jackpot Rolls to {formatCurrency(draw.rollover_out_pence)} Next Month!
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs bg-vermillion/20 text-primary px-3 py-1 rounded-full font-bold">
                      Rollover Active
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TIER BREAKDOWN PANEL BELOW THE FOLD */}
        {winnersSummary && (
          <div className="w-full pt-12 border-t border-border space-y-6">
            <h3 className="font-display font-bold text-2xl text-white">Draw Tier Payout Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tier 5 */}
              <div
                className={`p-6 rounded-3xl border transition-all ${
                  winnersSummary.tier5.count > 0
                    ? "glass-panel-chartreuse border-chartreuse/40"
                    : "glass-panel opacity-60 border-border"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-chartreuse">
                  Jackpot Tier (5 Matches)
                </span>
                <div className="font-display font-extrabold text-2xl text-white mt-2">
                  {winnersSummary.tier5.count} Winner{winnersSummary.tier5.count !== 1 ? "s" : ""}
                </div>
                <p className="text-xs text-periwinkle-muted mt-1">
                  {winnersSummary.tier5.count > 0
                    ? `${formatCurrency(winnersSummary.tier5.prizePence)} per winner`
                    : "Rolled Over to Next Month"}
                </p>
              </div>

              {/* Tier 4 */}
              <div
                className={`p-6 rounded-3xl border transition-all ${
                  winnersSummary.tier4.count > 0
                    ? "glass-panel-chartreuse border-chartreuse/40"
                    : "glass-panel opacity-60 border-border"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-chartreuse">
                  Tier Two (4 Matches)
                </span>
                <div className="font-display font-extrabold text-2xl text-white mt-2">
                  {winnersSummary.tier4.count} Winner{winnersSummary.tier4.count !== 1 ? "s" : ""}
                </div>
                <p className="text-xs text-periwinkle-muted mt-1">
                  {winnersSummary.tier4.count > 0
                    ? `${formatCurrency(winnersSummary.tier4.prizePence)} per winner`
                    : "Unclaimed → Rolled Over"}
                </p>
              </div>

              {/* Tier 3 */}
              <div
                className={`p-6 rounded-3xl border transition-all ${
                  winnersSummary.tier3.count > 0
                    ? "glass-panel-chartreuse border-chartreuse/40"
                    : "glass-panel opacity-60 border-border"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-chartreuse">
                  Tier Three (3 Matches)
                </span>
                <div className="font-display font-extrabold text-2xl text-white mt-2">
                  {winnersSummary.tier3.count} Winner{winnersSummary.tier3.count !== 1 ? "s" : ""}
                </div>
                <p className="text-xs text-periwinkle-muted mt-1">
                  {winnersSummary.tier3.count > 0
                    ? `${formatCurrency(winnersSummary.tier3.prizePence)} per winner`
                    : "Unclaimed → Rolled Over"}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
