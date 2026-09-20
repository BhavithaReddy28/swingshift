"use client";

import { useState } from "react";
import { Heart, X, Loader2 } from "lucide-react";

export function DirectDonationModal({
  charityId,
  charityName,
  fullWidth = false,
}: {
  charityId: string;
  charityName: string;
  fullWidth?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [amountPounds, setAmountPounds] = useState(25);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charityId,
          amountPence: amountPounds * 100,
          donorEmail: email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start donation checkout");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`${
          fullWidth ? "w-full" : ""
        } px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2`}
      >
        <Heart className="w-4 h-4 fill-white/30" />
        Donate Directly to {charityName}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-md w-full relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Heart className="w-5 h-5 fill-orange-400/30" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">Direct Donation</h3>
                <p className="text-xs text-gray-400">100% goes directly to {charityName}</p>
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleDonate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Select Donation Amount (£)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmountPounds(amt)}
                      className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                        amountPounds === amt
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      £{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={amountPounds}
                  onChange={(e) => setAmountPounds(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="Custom amount"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Your Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-sm hover:from-orange-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Complete £${amountPounds} Donation`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
