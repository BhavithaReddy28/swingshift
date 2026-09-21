import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardClient } from "./DashboardClient";
import { DEFAULT_CHARITIES } from "@/lib/constants";

export const revalidate = 0; // Dynamic server component

export default async function DashboardPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const isDemo = Boolean(cookieStore.get("dh_demo_user")?.value);

  let { data: { user } } = await supabase.auth.getUser();

  if (!user && isDemo) {
    user = { id: "demo-user-1", email: "demo@digitalheroes.test" } as any;
  }

  if (!user) {
    redirect("/login");
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

  const finalProfile = profile || { full_name: "Demo Hero", charities: DEFAULT_CHARITIES[0] };
  const finalSubscription = subscription || { 
    status: "active", 
    lucky_numbers: [7, 14, 21, 28, 35], 
    charity_split_percentage: 50,
    charity_id: DEFAULT_CHARITIES[0].id
  };
  const finalScores = scores && scores.length > 0 ? scores : [
    { id: "1", played_on: "2026-09-01", score: 42, points: 5 },
    { id: "2", played_on: "2026-08-15", score: 38, points: 4 },
  ];
  const finalWinners = winners || [];
  const finalCharities = charities && charities.length > 0 ? charities : DEFAULT_CHARITIES;


  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white">
      <Header />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Subscriber Portal
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Welcome, {profile?.full_name || "Hero Subscriber"}
          </h1>
        </div>

        <DashboardClient
          initialProfile={finalProfile}
          initialSubscription={finalSubscription}
          initialScores={finalScores}
          initialWinners={finalWinners}
          charities={finalCharities}
        />
      </main>

      <Footer />
    </div>
  );
}
