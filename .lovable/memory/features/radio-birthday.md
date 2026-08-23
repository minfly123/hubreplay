---
name: Radio & Next Birthday
description: Halaman /radio (JKT48 Radio Cilacap 24 jam + share) dan /birthday (countdown ulang tahun member), plus tombol CC di player replay
type: feature
---
- **/radio** — JKT48 Radio dari Cilacap, stream `s2.kroyamedia.zone.id:8022/stream`, on air 24 jam nonstop. Pemutar HTML5 modern: play/pause, volume, mute, timer durasi mendengarkan, visualizer dekoratif, tombol share (WhatsApp, native share, copy teks+link) dengan teks promosi bawaan web.
- **/birthday** — Next Birthday: data dari `https://api.crstlnz.my.id/api/next_birthday?group=jkt48`, diurutkan dari yang paling dekat, countdown realtime (hari/jam/menit/detik), umur yang akan dicapai, foto member dengan fallback proxy weserv anti-blokir.
- **Subtitle [CC]** di YouTubePlayer replay: default OFF, toggle subtitle bawaan YouTube, tombol disabled bila video tidak punya track subtitle.
- **Hr-Ai realtime context**: `src/lib/aiContext.ts` mengumpulkan data live member, jadwal show + line-up, dan next birthday DARI SISI BROWSER (upstream memblokir IP server) lalu dikirim ke edge function `hr-ai-chat` sebagai `realtimeContext`.
- Versi saat ini: **Phase 5 v1.1 — rilis 22 Agustus 2026**. Log update lengkap ada di halaman /about.
