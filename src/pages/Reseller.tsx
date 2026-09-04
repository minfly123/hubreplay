import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Zap, TrendingUp, Users, Smartphone, Package } from "lucide-react";
import PublicNavigation from "@/components/PublicNavigation";

const WA_LINK = "https://wa.me/+62895351456586";

const steps = [
  "Kamu tentukan harga jual sendiri",
  "Pembeli bayar ke kamu",
  "Kamu kirim harga dasar ke kami",
  "Selisihnya? 100% UNTUK KAMU 🔥",
];

const targets = [
  { icon: Users, text: "Admin fanbase" },
  { icon: MessageCircle, text: "Yang punya grup / channel" },
  { icon: Package, text: "Seller digital" },
  { icon: Smartphone, text: "Siapa pun yang mau nambah uang jajan" },
];

const perks = [
  "Tanpa stok",
  "Tanpa ribet",
  "Bisa mulai langsung",
];

const Reseller = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge variant="secondary" className="mb-4 text-base px-4 py-1">🚀 OPEN RESELLER REPLAY TEATER 🚀</Badge>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-4 mb-4">
          Dapet Penghasilan Cuma dari <span className="text-gradient">HP</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          Tanpa modal besar? Tanpa ribet? Sekarang kamu bisa jadi RESELLER Replay Teater dan atur keuntungan kamu sendiri! 👀
        </p>
        <Button size="lg" className="gradient-primary text-primary-foreground glow-primary" asChild>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-5 h-5 mr-2" />
            Join Sekarang
          </a>
        </Button>
      </section>

      {/* Sistem */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-display font-bold text-foreground text-center mb-8">💼 Sistemnya Gampang Banget</h3>
        <div className="max-w-md mx-auto space-y-3">
          {steps.map((s, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0 text-primary-foreground font-bold text-sm">
                  {i + 1}
                </div>
                <span className="text-sm text-foreground">{s}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contoh Profit */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-display font-bold text-foreground text-center mb-8">
          <TrendingUp className="inline w-6 h-6 mr-2 text-primary" />
          Contoh Perhitungan
        </h3>
        <Card className="max-w-md mx-auto bg-primary/5 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Harga jual kamu</span>
              <span className="font-bold text-foreground">Rp5.000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Harga dasar</span>
              <span className="font-bold text-foreground">Rp2.000</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-foreground font-semibold">Profit kamu</span>
              <span className="font-bold text-primary text-lg">Rp3.000</span>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-sm text-muted-foreground text-center">
                Kalau jual 10 replay? <span className="text-primary font-bold">Rp30.000</span> masuk kantong kamu 💰
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Target */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-display font-bold text-foreground text-center mb-8">🎯 Cocok Untuk</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          {targets.map((t) => (
            <Card key={t.text} className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <t.icon className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground">{t.text}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Perks */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {perks.map((p) => (
            <Badge key={p} variant="secondary" className="text-sm px-4 py-2">
              <Zap className="w-3.5 h-3.5 mr-1.5 text-primary" />
              {p}
            </Badge>
          ))}
        </div>
        <p className="text-muted-foreground mb-4">📩 Mau join & mulai cuan hari ini? Chat sekarang 👇</p>
        <Button size="lg" className="gradient-primary text-primary-foreground glow-primary" asChild>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-5 h-5 mr-2" />
            wa.me/+62895351456586
          </a>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Arcanove48. All rights reserved.
      </footer>
    </div>
  );
};

export default Reseller;
