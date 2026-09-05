# Project Memory

## Core
- "Arcanove48" (dulu Hub Replay): komunitas JKT48 + arsip replay theater, AI bernama Arva AI — INDEPENDEN & NON-OFFICIAL (tidak berafiliasi langsung dengan JKT48 Operation Team).
- Partner resmi: "This Is Ucil Streaming Live" (penyedia replay) — credit harus muncul di Home & About.
- Dark theme with red and pink accents (JKT48 visual identity).
- Backend: Supabase (realtime DB, email auto-confirm). Login hanya email & password — Google login dihapus.
- Home = Live Member (`/`), replay show di `/replay`. Login hanya email & password.
- Display persistent watermark "Create by Dimzzvloper" bottom right on all pages.
- Halaman /about bisa diakses siapa saja (termasuk yang belum login) dari hamburger menu.
- Fitur Gift, undian, dan koin SUDAH DIHAPUS — jangan re-add.

## Memories
- [Access Control](mem://features/access-control) — Logic for granting access via Membership, Unlock URLs, Groups (Gift dihapus)
- [Video Player](mem://features/video-player) — Custom YouTube iframe player, auto-resume, screen persistence (PiP dihapus)
- [Role Management](mem://auth/roles) — Role hierarchy (Super Admin, Admin, User) and promotion system
- [Community & Profiles](mem://features/community) — Identitas Arcanove48 + /community & Instagram, profil, username wajib, komentar, rating
- [Core UI Components](mem://ui/core-components) — Splash screen, loading indicator, navigation, and welcome dialog
- [Replay Metadata & Tracking](mem://features/replay-metadata) — Date constraints, unique viewer tracking, and search
- [Live Member](mem://features/live-member) — Home `/` (dan /live): member JKT48 live IDN/Showroom, API now_live, player HLS.js
- [Radio & Next Birthday](mem://features/radio-birthday) — /radio, /birthday, tombol CC subtitle, konteks realtime Arva AI (Phase 5 v1.1)
- [Security & Protection](mem://features/security-protection) — Anti-inspect mechanisms and player access validation
- [Marketing & AI Assistant](mem://features/marketing-ai) — Store, Reseller pricing, WA contact, and Arva AI assistant
