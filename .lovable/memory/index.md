# Project Memory

## Core
- "Hub Replay": JKT48 theater archive platform — INDEPENDEN & NON-OFFICIAL (tidak berafiliasi langsung dengan JKT48 Operation Team).
- Partner resmi: "This Is Ucil Streaming Live" (penyedia replay) — credit harus muncul di Home & About.
- Dark theme with red and pink accents (JKT48 visual identity).
- Backend: Supabase (realtime DB, email auto-confirm, Google Login).
- Display persistent watermark "Create by Dimzzvloper" bottom right on all pages.
- Halaman /about bisa diakses siapa saja (termasuk yang belum login) dari hamburger menu.
- Fitur Gift, undian, dan koin SUDAH DIHAPUS — jangan re-add.

## Memories
- [Access Control](mem://features/access-control) — Logic for granting access via Membership, Unlock URLs, Groups (Gift dihapus)
- [Video Player](mem://features/video-player) — Custom YouTube iframe player, auto-resume, screen persistence (PiP dihapus)
- [Role Management](mem://auth/roles) — Role hierarchy (Super Admin, Admin, User) and promotion system
- [Community & Profiles](mem://features/community) — User profiles, mandatory usernames, chat, and ratings
- [Core UI Components](mem://ui/core-components) — Splash screen, loading indicator, navigation, and welcome dialog
- [Replay Metadata & Tracking](mem://features/replay-metadata) — Date constraints, unique viewer tracking, and search
- [Security & Protection](mem://features/security-protection) — Anti-inspect mechanisms and player access validation
- [Marketing & AI Assistant](mem://features/marketing-ai) — Store, Reseller pricing, WA contact, and Hr-Ai assistant
