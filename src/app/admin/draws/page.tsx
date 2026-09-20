import { createAdminClient } from "@/lib/supabase/admin";
import { AdminDrawsClient } from "./AdminDrawsClient";

export const revalidate = 0;

export default async function AdminDrawsPage() {
  const supabaseAdmin = createAdminClient();

  const { data: draws } = await supabaseAdmin
    .from("draws")
    .select("*")
    .order("period_month", { ascending: false });

  return <AdminDrawsClient initialDraws={draws || []} />;
}
