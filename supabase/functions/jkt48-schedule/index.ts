import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const group = url.searchParams.get("group") || "jkt48";
    const apiUrl = `https://api.crstlnz.my.id/api/theater?group=${encodeURIComponent(group)}`;

    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "HubReplay/1.9" },
    });

    if (!res.ok) {
      throw new Error(`Upstream API error: ${res.status}`);
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
      status: 200,
    });
  } catch (e) {
    console.error("jkt48-schedule error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
