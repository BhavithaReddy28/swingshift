"use client";

import { useState } from "react";
import { Winner } from "@/lib/supabase/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Award, CheckCircle2, XCircle, ExternalLink, Loader2, DollarSign, ShieldAlert } from "lucide-react";

interface AdminWinnersClientProps {
  initialWinners: any[];
}

export function AdminWinnersClient({ initialWinners }: AdminWinnersClientProps) {
  const [winners, setWinners] = useState<any[]>(initialWinners);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectionReasonMap, setRejectionReasonMap] = useState<Record<string, string>>({});

  const filteredWinners = winners.filter((w) => {
    if (filterStatus === "all") return true;
    return w.verification_status === filterStatus;
  });

  // Verify Proof (Approve or Reject)
  const handleVerify = async (winnerId: string, status: "approved" | "rejected") => {
    const rejectionReason = rejectionReasonMap[winnerId] || "";
    if (status === "rejected" && !rejectionReason) {
      alert("Please provide a rejection reason.");
      return;
    }

    setActionLoadingId(winnerId);
    try {
      const res = await fetch(`/api/admin/winners/${winnerId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify winner proof");

      setWinners(winners.map((w) => (w.id === winnerId ? { ...w, ...data.winner } : w)));
      alert(`Winner proof ${status} successfully!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Process Payout (Mark Paid) - VERIFICATION GATE CHECKED SERVER-SIDE
  const handlePayout = async (winnerId: string) => {
    setActionLoadingId(winnerId);
    try {
      const res = await fetch(`/api/admin/winners/${winnerId}/payout`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payout processing failed");

      setWinners(winners.map((w) => (w.id === winnerId ? { ...w, ...data.winner } : w)));
      alert("Payout status updated to PAID!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Winner Verification Queue</h1>
          <p className="text-muted text-sm mt-1">
            Review score proof screenshots, approve winner eligibility, and release payouts.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected", "not_submitted"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all capitalize ${
                filterStatus === status
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-ink-elevated text-muted hover:text-white"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Winners List Table */}
      {filteredWinners.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-border">
          <Award className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">No winners match this filter</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWinners.map((win) => {
            const isLoading = actionLoadingId === win.id;
            const profile = win.profiles;
            const draw = win.draws;

            return (
              <div
                key={win.id}
                className="glass-panel p-6 rounded-3xl border border-border space-y-4 hover:border-amber-500/30 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-lg text-white">
                        {profile?.full_name || "Unknown Subscriber"}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold uppercase">
                        Tier {win.tier} ({win.tier} Matches)
                      </span>
                    </div>
                    <span className="text-xs text-muted">
                      Draw: {draw?.period_month ? formatDate(draw.period_month) : "Monthly Draw"} | Prize: <strong className="text-amber-400">{formatCurrency(win.prize_amount_pence)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        win.verification_status === "approved"
                          ? "bg-teal-500/20 text-support border border-teal-500/40"
                          : win.verification_status === "pending"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : win.verification_status === "rejected"
                          ? "bg-red-500/20 text-red-300 border border-red-500/40"
                          : "bg-gray-500/20 text-muted border border-gray-500/40"
                      }`}
                    >
                      Verify: {win.verification_status}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        win.payment_status === "paid"
                          ? "bg-teal-500/20 text-support border border-teal-500/40"
                          : "bg-gray-500/20 text-muted border border-gray-500/40"
                      }`}
                    >
                      Payout: {win.payment_status}
                    </span>
                  </div>
                </div>

                {/* Proof Image & Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <span className="text-xs text-muted font-semibold uppercase tracking-wider block mb-2">
                      Proof Screenshot File
                    </span>
                    {win.signedProofUrl ? (
                      <a
                        href={win.signedProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-secondary bg-primary/10 border border-primary/30 px-3.5 py-2 rounded-xl"
                      >
                        <ExternalLink className="w-4 h-4" /> View Proof Screenshot
                      </a>
                    ) : (
                      <span className="text-xs text-muted italic">No proof file uploaded yet</span>
                    )}
                  </div>

                  {/* Actions & Verification Gate */}
                  <div className="space-y-3">
                    {win.verification_status === "pending" && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Reason if rejecting..."
                          value={rejectionReasonMap[win.id] || ""}
                          onChange={(e) =>
                            setRejectionReasonMap({
                              ...rejectionReasonMap,
                              [win.id]: e.target.value,
                            })
                          }
                          className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(win.id, "approved")}
                            disabled={isLoading}
                            className="flex-1 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1"
                          >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5" /> Approve Proof</>}
                          </button>
                          <button
                            onClick={() => handleVerify(win.id, "rejected")}
                            disabled={isLoading}
                            className="flex-1 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-semibold text-xs transition-all flex items-center justify-center gap-1"
                          >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><XCircle className="w-3.5 h-3.5" /> Reject Proof</>}
                          </button>
                        </div>
                      </div>
                    )}

                    {win.payment_status !== "paid" && (
                      <div>
                        <button
                          onClick={() => handlePayout(win.id)}
                          disabled={isLoading || win.verification_status !== "approved"}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                            win.verification_status === "approved"
                              ? "bg-gradient-to-r from-primary to-primary-glow text-white shadow-lg hover:from-primary-glow hover:to-primary"
                              : "bg-ink-elevated text-muted cursor-not-allowed border border-gray-700"
                          }`}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : win.verification_status === "approved" ? (
                            <><DollarSign className="w-4 h-4" /> Mark Payout Paid</>
                          ) : (
                            <><ShieldAlert className="w-4 h-4" /> Payout Blocked (Unapproved Proof)</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
