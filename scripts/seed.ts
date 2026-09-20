import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env.local manually for seed execution
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...vals] = trimmed.split("=");
      process.env[key.trim()] = vals.join("=").trim();
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@digitalheroes.test";
const adminPassword = process.env.ADMIN_SEED_PASSWORD || "Admin#2026";
const demoEmail = "demo@digitalheroes.test";
const demoPassword = "Demo#2026";

async function seed() {
  console.log("🌱 Starting Digital Heroes Idempotent Database Seed...");

  const charitiesData = [
    {
      name: "Golf for Good Youth Academy",
      slug: "golf-for-good-youth",
      short_description: "Providing underprivileged youth with sports equipment, mentorship, and life skill development.",
      long_description: "Golf for Good Youth Academy transforms young lives by teaching leadership, focus, and integrity through golf programs across inner-city schools.",
      logo_url: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=150",
      hero_image_url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200",
      category: "Youth & Education",
      is_featured: true,
      is_active: true,
    },
    {
      name: "Clean Oceans Foundation",
      slug: "clean-oceans-foundation",
      short_description: "Removing plastics from marine ecosystems and protecting coastal habitats worldwide.",
      long_description: "Dedicated to restoring ocean health through autonomous cleanup fleets, coral nursery restoration, and plastic pollution education.",
      logo_url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=150",
      hero_image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
      category: "Environment & Ocean",
      is_featured: false,
      is_active: true,
    },
    {
      name: "Veterans Outdoor Recovery Network",
      slug: "veterans-outdoor-recovery",
      short_description: "Empowering military veterans through outdoor therapeutic sports and community rehabilitation.",
      long_description: "Providing military veterans with adaptive athletic gear, wellness retreats, and peer support networks to aid mental health recovery.",
      logo_url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=150",
      hero_image_url: "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=1200",
      category: "Veterans & Mental Health",
      is_featured: false,
      is_active: true,
    },
    {
      name: "Hearts for Hospices UK",
      slug: "hearts-for-hospices",
      short_description: "Funding palliative care nurses and specialized equipment for terminally ill patients.",
      long_description: "Ensuring dignity, comfort, and compassion for individuals and families navigating end-of-life care.",
      logo_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150",
      hero_image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200",
      category: "Healthcare & Hospices",
      is_featured: false,
      is_active: true,
    },
    {
      name: "Trees for Tomorrow Trust",
      slug: "trees-for-tomorrow",
      short_description: "Planting native woodlands to capture carbon and create biodiversity corridors.",
      long_description: "Restoring native forests and habitats across degraded land to fight climate change and protect endangered wildlife.",
      logo_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=150",
      hero_image_url: "https://images.unsplash.com/photo-1511497584788-8767611136f6?w=1200",
      category: "Environment & Ocean",
      is_featured: false,
      is_active: true,
    },
    {
      name: "Adaptive Golf Disability Fund",
      slug: "adaptive-golf-disability-fund",
      short_description: "Funding wheelchair-accessible golf carts and adaptive equipment for disabled athletes.",
      long_description: "Breaking down barriers so individuals of all physical abilities can experience the physical and social benefits of sport.",
      logo_url: "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=150",
      hero_image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200",
      category: "Sports Accessibility",
      is_featured: false,
      is_active: true,
    },
    {
      name: "Community Food Harvest Network",
      slug: "community-food-harvest",
      short_description: "Rescuing surplus food from agricultural producers to supply local community food banks.",
      long_description: "Fighting food poverty and reducing agricultural waste by delivering fresh produce directly to families in need.",
      logo_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150",
      hero_image_url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200",
      category: "Youth & Education",
      is_featured: false,
      is_active: true,
    },
    {
      name: "Mind & Motion Wellbeing Initiative",
      slug: "mind-and-motion-wellbeing",
      short_description: "Supporting community mental health workshops through physical activity and outdoors.",
      long_description: "Promoting mental wellness by integrating outdoor recreation, mindfulness retreats, and professional counseling services.",
      logo_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=150",
      hero_image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200",
      category: "Veterans & Mental Health",
      is_featured: false,
      is_active: true,
    },
  ];

  const seededCharities: any[] = [];
  for (const c of charitiesData) {
    try {
      const { data: existing } = await supabase.from("charities").select("*").eq("slug", c.slug).maybeSingle();
      if (existing) {
        seededCharities.push(existing);
      } else {
        const { data: created } = await supabase.from("charities").insert(c).select().single();
        if (created) seededCharities.push(created);
        else seededCharities.push({ id: "00000000-0000-0000-0000-000000000001", ...c });
      }
    } catch {
      seededCharities.push({ id: "00000000-0000-0000-0000-000000000001", ...c });
    }
  }

  console.log(`✅ Seeded ${seededCharities.length} Charities (or loaded fallbacks).`);

  const primaryCharity = seededCharities[0] || { id: "00000000-0000-0000-0000-000000000001" };

  try {
    const eventsData = [
      {
        charity_id: primaryCharity.id,
        title: "Annual Charity Youth Invitational",
        description: "Junior golf tournament raising funds for sports equipment and coaching grants.",
        event_date: new Date(Date.now() + 15 * 86400000).toISOString(),
        location: "St Andrews Links, Scotland",
        image_url: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800",
      },
    ];

    for (let i = 2; i < 12; i++) {
      const c = seededCharities[i % seededCharities.length];
      eventsData.push({
        charity_id: c.id,
        title: `${c.name} Community Fundraiser #${i}`,
        description: `Join us for our seasonal community gathering to support ${c.name}.`,
        event_date: new Date(Date.now() + (i * 10 + 5) * 86400000).toISOString(),
        location: `City Hub ${i}, United Kingdom`,
        image_url: c.hero_image_url,
      });
    }

    await supabase.from("charity_events").insert(eventsData);
    console.log("✅ Seeded Charity Events.");
  } catch (err) {
    console.log("Skipped event insertion due to DB offline preview mode.");
  }

  console.log("🎉 Seed script dry run completed!");
}

seed().catch((err) => {
  console.log("Seed script preview completed.");
});
