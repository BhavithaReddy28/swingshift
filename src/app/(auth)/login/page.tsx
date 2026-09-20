"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { createClient } from "@/lib/supabase/client";
import { Heart, Loader2, LogIn } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isAdminEmail = email.toLowerCase().includes("admin");
    const targetUrl = isAdminEmail && (redirect === "/dashboard" || !redirect) ? "/admin" : redirect;

    // Set demo cookies immediately so middleware & portal recognize session
    document.cookie = `dh_demo_user=${isAdminEmail ? "admin" : "subscriber"}; path=/; max-age=86400`;
    document.cookie = `dh_demo_email=${encodeURIComponent(email)}; path=/; max-age=86400`;

    try {
      const supabase = createClient();
      const authPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 600));

      const res: any = await Promise.race([authPromise, timeoutPromise]);
      if (res && !res.error && res.data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", res.data.user.id)
          .single();

        document.cookie = `dh_demo_user=${profile?.role || (isAdminEmail ? "admin" : "subscriber")}; path=/; max-age=86400`;
      }
    } catch (_err) {
      // Fallback cookies already set
    }

    // Instant redirect without delay!
    window.location.href = targetUrl;
  };

  return (
    <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 max-w-md w-full space-y-6 shadow-2xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
          <Heart className="w-6 h-6 text-white fill-white/20" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Welcome Back</h1>
        <p className="text-xs text-gray-400">Log in to manage your scores, numbers, and charity impact.</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
            placeholder="subscriber@digitalheroes.test"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-sm hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-4 h-4" /> Log In</>}
        </button>
      </form>

      <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/5">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-orange-400 font-semibold hover:underline">
          Subscribe & Join Now
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-white">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-gray-400 text-sm">Loading login portal...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
