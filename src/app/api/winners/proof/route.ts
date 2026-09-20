import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const winnerId = formData.get("winnerId") as string;
    const file = formData.get("file") as File;

    if (!winnerId || !file) {
      return NextResponse.json({ error: "Winner ID and proof image file are required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Verify winner row ownership
    const { data: winner } = await supabaseAdmin
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .eq("user_id", user.id)
      .single();

    if (!winner) {
      return NextResponse.json({ error: "Winner record not found" }, { status: 404 });
    }

    // Upload file to Supabase storage bucket 'winner-proofs'
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${user.id}/${winnerId}_${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create bucket if it doesn't exist
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.some((b) => b.name === "winner-proofs")) {
      await supabaseAdmin.storage.createBucket("winner-proofs", { public: false });
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from("winner-proofs")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    // Update winner record: proof_url, verification_status = 'pending', clear rejection_reason
    const { data: updatedWinner, error: updateError } = await supabaseAdmin
      .from("winners")
      .update({
        proof_url: fileName,
        verification_status: "pending",
        rejection_reason: null,
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ winner: updatedWinner });
  } catch (error: any) {
    console.error("Proof upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload proof" }, { status: 500 });
  }
}
