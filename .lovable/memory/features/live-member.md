---
name: Live Member
description: Halaman /live — daftar member JKT48 live (IDN/Showroom) dari API now_live, player HLS.js
type: feature
---
- Route `/live` (list) dan `/live/:type/:urlKey` (player). Ada di hamburger menu, gratis untuk semua role.
- Data dari `https://api.crstlnz.my.id/api/now_live?group=jkt48`, polling 20s (list) / 30s (player). Helper di `src/lib/liveUtils.ts`.
- Judul diambil dari `slug`: strip = spasi, token angka dengan >= 6 digit dibuang.
- Thumbnail fallback: img → img_alt → weserv proxy → placeholder, `referrerPolicy="no-referrer"`.
- Card menampilkan timer durasi live berjalan (HH:MM:SS) sejak `started_at`.
- Player: hls.js + HTML5 video, pilihan kualitas dari `streaming_url_list`; Stream Info di bawah player (nama, kualitas, waktu mulai, tipe, durasi, room id).
