"use client";

import { useState } from "react";
import { Charity } from "@/lib/supabase/types";
import { Heart, Plus, Star, Edit2, Loader2, CheckCircle2 } from "lucide-react";

export function AdminCharitiesClient({ initialCharities }: { initialCharities: Charity[] }) {
  const [charities, setCharities] = useState<Charity[]>(initialCharities);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Healthcare");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=200");
  const [heroImageUrl, setHeroImageUrl] = useState("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200");
  const [isFeatured, setIsFeatured] = useState(false);

  const handleCreateCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/charities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          category,
          shortDescription,
          longDescription,
          logoUrl,
          heroImageUrl,
          isFeatured,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create charity");

      setCharities([data.charity, ...charities]);
      setShowAddModal(false);
      alert("Charity created successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Charity Partner Management</h1>
          <p className="text-muted text-sm mt-1">Create and update partner charities and set featured spotlight causes.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-white font-semibold text-sm shadow-lg hover:from-primary-glow hover:to-primary transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Partner Charity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities.map((charity) => (
          <div
            key={charity.id}
            className="glass-panel rounded-3xl border border-border overflow-hidden space-y-4 hover:border-amber-500/40 transition-all"
          >
            <div className="relative h-40 overflow-hidden">
              <img src={charity.hero_image_url} alt={charity.name} className="w-full h-full object-cover" />
              {charity.is_featured && (
                <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" /> Featured
                </span>
              )}
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <img src={charity.logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white p-1" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-support">{charity.category}</span>
                  <h3 className="font-display font-bold text-white text-lg leading-tight">{charity.name}</h3>
                </div>
              </div>

              <p className="text-gray-300 text-xs line-clamp-2">{charity.short_description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Charity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border max-w-xl w-full my-8 space-y-4">
            <h3 className="font-display font-bold text-2xl text-white">Create New Charity Partner</h3>

            <form onSubmit={handleCreateCharity} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }}
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded accent-orange-500"
                    />
                    Set as Featured Spotlight
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Short Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Long Description</label>
                <textarea
                  rows={3}
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Logo Image URL</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Hero Image URL</label>
                  <input
                    type="text"
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-ink-elevated text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Charity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
