import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { charityCrudSchema } from "@/lib/zod-schemas";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = charityCrudSchema.parse(body);

    const supabaseAdmin = createAdminClient();

    // If setting as featured, unset other featured charities first
    if (parsed.isFeatured) {
      await supabaseAdmin.from("charities").update({ is_featured: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    }

    const { data: charity, error } = await supabaseAdmin
      .from("charities")
      .insert({
        name: parsed.name,
        slug: parsed.slug,
        short_description: parsed.shortDescription,
        long_description: parsed.longDescription,
        logo_url: parsed.logoUrl,
        hero_image_url: parsed.heroImageUrl,
        category: parsed.category,
        is_featured: parsed.isFeatured,
        is_active: parsed.isActive,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ charity });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create charity" }, { status: 400 });
  }
}
