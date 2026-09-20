import { createBrowserClient } from "@supabase/ssr";

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

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
  return createBrowserClient(url, anonKey, {
    global: {
      fetch: customFetch
    }
  });
}
