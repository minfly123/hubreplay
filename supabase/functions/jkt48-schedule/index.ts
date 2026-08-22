import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UPSTREAM_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
  Origin: "https://jkt48.crstlnz.my.id",
  Referer: "https://jkt48.crstlnz.my.id/",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const group = url.searchParams.get("group") || "jkt48";

  const candidates = [
    `https://api.crstlnz.my.id/api/theater?group=${encodeURIComponent(group)}`,
    `https://api.crstlnz.my.id/api/theater/${encodeURIComponent(group)}`,
  ];

  let lastStatus = 0;
  for (const apiUrl of candidates) {
    try {
      const res = await fetch(apiUrl, { headers: UPSTREAM_HEADERS });
      lastStatus = res.status;
      if (!res.ok) continue;
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=120",
        },
        status: 200,
      });
    } catch (e) {
      console.error("jkt48-schedule fetch failed:", apiUrl, e);
    }
  }

  // Never 500 the client: degrade gracefully so the UI stays usable.
  console.error("jkt48-schedule upstream unavailable, last status:", lastStatus);
  return new Response(
    JSON.stringify({ theater: [], error: `Upstream unavailable (${lastStatus || "network"})` }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
