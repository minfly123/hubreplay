import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Play,
  Users,
  Heart,
  Cake,
  Calendar,
  Newspaper,
  Sparkles,
  Instagram,
  MapPin,
  MessageCircle,
  Ticket,
} from "lucide-react";

const INSTAGRAM_URL =
  "https://www.instagram.com/arcanove48_ofc?igsi=MTVpc2N1NGEzbTdicA==";

const HIGHLIGHTS = [
  {
    icon: Cake,
    title: "Info Ulang Tahun Member",
    desc: "Pengumuman hari lahir member serta perayaan khusus dari fans (seitansai).",
  },
  {
    icon: Calendar,
    title: "Jadwal Theater",
    desc: "Pembaruan rutin pertunjukan theater agar kamu tidak ketinggalan pesan tiket.",
  },
  {
    icon: Newspaper,
    title: "News & Berita Terkini",
    desc: "Pengumuman penting dan kabar terbaru langsung dari dunia JKT48.",
  },
  {
    icon: Sparkles,
    title: "Trivia & Konten Menarik",
    desc: "Fakta unik, informasi seru, dan pengetahuan mendalam seputar member dan grup.",
  },
];

const BUDDY = [
  { icon: MapPin, label: "Theater JKT48" },
  { icon: Ticket, label: "Event Off-Air" },
  { icon: Users, label: "Festival Musik" },
  { icon: Heart, label: "Meet & Greet" },
];

const Community = () => {
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
              Tentang <span className="text-gradient">Komunitas</span>
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <section className="glass-card p-6 sm:p-10 text-center space-y-4 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center glow-primary relative">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground relative">
            Arca<span className="text-gradient">nove48</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto relative">
            Komunitas dan wadah interaktif bagi para penggemar JKT48 untuk mencari teman
            nonton (concert buddy) bersama — mulai dari Theater JKT48, acara off-air,
            festival musik, hingga event Meet &amp; Greet.
          </p>
          <div className="flex flex-wrap justify-center gap-2 relative">
            {BUDDY.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-foreground"
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Pusat Informasi JKT48
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card p-5 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-6 space-y-3">
          <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Lebih dari Sekadar Dokumentasi
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Arcanove48 tidak hanya membagikan dokumentasi visual, melainkan bertindak
            sebagai community hub yang menyatukan para fans di dunia nyata sekaligus
            platform informasi digital yang serbatahu. Di sini kamu bisa berkenalan dengan
            fans lain, berbagi cerita, dan tetap terhubung dengan setiap kabar terbaru
            JKT48.
          </p>
        </section>

        <section className="glass-card p-6 space-y-4 text-center">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Ikuti Sosial Media Kami
          </h2>
          <p className="text-muted-foreground text-sm">
            Update komunitas, info theater, dan konten seru setiap hari.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold glow-primary"
          >
            <Instagram className="w-5 h-5" />
            @arcanove48_ofc
          </a>
        </section>
      </main>
    </div>
  );
};

export default Community;
