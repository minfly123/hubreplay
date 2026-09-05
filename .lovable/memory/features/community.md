---
name: Community, Profiles & Arcanove48 Identity
description: Identitas komunitas Arcanove48, halaman /community & sosmed, plus profil pengguna, username wajib, komentar, rating
type: feature
---
## Identitas Arcanove48
- Branding resmi: **Arcanove48** (dulu "Hub Replay"). Asisten AI bernama **Arva AI** (dulu Hr-Ai).
- Arcanove48 = komunitas/wadah interaktif fans JKT48 untuk cari concert buddy (Theater JKT48, off-air, festival musik, Meet & Greet) + pusat informasi digital: info ulang tahun member/seitansai, jadwal theater, news terkini, trivia & konten menarik. Bukan sekadar dokumentasi visual, tapi community hub.
- Halaman `/community` (About Community) ada di hamburger menu, memuat profil komunitas + tombol Instagram `https://www.instagram.com/arcanove48_ofc?igsi=MTVpc2N1NGEzbTdicA==`.
- Route: `/` = Live Member (home), `/replay` = halaman replay show. Menu "Live Member" lama dihapus dari hamburger karena sudah jadi Home.
- Login hanya email & kata sandi — opsi Google OAuth dihapus.
- `live-stream-proxy` mengizinkan host IDN/IVS dan Showroom (showroom-live.com, showroom-cdn.com, akamaized, cloudfront, idn.media, dll).

## Profil & interaksi pengguna
- Halaman `/profile`: lihat/atur username, email terdaftar, ganti password.
- Username WAJIB sebelum menonton replay & berkomentar (pop-up pengingat username).
- Komentar per replay terpisah, realtime, dengan timestamp yang diperbarui otomatis.
- Rating bintang 1–5 per replay, realtime.
- Badge di komentar: Owner (👑) untuk super admin, Reseller (🛡️) untuk admin.
- Filter kata kasar/18+/tidak pantas otomatis.
- Admin/super admin bisa melihat username tiap akun di halaman People.
