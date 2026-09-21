"use client";

import { useState } from "react";
import { Profile, Subscription } from "@/lib/supabase/types";
import { Search, UserCheck, ShieldAlert, Edit2, Loader2 } from "lucide-react";

export function AdminUsersClient({ initialProfiles }: { initialProfiles: any[] }) {
  const [profiles, setProfiles] = useState<any[]>(initialProfiles);
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("active");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleOverrideStatus = async (userId: string) => {
    setLoadingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscriptionStatus: editStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update subscription status");

      setProfiles(
        profiles.map((p) =>
          p.id === userId
            ? { ...p, subscriptions: { ...p.subscriptions, status: editStatus } }
            : p
        )
      );
      setEditingUserId(null);
      alert("Subscription status overridden successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">User Accounts</h1>
          <p className="text-muted text-sm mt-1">
            Search subscriber database, view profile details, and override subscription statuses.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-input border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-muted bg-ink-elevated">
                <th className="py-4 px-6">User Name & Role</th>
                <th className="py-4 px-6">Charity Designation</th>
                <th className="py-4 px-6">Subscription Status</th>
                <th className="py-4 px-6">Lucky Numbers</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filtered.map((user) => {
                const sub = user.subscriptions;
                const charity = user.charities;
                const isEditing = editingUserId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-ink-elevated transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{user.full_name}</div>
                      <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">
                        {user.role}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-gray-200">{charity?.name || "None"}</div>
                      <span className="text-xs text-support">{user.charity_percentage}% Share</span>
                    </td>

                    <td className="py-4 px-6">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="bg-black border border-white/20 text-xs text-white rounded px-2 py-1"
                          >
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="lapsed">Lapsed</option>
                            <option value="past_due">Past Due</option>
                          </select>
                          <button
                            onClick={() => handleOverrideStatus(user.id)}
                            disabled={loadingId === user.id}
                            className="px-2.5 py-1 bg-amber-500 text-white rounded text-xs font-bold"
                          >
                            {loadingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            sub?.status === "active"
                              ? "bg-teal-500/20 text-support border border-teal-500/40"
                              : "bg-red-500/20 text-red-300 border border-red-500/40"
                          }`}
                        >
                          {sub?.status || "Lapsed"}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex gap-1">
                        {user.lucky_numbers && user.lucky_numbers.length === 5 ? (
                          user.lucky_numbers.map((n: number, idx: number) => (
                            <span key={idx} className="w-6 h-6 rounded bg-white/10 text-white text-[10px] font-bold flex items-center justify-center">
                              {n}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted italic">Auto-Assigned on Draw</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setEditingUserId(user.id);
                          setEditStatus(sub?.status || "active");
                        }}
                        className="p-2 text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Override Subscription Status"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
