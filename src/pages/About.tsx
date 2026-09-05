import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Heart, Target, Sparkles, Users, Shield, Clock, KeyRound, CreditCard, MessageCircle, Star, Calendar, Handshake, AlertTriangle, Radio, Music, Cake, Captions, History } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-sm">
              Tentang <span className="text-gradient">Arcanove48</span>
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Hero */}
        <section className="glass-card p-6 sm:p-8 text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center glow-primary">
            <Play className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            Arca<span className="text-gradient">nove48</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Versi Phase 5 v1.1 — Rilis 22 Agustus 2026
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Arcanove48 adalah platform arsip independen untuk menonton ulang (replay) 
            theater online JKT48 dengan kualitas tinggi, akses fleksibel, dan harga ramah kantong.
          </p>
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs text-yellow-500 font-medium">Non-Official — Tidak bekerja sama langsung dengan JKT48 Operation Team</span>
          </div>
        </section>

        {/* Partner */}
        <section className="glass-card p-6 sm:p-8 space-y-4 border-2 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Handshake className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">Partner Resmi</h2>
              <p className="text-xs text-muted-foreground">Kerjasama media penyedia replay</p>
            </div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">This Is Ucil Streaming Live</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Arcanove48 dengan bangga bekerjasama dengan <span className="text-foreground font-medium">This Is Ucil Streaming Live</span> sebagai 
              media penyedia replay theater JKT48. Kerjasama ini memungkinkan Arcanove48 
              menyediakan koleksi replay yang lengkap dan berkualitas untuk para fans.
            </p>
          </div>
        </section>

        {/* Visi */}
        <section className="glass-card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Visi</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-13">
            Menjadi platform arsip replay JKT48 yang paling terpercaya, mudah diakses, 
            dan ramah kantong bagi seluruh fans di Indonesia — sehingga setiap pertunjukan 
            theater dapat dinikmati ulang kapanpun, dimanapun, tanpa batas waktu.
          </p>
        </section>

        {/* Misi */}
        <section className="glass-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Misi</h2>
          </div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {[
              "Menyediakan koleksi replay theater JKT48 yang lengkap dan berkualitas hingga 8K.",
              "Menjaga harga akses tetap terjangkau untuk semua kalangan fans.",
              "Memberikan pengalaman menonton yang nyaman, cepat, dan bebas iklan.",
              "Membangun komunitas fans melalui fitur komentar, rating, dan playlist.",
              "Memberikan kesempatan tambahan penghasilan via program Reseller.",
              "Terus berinovasi dengan fitur-fitur baru sesuai kebutuhan pengguna.",
            ].map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Fitur Utama */}
        <section className="glass-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Fitur Utama</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: Play, title: "Kualitas hingga 8K", desc: "Pilihan resolusi 144p — 8K + Auto" },
              { icon: CreditCard, title: "Membership Fleksibel", desc: "1 Minggu, 1 Bulan, Permanen" },
              { icon: KeyRound, title: "URL Kunci", desc: "Akses 1 replay via link satuan" },
              { icon: Users, title: "Group/Playlist", desc: "Paket replay per event/show" },
              { icon: MessageCircle, title: "Chat Realtime", desc: "Komentar live dengan badge Owner & Reseller" },
              { icon: Star, title: "Rating Bintang", desc: "1-5 ⭐ realtime di setiap replay" },
              { icon: Clock, title: "Auto-Resume", desc: "Lanjut dari posisi terakhir" },
              { icon: Calendar, title: "Jadwal Show", desc: "Lihat jadwal show JKT48 yang akan datang" },
              { icon: Calendar, title: "Jadwal Show", desc: "Lihat jadwal show JKT48 yang akan datang" },
              { icon: Radio, title: "Live Member", desc: "Tonton member yang live di IDN & Showroom" },
              { icon: Music, title: "JKT48 Radio", desc: "Radio khas JKT48 dari Cilacap, on air 24 jam" },
              { icon: Cake, title: "Next Birthday", desc: "Countdown ulang tahun member realtime" },
              { icon: Captions, title: "Subtitle [CC]", desc: "Aktifkan subtitle bawaan YouTube di player" },
              { icon: Sparkles, title: "Arva AI Assistant", desc: "Asisten AI 24/7 untuk bantu kamu" },
              { icon: Shield, title: "Anti-Cheat Waktu", desc: "Browser blokir akses jika jam HP diubah manual" },
            ].map((f, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                <f.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{f.title}</h4>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cara Pemakaian */}
        <section className="glass-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Play className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Cara Pemakaian</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
                Daftar / Login
              </h3>
              <p className="text-xs text-muted-foreground pl-8 leading-relaxed">
                Buat akun dengan email & kata sandi. Setelah login, kamu wajib mengisi 
                <span className="text-foreground font-medium"> username</span> agar bisa menonton replay.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
                Pilih Akses
              </h3>
              <ul className="text-xs text-muted-foreground pl-8 leading-relaxed space-y-1.5">
                <li>• <span className="text-foreground font-medium">Membership</span> — akses semua replay sesuai durasi</li>
                <li>• <span className="text-foreground font-medium">URL Kunci</span> — link satuan untuk 1 replay (sekali pakai, 24 jam)</li>
                <li>• <span className="text-foreground font-medium">Group/Playlist</span> — paket beberapa replay sekaligus</li>
                <li>• <span className="text-foreground font-medium">Replay Gratis</span> — tandai dengan ✅ Gratis, bisa langsung tonton</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</span>
                Pesan via WhatsApp
              </h3>
              <p className="text-xs text-muted-foreground pl-8 leading-relaxed">
                Hubungi admin lewat WhatsApp untuk pembelian. Pembayaran via 
                <span className="text-foreground font-medium"> Dana / GoPay</span>. 
                Setelah bayar, admin akan kirim token/URL aktivasi.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">4</span>
                Tonton & Nikmati
              </h3>
              <p className="text-xs text-muted-foreground pl-8 leading-relaxed">
                Klik replay yang ingin ditonton. Player akan menyimpan posisi terakhir secara 
                otomatis. Bisa kasih rating ⭐ dan ikut chat realtime dengan fans lain!
              </p>
            </div>
          </div>
        </section>

        {/* Harga */}
        <section className="glass-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Harga</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "🎟 1 Replay", price: "Rp 2.000" },
              { label: "👑 Membership 1 Minggu", price: "Rp 7.000" },
              { label: "👑 Membership 1 Bulan", price: "Rp 10.000" },
              { label: "👑 Membership Permanen", price: "Rp 20.000" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-sm text-muted-foreground">{p.label}</span>
                <span className="text-sm font-bold text-primary">{p.price}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">Pembayaran via Dana / GoPay</p>
        </section>

        {/* Log Update */}
        <section className="glass-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Log Update</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                version: "Phase 5 v1.1",
                date: "22 Agustus 2026",
                latest: true,
                items: [
                  "Halaman JKT48 Radio — radio khas JKT48 dari Cilacap, on air 24 jam nonstop, pemutar modern + tombol share ke WhatsApp",
                  "Halaman Next Birthday — countdown realtime ulang tahun member JKT48, diurutkan dari yang paling dekat",
                  "Tombol Subtitle [CC] di Stream Player replay — default mati, bisa diaktifkan jika video punya subtitle bawaan YouTube",
                  "Arva AI kini bisa membaca data member yang sedang live, jadwal show mendatang beserta line-up, dan data ulang tahun member secara realtime",
                ],
              },
              {
                version: "1.9 Phase 4",
                date: "16 Juli 2026",
                items: [
                  "Halaman Live Member (IDN Live & Showroom) dengan player HLS + stream info",
                  "Perbaikan Jadwal Show: info team, banner anti-blokir",
                  "URL Kunci Membership jadi permanen (tidak kadaluarsa) + pencatatan IP aktivasi",
                  "Fix bug viewer count double, realtime komentar/rating/replay disempurnakan",
                ],
              },
              {
                version: "1.9 Phase 3",
                date: "April 2026",
                items: [
                  "Halaman Jadwal Show + line-up member di halaman Watch",
                  "Halaman About/Tentang + panduan admin di Membership & Info Replay",
                  "Membership berbasis kalender, credit partner This Is Ucil di Home",
                  "Fitur Undian, Koin, Gift, dan PiP dihapus",
                ],
              },
            ].map((log, i) => (
              <div key={i} className="rounded-lg bg-secondary/30 p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-display font-bold text-foreground">{log.version}</span>
                  <span className="text-xs text-muted-foreground">· {log.date}</span>
                  {log.latest && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full gradient-primary text-primary-foreground font-semibold">
                      TERBARU
                    </span>
                  )}
                </div>
                <ul className="space-y-1">
                  {log.items.map((it, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Kontak */}
        <section className="glass-card p-6 sm:p-8 space-y-3 text-center">
          <h2 className="text-xl font-display font-bold text-foreground">Kontak Admin</h2>
          <p className="text-sm text-muted-foreground">
            Untuk pembelian, info, atau program Reseller
          </p>
          <a
            href="https://wa.me/+62895351456586"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-primary text-primary-foreground glow-primary font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp: +62 895-3514-56586
          </a>
        </section>

        {/* Footer Credit */}
        <section className="text-center py-6 space-y-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Dikembangkan & dikelola oleh <span className="text-foreground font-semibold">Dimzzvloper</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Bekerjasama dengan <span className="text-primary font-semibold">This Is Ucil Streaming Live</span>
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-2">
            Arcanove48 adalah platform independen non-official dan tidak berafiliasi langsung dengan JKT48 Operation Team.
          </p>
        </section>
      </main>
    </div>
  );
};

export default About;
