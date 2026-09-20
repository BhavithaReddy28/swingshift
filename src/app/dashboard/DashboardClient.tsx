"use client";

import { useState, useEffect } from "react";
import { Profile, Charity, Score, Subscription, Winner } from "@/lib/supabase/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Trophy,
  Heart,
  Target,
  Award,
  Calendar,
  Trash2,
  Plus,
  Sparkles,
  Shuffle,
  ShieldCheck,
  Clock,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Edit2,
  Lock,
} from "lucide-react";

interface DashboardClientProps {
  initialProfile: Profile;
  initialSubscription: Subscription | null;
  initialScores: Score[];
  initialWinners: Winner[];
  charities: Charity[];
}

export function DashboardClient({
  initialProfile,
  initialSubscription,
  initialScores,
  initialWinners,
  charities,
}: DashboardClientProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [subscription, setSubscription] = useState<Subscription | null>(initialSubscription);
  const [scores, setScores] = useState<Score[]>(initialScores);
  const [winners, setWinners] = useState<Winner[]>(initialWinners);

  // Score Form state
  const [scoreVal, setScoreVal] = useState<number | "">(28);
  const [playedOnVal, setPlayedOnVal] = useState<string>(new Date().toISOString().split("T")[0]);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [scoreNote, setScoreNote] = useState<string | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  // Lucky Numbers state
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>(
    initialProfile.lucky_numbers && initialProfile.lucky_numbers.length === 5
      ? initialProfile.lucky_numbers
      : [7, 14, 21, 28, 35]
  );
  const [numbersLoading, setNumbersLoading] = useState(false);
  const [numbersSuccess, setNumbersSuccess] = useState(false);

  // Charity preference state
  const [selectedCharityId, setSelectedCharityId] = useState<string>(
    initialProfile.charity_id || (charities[0]?.id || "")
  );
  const [charityPercentage, setCharityPercentage] = useState<number>(
    initialProfile.charity_percentage || 10
  );
  const [charityLoading, setCharityLoading] = useState(false);
  const [charitySuccess, setCharitySuccess] = useState(false);

  // Proof upload state
  const [uploadingWinnerId, setUploadingWinnerId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const isActiveSubscriber = subscription?.status === "active";

  // Score Entry submit handler
  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setScoreError(null);
    setScoreNote(null);
    setScoreLoading(true);

    try {
      const numScore = Number(scoreVal);
      if (numScore < 1 || numScore > 45) {
        throw new Error("Score must be between 1 and 45.");
      }

      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: numScore, playedOn: playedOnVal }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save score");

      // Refetch scores
      const resScores = await fetch("/api/scores");
      const scoresData = await resScores.json();
      if (scoresData.scores) {
        setScores(scoresData.scores);
      }

      if (data.note) {
        setScoreNote(data.note);
      }
    } catch (err: any) {
      setScoreError(err.message);
    } finally {
      setScoreLoading(false);
    }
  };

  const handleDeleteScore = async (id: string) => {
    if (!confirm("Are you sure you want to delete this score record?")) return;
    try {
      const res = await fetch(`/api/scores?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setScores(scores.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Lucky numbers toggle handler
  const toggleNumber = (num: number) => {
    if (!isActiveSubscriber) return;
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= 5) {
        // Replace oldest or cap at 5
        setSelectedNumbers([...selectedNumbers.slice(1), num]);
      } else {
        setSelectedNumbers([...selectedNumbers, num]);
      }
    }
  };

  const handleQuickPick = () => {
    if (!isActiveSubscriber) return;
    const nums = new Set<number>();
    while (nums.size < 5) {
      nums.add(Math.floor(Math.random() * 45) + 1);
    }
    setSelectedNumbers(Array.from(nums).sort((a, b) => a - b));
  };

  const handleSaveNumbers = async () => {
    if (selectedNumbers.length !== 5) {
      alert("Please select exactly 5 numbers.");
      return;
    }
    setNumbersLoading(true);
    setNumbersSuccess(false);
    try {
      const res = await fetch("/api/numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers: selectedNumbers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save numbers");
      setNumbersSuccess(true);
      setTimeout(() => setNumbersSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setNumbersLoading(false);
    }
  };

  // Save charity preferences
  const handleSaveCharity = async () => {
    setCharityLoading(true);
    setCharitySuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charityId: selectedCharityId,
          charityPercentage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update charity preferences");
      if (data.profile) {
        setProfile(data.profile);
      }
      setCharitySuccess(true);
      setTimeout(() => setCharitySuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCharityLoading(false);
    }
  };

  // Proof upload handler
  const handleProofUpload = async (winnerId: string) => {
    if (!uploadFile) {
      alert("Please select an image file first.");
      return;
    }
    setUploadLoading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("winnerId", winnerId);
      formData.append("file", uploadFile);

      const res = await fetch("/api/winners/proof", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      // Update local winners state
      setWinners(winners.map((w) => (w.id === winnerId ? data.winner : w)));
      setUploadSuccess(true);
      setUploadingWinnerId(null);
      setUploadFile(null);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const currentCharity = charities.find((c) => c.id === selectedCharityId) || charities[0];

  return (
    <div className="space-y-8">
      {/* RESTRICTED ACCESS BANNER (IF LAPSED/INACTIVE) */}
      {!isActiveSubscriber && (
        <div className="glass-panel-amber p-6 rounded-3xl border border-orange-500/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Subscription Lapsed / Inactive</h3>
              <p className="text-xs text-gray-300">
                Score entry, lucky number selection, and monthly draw participation are restricted for non-active subscribers. Re-subscribe to reactivate your draw entry!
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  plan: subscription?.plan || "monthly",
                  charityId: selectedCharityId,
                  charityPercentage,
                }),
              });
              const d = await res.json();
              if (d.url) window.location.href = d.url;
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 font-semibold text-sm text-white shadow-lg hover:from-orange-600 hover:to-amber-700 transition-all"
          >
            Re-Subscribe Now (£20/mo)
          </button>
        </div>
      )}

      {/* TOP ROW: SUBSCRIPTION CARD & NEXT DRAW COUNTDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Status Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg">Subscription Overview</h3>
                <span className="text-xs text-gray-400 capitalize">
                  {subscription?.plan || "Monthly"} Plan
                </span>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isActiveSubscriber
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                  : "bg-red-500/20 text-red-300 border border-red-500/40"
              }`}
            >
              {subscription?.status || "Lapsed"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5 text-sm">
            <div>
              <span className="text-gray-400 text-xs block">Period Start</span>
              <span className="font-semibold text-white">
                {subscription?.current_period_start ? formatDate(subscription.current_period_start) : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-xs block">Renewal / Expiry Date</span>
              <span className="font-semibold text-white">
                {subscription?.current_period_end ? formatDate(subscription.current_period_end) : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-xs block">Auto-Renew Status</span>
              <span className="font-semibold text-white">
                {subscription?.cancel_at_period_end ? "Cancels at period end" : "Active Auto-Renew"}
              </span>
            </div>
          </div>
        </div>

        {/* Next Draw Countdown Card */}
        <div className="glass-panel-amber p-6 rounded-3xl border border-orange-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Next Monthly Draw</span>
              <Clock className="w-4 h-4 text-orange-400" />
            </div>
            <div className="font-display font-extrabold text-2xl text-white">1st of Next Month</div>
            <p className="text-xs text-gray-300 mt-1">
              Your numbers & 5-score history are active for entry.
            </p>
          </div>

          <div className="pt-4 border-t border-orange-500/20 flex items-center justify-between text-xs text-orange-200">
            <span>Entry Status:</span>
            <span className="font-bold text-teal-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
            </span>
          </div>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. SCORE ENTRY & ROLLING HISTORY */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">Rolling 5 Score Tracker</h3>
                <p className="text-xs text-gray-400">Score Range: 1–45 (Stableford)</p>
              </div>
            </div>
            <span className="text-xs bg-white/10 px-2.5 py-1 rounded-md text-gray-300 font-mono">
              {scores.length}/5 Saved
            </span>
          </div>

          {scoreError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {scoreError}
            </div>
          )}

          {scoreNote && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
              {scoreNote}
            </div>
          )}

          {/* Add Score Form */}
          <form onSubmit={handleAddScore} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Score (1–45)
              </label>
              <input
                type="number"
                min="1"
                max="45"
                disabled={!isActiveSubscriber || scoreLoading}
                value={scoreVal}
                onChange={(e) => setScoreVal(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Date Played
              </label>
              <input
                type="date"
                disabled={!isActiveSubscriber || scoreLoading}
                value={playedOnVal}
                onChange={(e) => setPlayedOnVal(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 disabled:opacity-50"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={!isActiveSubscriber || scoreLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-sm hover:from-orange-600 hover:to-amber-700 transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {scoreLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Score</>}
              </button>
            </div>
          </form>

          {/* Scores Table */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Retained Rolling Scores (Newest First)
            </span>

            {scores.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs glass-panel rounded-2xl border border-white/5">
                No scores recorded yet. Add your first score above!
              </div>
            ) : (
              <div className="space-y-2">
                {scores.map((s, idx) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-orange-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-mono font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </div>
                      <div>
                        <span className="font-display font-bold text-white text-base">
                          {s.score} Points
                        </span>
                        <span className="text-xs text-gray-400 block">{formatDate(s.played_on)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteScore(s.id)}
                      disabled={!isActiveSubscriber}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete Score"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. LUCKY NUMBERS PICKER */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">Lucky Numbers Picker</h3>
                <p className="text-xs text-gray-400">Pick 5 unique numbers (1–45)</p>
              </div>
            </div>

            <button
              onClick={handleQuickPick}
              disabled={!isActiveSubscriber}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Shuffle className="w-3.5 h-3.5" /> Quick Pick
            </button>
          </div>

          {/* Selected Balls Badge Bar */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Selected:
            </span>
            <div className="flex gap-2">
              {selectedNumbers.sort((a, b) => a - b).map((num) => (
                <div
                  key={num}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 font-display font-bold text-white text-sm flex items-center justify-center shadow-md border border-amber-300/30"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* 1–45 Interactive Grid */}
          <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
            {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedNumbers.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  disabled={!isActiveSubscriber}
                  className={`h-9 sm:h-10 rounded-xl font-display font-bold text-xs sm:text-sm transition-all flex items-center justify-center ${
                    isSelected
                      ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg scale-105 border border-amber-300"
                      : "bg-white/5 text-gray-300 hover:bg-white/15"
                  } disabled:opacity-50`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSaveNumbers}
            disabled={!isActiveSubscriber || numbersLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-sm hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {numbersLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : numbersSuccess ? (
              <><CheckCircle2 className="w-4 h-4 text-white" /> Saved Successfully!</>
            ) : (
              "Save Lucky Numbers Choice"
            )}
          </button>
        </div>

        {/* 3. CHARITY PREFERENCE SELECTOR */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-teal-400/20" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-white">Charity Allocation Settings</h3>
              <p className="text-xs text-gray-400">Direct 10%–100% of your fee</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Primary Designated Charity
              </label>
              <select
                value={selectedCharityId}
                onChange={(e) => setSelectedCharityId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                {charities.map((c) => (
                  <option key={c.id} value={c.id} className="bg-gray-900 text-white">
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            {currentCharity && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                <img
                  src={currentCharity.logo_url}
                  alt={currentCharity.name}
                  className="w-12 h-12 rounded-xl object-contain bg-white p-1"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">{currentCharity.name}</h4>
                  <p className="text-xs text-gray-400 line-clamp-1">{currentCharity.short_description}</p>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Contribution Share
                </label>
                <span className="font-display font-bold text-teal-400 text-base">
                  {charityPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={charityPercentage}
                onChange={(e) => setCharityPercentage(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

            <button
              onClick={handleSaveCharity}
              disabled={charityLoading}
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              {charityLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : charitySuccess ? (
                <><CheckCircle2 className="w-4 h-4" /> Preferences Updated!</>
              ) : (
                "Update Charity Preference"
              )}
            </button>
          </div>
        </div>

        {/* 4. WINNINGS & PROOF VERIFICATION CARD */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">Your Winnings & Verification</h3>
                <p className="text-xs text-gray-400">Upload score proof for admin payout approval</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase text-gray-400 block">Total Won</span>
              <span className="font-display font-extrabold text-amber-400 text-lg">
                {formatCurrency(winners.reduce((sum, w) => sum + w.prize_amount_pence, 0))}
              </span>
            </div>
          </div>

          {winners.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs glass-panel rounded-2xl border border-white/5">
              No winnings recorded yet. Keep your rolling 5 scores active for upcoming monthly draws!
            </div>
          ) : (
            <div className="space-y-4">
              {winners.map((win) => (
                <div
                  key={win.id}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs uppercase">
                        Tier {win.tier} ({win.tier} Matches)
                      </span>
                      <span className="font-display font-bold text-white text-base">
                        {formatCurrency(win.prize_amount_pence)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          win.verification_status === "approved"
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                            : win.verification_status === "pending"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : win.verification_status === "rejected"
                            ? "bg-red-500/20 text-red-300 border border-red-500/40"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/40"
                        }`}
                      >
                        Verification: {win.verification_status}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          win.payment_status === "paid"
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/40"
                        }`}
                      >
                        Payout: {win.payment_status}
                      </span>
                    </div>
                  </div>

                  {win.rejection_reason && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                      Rejection Reason: {win.rejection_reason}
                    </div>
                  )}

                  {/* Upload Control */}
                  {win.verification_status !== "approved" && (
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Upload Score Proof Screenshot
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setUploadFile(e.target.files[0]);
                              setUploadingWinnerId(win.id);
                            }
                          }}
                          className="text-xs text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                        />
                        {uploadingWinnerId === win.id && uploadFile && (
                          <button
                            onClick={() => handleProofUpload(win.id)}
                            disabled={uploadLoading}
                            className="px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold text-xs hover:bg-orange-600 transition-all flex items-center gap-1.5"
                          >
                            {uploadLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Upload className="w-3.5 h-3.5" /> Submit Proof</>}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
