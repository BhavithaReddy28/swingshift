import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { luckyNumbersSchema } from "@/lib/zod-schemas";

import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const isDemo = cookieStore.get("dh_demo_user")?.value;

    if (isDemo) {
      const body = await req.json();
      const parsed = luckyNumbersSchema.parse(body);
      const sortedNumbers = [...parsed.numbers].sort((a, b) => a - b);
      return NextResponse.json({ luckyNumbers: sortedNumbers });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = luckyNumbersSchema.parse(body);

    const sortedNumbers = [...parsed.numbers].sort((a, b) => a - b);

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({ lucky_numbers: sortedNumbers })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ luckyNumbers: profile.lucky_numbers });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update lucky numbers" }, { status: 400 });
  }
}
