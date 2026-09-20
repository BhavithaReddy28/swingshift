import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Trophy, Heart, Award, BarChart3, ShieldAlert } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("dh_demo_user")?.value === "admin";
  let { data: { user } } = await supabase.auth.getUser();

  if (!user && isDemo) {
    user = { id: "demo-admin-1", email: "admin@digitalheroes.test" } as any;
  }

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const supabaseAdmin = createAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const finalRole = profile?.role || (isDemo ? "admin" : "subscriber");

  if (finalRole !== "admin") {
    redirect("/dashboard");
  }

  const navItems = [
    { href: "/admin", label: "Overview", icon: ShieldAlert },
    { href: "/admin/draws", label: "Draw Engine", icon: Trophy },
    { href: "/admin/winners", label: "Winners & Proofs", icon: Award },
    { href: "/admin/users", label: "User Accounts", icon: Users },
    { href: "/admin/charities", label: "Charity CRUD", icon: Heart },
    { href: "/admin/reports", label: "Financial Reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-white">
      <Header />

      <div className="border-b border-white/10 bg-[#070A10] px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Admin Management Suite</span>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Icon className="w-3.5 h-3.5 text-amber-400" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <Footer />
    </div>
  );
}
