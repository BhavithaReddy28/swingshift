"use client";

import { useState } from "react";
import Link from "next/link";
import { Charity } from "@/lib/supabase/types";
import { Search, Heart, ArrowRight, Tag } from "lucide-react";
import { HeartIllustration } from "@/components/illustrations/HeartIllustration";
import { TrophyIllustration } from "@/components/illustrations/TrophyIllustration";
import { MascotIllustration } from "@/components/illustrations/MascotIllustration";
import { GolfBallIllustration } from "@/components/illustrations/GolfBallIllustration";

export function CharityDirectoryClient({ initialCharities }: { initialCharities: Charity[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(initialCharities.map((c) => c.category)))];

  const filteredCharities = initialCharities.filter((charity) => {
    const matchesSearch =
      charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charity.short_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || charity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Search & Category Filter Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search charity name or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-input border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all capitalize ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-primary to-primary-glow text-white shadow-lg shadow-primary/20"
                  : "bg-ink-elevated text-muted hover:text-white hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Charities */}
      {filteredCharities.length === 0 ? (
        <div className="glass-panel p-12 flex flex-col items-center text-center rounded-2xl border border-border">
          <HeartIllustration size={80} className="mb-4 opacity-60" color="var(--text-muted)" />
          <h3 className="text-xl font-bold text-white">No charities found</h3>
          <p className="text-muted text-sm mt-1">Try adjusting your search terms or filter selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharities.map((charity) => (
            <div
              key={charity.id}
              className="glass-panel rounded-2xl border border-border overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-300 group"
            >
              {/* Hero Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={charity.hero_image_url}
                  alt={charity.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-70" />
                {charity.is_featured && (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                    Featured Partner
                  </span>
                )}
                <div className="absolute bottom-3 left-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                    <img src={charity.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-bold text-support tracking-wider">
                      {charity.category.toLowerCase().includes('health') ? (
                        <HeartIllustration size={16} color="var(--accent-support)" delay={Math.random()} />
                      ) : charity.category.toLowerCase().includes('youth') || charity.category.toLowerCase().includes('kids') ? (
                        <MascotIllustration size={16} color="var(--accent-support)" delay={Math.random()} />
                      ) : charity.category.toLowerCase().includes('sport') ? (
                        <TrophyIllustration size={16} color="var(--accent-support)" delay={Math.random()} />
                      ) : (
                        <GolfBallIllustration size={16} color="var(--accent-support)" delay={Math.random()} />
                      )}
                      <span>{charity.category}</span>
                    </div>
                    <h3 className="font-display font-bold text-white text-lg leading-tight line-clamp-1">
                      {charity.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                  {charity.short_description}
                </p>

                <Link
                  href={`/charities/${charity.slug}`}
                  className="w-full py-2.5 rounded-xl bg-ink-elevated hover:bg-primary/20 text-secondary font-semibold text-sm transition-all border border-primary/30 flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white"
                >
                  View Profile & Donate
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
