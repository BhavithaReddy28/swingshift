"use client";

import { useState } from "react";
import { Draw } from "@/lib/supabase/types";
import { formatCurrency, formatMonthPeriod, formatDate } from "@/lib/utils";
import { Trophy, RefreshCw, Lock, Sparkles, Plus, Loader2, CheckCircle2, Play } from "lucide-react";

export function AdminDrawsClient({ initialDraws }: { initialDraws: Draw[] }) {
  const [draws, setDraws] = useState<Draw[]>(initialDraws);

  // Create Draw Form State
  const [periodMonth, setPeriodMonth] = useState("2026-10-01");
  const [mode, setMode] = useState<"random" | "algorithmic">("random");
  const [createLoading, setCreateLoading] = useState(false);

  // Simulation State
  const [simulatingDrawId, setSimulatingDrawId] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Publish State
  const [publishLoading, setPublishLoading] = useState(false);

  // Create Draw
  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const res = await fetch("/api/admin/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodMonth, mode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create draw draft");

      setDraws([data.draw, ...draws]);
      alert(`Draft draw created for ${periodMonth}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Run Simulation
  const handleSimulate = async (drawId: string) => {
    setSimulatingDrawId(drawId);
    setSimLoading(true);
    setSimulationResult(null);

    try {
      const res = await fetch(`/api/admin/draws/${drawId}/simulate`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation failed");

      setSimulationResult(data.simulation);

      // Update draw in local list
      setDraws(draws.map((d) => (d.id === drawId ? data.draw : d)));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSimLoading(false);
    }
  };

  // Run Publish
  const handlePublish = async (drawId: string) => {
    if (!confirm("Are you sure you want to PUBLISH this draw? This will write permanent winner rows, lock the draw, and apply rollover carryover.")) {
      return;
    }

    setPublishLoading(true);
    try {
      const res = await fetch(`/api/admin/draws/${drawId}/publish`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");

      // Update draw in local list
      setDraws(draws.map((d) => (d.id === drawId ? data.draw : d)));
      setSimulatingDrawId(null);
      setSimulationResult(null);
      alert(`Draw published successfully! ${data.winnerCount} winners created.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPublishLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Draw Draft Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">Create New Monthly Draw Draft</h2>
            <p className="text-xs text-gray-400">Select period month (first of month) and draw mode.</p>
          </div>
        </div>

        <form onSubmit={handleCreateDraw} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Period Month (YYYY-MM-01)
            </label>
            <input
              type="date"
              value={periodMonth}
              onChange={(e) => setPeriodMonth(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Draw Generation Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "random" | "algorithmic")}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="random" className="bg-gray-900 text-white">
                Random Mode (Crypto-Random Seeded)
              </option>
              <option value="algorithmic" className="bg-gray-900 text-white">
                Algorithmic Mode (Weighted Score Frequency)
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={createLoading}
            className="py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-sm hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Draw Draft"}
          </button>
        </form>
      </div>

      {/* List of Draws */}
      <div className="space-y-6">
        <h2 className="font-display font-bold text-2xl text-white">Monthly Draw Management</h2>

        {draws.map((draw) => {
          const isPublished = draw.status === "published";
          const isSimulating = simulatingDrawId === draw.id;

          return (
            <div
              key={draw.id}
              className={`glass-panel p-6 sm:p-8 rounded-3xl border transition-all space-y-6 ${
                isPublished
                  ? "border-white/10"
                  : "border-amber-500/40 amber-glow"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-bold text-2xl text-white">
                      {formatMonthPeriod(draw.period_month)} Draw
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isPublished
                          ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {draw.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">Mode: <strong className="text-white uppercase">{draw.mode}</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  {!isPublished ? (
                    <>
                      <button
                        onClick={() => handleSimulate(draw.id)}
                        disabled={simLoading}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        {simLoading && isSimulating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><Play className="w-4 h-4" /> Simulate Draw</>
                        )}
                      </button>

                      <button
                        onClick={() => handlePublish(draw.id)}
                        disabled={publishLoading}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg text-xs font-bold flex items-center gap-1.5 hover:from-orange-600 hover:to-amber-700 transition-all"
                      >
                        {publishLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><Lock className="w-4 h-4" /> Publish & Lock Draw</>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-teal-400 font-bold bg-teal-500/10 px-3.5 py-1.5 rounded-full border border-teal-500/20">
                      <Lock className="w-4 h-4" /> Published & Locked
                    </div>
                  )}
                </div>
              </div>

              {/* Draw Numbers & Pool Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs text-gray-400 block mb-2 font-semibold uppercase tracking-wider">
                    Winning Numbers
                  </span>
                  <div className="flex gap-2">
                    {draw.winning_numbers && draw.winning_numbers.length === 5 ? (
                      draw.winning_numbers.map((num, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 font-display font-bold text-white text-sm flex items-center justify-center shadow-md border border-amber-300/30"
                        >
                          {num}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">Not generated yet (Run Simulate)</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block mb-1 font-semibold uppercase tracking-wider">
                    Total Pool
                  </span>
                  <span className="font-display font-extrabold text-white text-xl">
                    {formatCurrency(draw.total_pool_pence)}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block mb-1 font-semibold uppercase tracking-wider">
                    Rollover Carryover
                  </span>
                  <div className="text-xs text-gray-300">
                    In: <strong className="text-teal-300">{formatCurrency(draw.rollover_in_pence)}</strong> | Out: <strong className="text-amber-400">{formatCurrency(draw.rollover_out_pence)}</strong>
                  </div>
                </div>
              </div>

              {/* Algorithmic Mode Snapshot or Random Seed Info */}
              {draw.mode === "algorithmic" && draw.frequency_snapshot && (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">
                    Algorithmic Score Frequency Snapshot (Top Weighted Candidates)
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Object.entries(draw.frequency_snapshot)
                      .slice(0, 10)
                      .map(([score, count]) => (
                        <span key={score} className="px-2 py-1 rounded bg-white/5 text-gray-300">
                          Score <strong>{score}</strong>: {count as number}x (Weight {1 + (count as number)})
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* SIMULATION PREVIEW PANEL */}
              {isSimulating && simulationResult && (
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                  <h4 className="font-display font-bold text-amber-300 text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> Live Simulation Preview (Not Yet Published)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 block">Eligible Entries:</span>
                      <strong className="text-white text-base">{simulationResult.eligibleCount}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Jackpot Winners (5 Match):</span>
                      <strong className="text-amber-400 text-base">{simulationResult.prizeSplit.winnerCounts.tier5}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Estimated Rollover Out:</span>
                      <strong className="text-teal-300 text-base">{formatCurrency(simulationResult.prizeSplit.rolloverOutPence)}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
