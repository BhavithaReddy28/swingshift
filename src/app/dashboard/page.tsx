import { redirect } from "next/navigation";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardClient } from "./DashboardClient";

export const revalidate = 0; // Dynamic server component

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const supabaseAdmin = createAdminClient();

  // Fetch user profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*, charities(*)")
    .eq("id", user.id)
    .single();

  // Fetch user subscription
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch rolling scores (newest first)
  const { data: scores } = await supabaseAdmin
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("played_on", { ascending: false });

  // Fetch user winnings
  const { data: winners } = await supabaseAdmin
    .from("winners")
    .select("*, draws(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch all active charities for charity picker dropdown
  const { data: charities } = await supabaseAdmin
    .from("charities")
    .select("*")
    .eq("is_active", true);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-white">
      <Header />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            Subscriber Portal
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Welcome, {profile?.full_name || "Hero Subscriber"}
          </h1>
        </div>

        <DashboardClient
          initialProfile={profile}
          initialSubscription={subscription}
          initialScores={scores || []}
          initialWinners={winners || []}
          charities={charities || []}
        />
      </main>

      <Footer />
    </div>
  );
}
