import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LIVE_API = "https://api.crstlnz.my.id/api/now_live?group=jkt48";
const STREAM_API = "https://api.crstlnz.my.id/api/stream?url=";
const ALLOWED_STREAM_HOST = ".playback.live-video.net";
const responseHeaders = {
  ...corsHeaders,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
};
const upstreamHeaders = {
  Accept: "application/json, text/plain, */*",
  Origin: "https://dc.crstlnz.my.id",
  Referer: "https://dc.crstlnz.my.id/",
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...responseHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const isAllowedStreamUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(ALLOWED_STREAM_HOST);
  } catch {
    return false;
  }
};

const proxyUrl = (requestUrl: string, target: string) => {
  const url = new URL(requestUrl);
  url.search = "";
  url.searchParams.set("url", target);
  return url.toString();
};

const rewriteManifest = (manifest: string, sourceUrl: string, requestUrl: string) =>
  manifest
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const target = new URL(trimmed, sourceUrl).toString();
        return isAllowedStreamUrl(target) ? proxyUrl(requestUrl, target) : line;
      }
      return line.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
        const target = new URL(uri, sourceUrl).toString();
        return isAllowedStreamUrl(target) ? `URI="${proxyUrl(requestUrl, target)}"` : `URI="${uri}"`;
      });
    })
    .join("\n");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: responseHeaders });
  if (req.method !== "GET") return jsonResponse({ error: "Method not allowed" }, 405);

  const requestUrl = new URL(req.url);
  if (requestUrl.searchParams.get("action") === "lives") {
    try {
      const upstream = await fetch(LIVE_API, { headers: upstreamHeaders });
      if (!upstream.ok) throw new Error("Live API unavailable");
      return jsonResponse(await upstream.json());
    } catch {
      return jsonResponse({ error: "Gagal memuat data live" }, 502);
    }
  }

  const rawUrl = requestUrl.searchParams.get("url");
  if (!rawUrl || rawUrl.length > 8192 || !isAllowedStreamUrl(rawUrl)) {
    return jsonResponse({ error: "Stream source is not allowed" }, 403);
  }

  try {
    const sourceUrl = new URL(rawUrl).toString();
    const isManifest = new URL(sourceUrl).pathname.endsWith(".m3u8");
    const headers = new Headers({ Accept: isManifest ? "application/vnd.apple.mpegurl, */*" : "*/*" });
    const range = req.headers.get("range");
    if (range) headers.set("Range", range);

    let upstream = await fetch(sourceUrl, { headers });
    if (!upstream.ok && isManifest) {
      upstream = await fetch(`${STREAM_API}${encodeURIComponent(sourceUrl)}`, {
        headers: { ...upstreamHeaders, Accept: "application/vnd.apple.mpegurl, */*" },
      });
    }
    if (!upstream.ok) return jsonResponse({ error: "Stream is temporarily unavailable" }, upstream.status);

    if (isManifest) {
      const manifest = await upstream.text();
      if (!manifest.trimStart().startsWith("#EXTM3U")) return jsonResponse({ error: "Invalid stream manifest" }, 502);
      return new Response(rewriteManifest(manifest, sourceUrl, req.url), {
        headers: { ...responseHeaders, "Content-Type": "application/vnd.apple.mpegurl", "Cache-Control": "no-store" },
      });
    }

    const passthroughHeaders: Record<string, string> = {
      ...responseHeaders,
      "Content-Type": upstream.headers.get("content-type") || "video/mp2t",
      "Cache-Control": "public, max-age=5",
    };
    for (const name of ["content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers.get(name);
      if (value) passthroughHeaders[name] = value;
    }
    return new Response(upstream.body, { status: upstream.status, headers: passthroughHeaders });
  } catch {
    return jsonResponse({ error: "Unable to reach stream source" }, 502);
  }
});