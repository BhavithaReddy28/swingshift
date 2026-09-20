import { createAdminClient } from "@/lib/supabase/admin";
import { AdminWinnersClient } from "./AdminWinnersClient";

export const revalidate = 0;

export default async function AdminWinnersPage() {
  const supabaseAdmin = createAdminClient();

  const { data: winners } = await supabaseAdmin
    .from("winners")
    .select("*, profiles(full_name), draws(period_month)")
    .order("created_at", { ascending: false });

  // Generate signed URLs for winner proofs
  const winnersWithSignedUrls = await Promise.all(
    (winners || []).map(async (w) => {
      let signedProofUrl = null;
      if (w.proof_url) {
        const { data } = await supabaseAdmin.storage
          .from("winner-proofs")
          .createSignedUrl(w.proof_url, 3600);
        signedProofUrl = data?.signedUrl || null;
      }
      return {
        ...w,
        signedProofUrl,
      };
    })
  );

  return <AdminWinnersClient initialWinners={winnersWithSignedUrls} />;
}
