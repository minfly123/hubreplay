import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SOURCE_PROXY_HOST = "api.crstlnz.my.id";

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const rawUrl = new URL(req.url).searchParams.get("url");
  if (!rawUrl || rawUrl.length > 2048) {
    return jsonResponse({ error: "Invalid stream URL" }, 400);
  }

  let streamUrl: URL;
  try {
    streamUrl = new URL(rawUrl);
  } catch {
    return jsonResponse({ error: "Invalid stream URL" }, 400);
  }

  const isAllowedHost =
    streamUrl.protocol === "https:" &&
    streamUrl.hostname.endsWith(".playback.live-video.net") &&
    streamUrl.pathname.endsWith(".m3u8");

  if (!isAllowedHost) {
    return jsonResponse({ error: "Stream source is not allowed" }, 403);
  }

  try {
    const upstreamUrl = new URL(`https://${SOURCE_PROXY_HOST}/api/stream`);
    upstreamUrl.searchParams.set("url", streamUrl.toString());
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/vnd.apple.mpegurl, application/x-mpegURL, */*",
      },
    });

    if (!upstream.ok) {
      return jsonResponse({ error: "Stream is temporarily unavailable" }, upstream.status);
    }

    const manifest = await upstream.text();
    if (!manifest.trimStart().startsWith("#EXTM3U")) {
      return jsonResponse({ error: "Invalid stream manifest" }, 502);
    }

    return new Response(manifest, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return jsonResponse({ error: "Unable to reach stream source" }, 502);
  }
});