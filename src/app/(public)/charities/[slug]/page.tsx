import { notFound } from "next/navigation";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { Calendar, MapPin, ShieldCheck } from "lucide-react";
import { DirectDonationModal } from "@/components/shared/DirectDonationModal";
import { formatDate } from "@/lib/utils";

import { DEFAULT_CHARITIES } from "@/lib/constants";

export const revalidate = 60;

async function getCharityData(slug: string) {
  const supabaseAdmin = createAdminClient();

  let { data: charity } = await supabaseAdmin
    .from("charities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!charity) {
    charity = DEFAULT_CHARITIES.find((c) => c.slug === slug) || null;
  }

  if (!charity) return null;

  const { data: events } = await supabaseAdmin
    .from("charity_events")
    .select("*")
    .eq("charity_id", charity.id)
    .order("event_date", { ascending: true });

  return { charity, events: events || [] };
}

export default async function CharitySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCharityData(slug);

  if (!data) {
    notFound();
  }

  const { charity, events } = data;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-white">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Banner Hero */}
        <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 border border-white/10 shadow-2xl">
          <img
            src={charity.hero_image_url}
            alt={charity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/60 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-3 shadow-xl flex items-center justify-center shrink-0">
                <img src={charity.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                  {charity.category}
                </span>
                <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white mt-2">
                  {charity.name}
                </h1>
              </div>
            </div>

            <DirectDonationModal charityId={charity.id} charityName={charity.name} />
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-4">
              <h2 className="font-display text-2xl font-bold text-white">About {charity.name}</h2>
              <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                {charity.long_description}
              </p>
            </div>

            {/* Upcoming Events */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-orange-400" />
                Upcoming Charity Events
              </h3>

              {events.length === 0 ? (
                <div className="glass-panel p-6 rounded-2xl text-center text-gray-400">
                  No upcoming events scheduled right now. Check back soon!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 hover:border-teal-500/40 transition-all"
                    >
                      <div className="relative h-36 rounded-xl overflow-hidden">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-teal-300 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.event_date)}
                        </div>
                      </div>

                      <h4 className="font-display font-bold text-white text-lg">{event.title}</h4>
                      <p className="text-gray-400 text-xs line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        {event.location}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Box */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                Direct Impact Guarantee
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                When you subscribe to Digital Heroes, you can choose {charity.name} as your designated charity. Between 10% and 100% of your monthly subscription fee goes directly to their mission.
              </p>
              <div className="pt-2">
                <DirectDonationModal charityId={charity.id} charityName={charity.name} fullWidth />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
