import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const customFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const urlString = typeof input === "string" ? input : input.toString();
  if (urlString.includes("placeholder")) {
    return Promise.resolve(new Response(JSON.stringify({ data: null, error: { message: "Mock project" } }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    }));
  }
  return fetch(input, init);
};

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server component setAll ignore
        }
      },
    },
    global: {
      fetch: customFetch
    }
  });
}
