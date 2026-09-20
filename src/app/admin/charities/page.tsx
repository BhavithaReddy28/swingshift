import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCharitiesClient } from "./AdminCharitiesClient";

export const revalidate = 0;

export default async function AdminCharitiesPage() {
  const supabaseAdmin = createAdminClient();

  const { data: charities } = await supabaseAdmin
    .from("charities")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminCharitiesClient initialCharities={charities || []} />;
}
