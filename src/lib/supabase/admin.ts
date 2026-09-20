import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  return createSupabaseClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: customFetch
    }
  });
}
