import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { CharityDirectoryClient } from "./CharityDirectoryClient";

import { DEFAULT_CHARITIES } from "@/lib/constants";

export const revalidate = 60;

async function getCharities() {
  const supabaseAdmin = createAdminClient();
  const { data: charities } = await supabaseAdmin
    .from("charities")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false });

  if (!charities || charities.length === 0) {
    return DEFAULT_CHARITIES;
  }
  return charities;
}

export default async function CharitiesPage() {
  const charities = await getCharities();

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-white">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-3.5 py-1.5 rounded-full border border-teal-500/20">
            Charity Directory
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mt-4">
            Grassroots Causes Funded by Your Golf Game
          </h1>
          <p className="mt-4 text-gray-400 text-lg">
            Choose your primary charity partner during signup or update it anytime from your dashboard. A minimum of 10% of your subscription goes directly to your selected cause.
          </p>
        </div>

        {/* Client Interactive Directory */}
        <CharityDirectoryClient initialCharities={charities} />
      </main>

      <Footer />
    </div>
  );
}
