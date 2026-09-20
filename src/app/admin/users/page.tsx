import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUsersClient } from "./AdminUsersClient";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabaseAdmin = createAdminClient();

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("*, subscriptions(*), charities(*)")
    .order("created_at", { ascending: false });

  return <AdminUsersClient initialProfiles={profiles || []} />;
}
