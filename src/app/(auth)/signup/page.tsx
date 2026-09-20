"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { createClient } from "@/lib/supabase/client";
import { Charity } from "@/lib/supabase/types";
import { Heart, Loader2, Award, CheckCircle2, ShieldCheck } from "lucide-react";
import { signupSchema } from "@/lib/zod-schemas";
import { DEFAULT_CHARITIES } from "@/lib/constants";

export default function SignupPage() {
  const [charities, setCharities] = useState<Charity[]>(DEFAULT_CHARITIES);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCharityId, setSelectedCharityId] = useState(DEFAULT_CHARITIES[0]?.id || "");
  const [charityPercentage, setCharityPercentage] = useState(15); // min 10%
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function loadCharities() {
      try {
        const { data } = await supabase.from("charities").select("*").eq("is_active", true);
        if (data && data.length > 0) {
          setCharities(data);
          setSelectedCharityId(data[0].id);
        }
      } catch (_err) {
        // Keep default charities fallback
      }
    }
    loadCharities();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Zod validation
      const parsed = signupSchema.parse({
        fullName,
        email,
        password,
        charityId: selectedCharityId,
        charityPercentage: Number(charityPercentage),
        plan,
      });

      // 2. Supabase Auth signup
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: parsed.email,
        password: parsed.password,
        options: {
          data: {
            full_name: parsed.fullName,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Failed to create account profile.");
      }

      // 3. Create initial profile row if not auto-created by trigger
      await supabase.from("profiles").upsert({
        id: authData.user.id,
        full_name: parsed.fullName,
        role: "subscriber",
        charity_id: parsed.charityId,
        charity_percentage: parsed.charityPercentage,
      });

      // 4. Trigger Stripe Checkout API
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: parsed.plan,
          charityId: parsed.charityId,
          charityPercentage: parsed.charityPercentage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      if (err.errors) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-white">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 space-y-8 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white">Join Digital Heroes</h1>
            <p className="text-xs text-gray-400">
              Track scores, enter monthly jackpot draws, and support your designated charity.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Account Info */}
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-teal-400 uppercase tracking-wider">
                1. Account Credentials
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Charity Selection & Percentage Slider */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="font-display text-sm font-bold text-teal-400 uppercase tracking-wider">
                2. Charity Designation & Contribution
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Select Your Primary Partner Charity
                </label>
                <select
                  value={selectedCharityId}
                  onChange={(e) => setSelectedCharityId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                  required
                >
                  {charities.map((c) => (
                    <option key={c.id} value={c.id} className="bg-gray-900 text-white">
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Charity Share Percentage (Min 10%)
                  </label>
                  <span className="font-display font-bold text-orange-400 text-base">
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
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>10% (Minimum)</span>
                  <span>50%</span>
                  <span>100% (Full Philanthropy)</span>
                </div>
              </div>
            </div>

            {/* Subscription Plan Toggle */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="font-display text-sm font-bold text-teal-400 uppercase tracking-wider">
                3. Choose Subscription Plan
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPlan("monthly")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    plan === "monthly"
                      ? "border-orange-500 bg-orange-500/10 text-white shadow-lg"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <div className="font-display font-bold text-lg text-white">Monthly</div>
                  <div className="text-2xl font-extrabold text-orange-400 mt-1">£20<span className="text-xs text-gray-400">/mo</span></div>
                  <div className="text-[11px] text-gray-400 mt-2">Billed monthly • Cancel anytime</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlan("yearly")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    plan === "yearly"
                      ? "border-amber-500 bg-amber-500/10 text-white shadow-lg"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-lg text-white">Yearly</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">Save 17%</span>
                  </div>
                  <div className="text-2xl font-extrabold text-amber-300 mt-1">£200<span className="text-xs text-gray-400">/yr</span></div>
                  <div className="text-[11px] text-gray-400 mt-2">Billed annually • £5/mo prize pool</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-display font-bold text-base hover:from-orange-600 hover:to-amber-700 transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Proceed to Secure Stripe Checkout
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/5">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-400 font-semibold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
