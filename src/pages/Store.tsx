import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Crown, Ticket, Tv, Clock, Globe, Shield } from "lucide-react";
import PublicNavigation from "@/components/PublicNavigation";

const benefits = [
  { icon: Tv, text: "Kualitas hingga 1080p" },
  { icon: Shield, text: "Akses private & nyaman" },
  { icon: Globe, text: "Via website" },
  { icon: Clock, text: "Bisa nonton kapan saja & di mana saja" },
  { icon: Crown, text: "Tersedia paket Membership (akses banyak replay)" },
];

const prices = [
  { icon: Ticket, label: "1 Replay", price: "Rp2.000", accent: false },
  { icon: Crown, label: "Membership 1 Minggu", price: "Rp7.000", accent: true },
  { icon: Crown, label: "Membership 1 Bulan", price: "Rp10.000", accent: true },
  { icon: Crown, label: "Membership Permanen", price: "Rp20.000", accent: true },
];

const WA_LINK = "https://wa.me/+62895351456586";

const Store = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge variant="secondary" className="mb-4 text-base px-4 py-1">🎭 REPLAY TEATER JKT48 🎭</Badge>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-4 mb-4">
          Nonton <span className="text-gradient">Full Show</span> dengan Kualitas Terbaik
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-2">
          Nyari replay di YouTube tapi cuma dapat MC doang?
        </p>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          Sekarang bisa nonton replay lengkap dengan harga terjangkau! 👀✨
        </p>
        <Button size="lg" className="gradient-primary text-primary-foreground glow-primary" asChild>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat Sekarang
          </a>
        </Button>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-display font-bold text-foreground text-center mb-8">✨ Benefit</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {benefits.map((b) => (
            <Card key={b.text} className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <b.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{b.text}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Price List */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-display font-bold text-foreground text-center mb-8">💰 Price List</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {prices.map((p) => (
            <Card key={p.label} className={`border-border ${p.accent ? "bg-primary/5 border-primary/20" : "bg-card"}`}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <p.icon className={`w-5 h-5 ${p.accent ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-foreground font-medium">{p.label}</span>
                </div>
                <span className="font-display font-bold text-lg text-foreground">{p.price}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Payment */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h3 className="text-2xl font-display font-bold text-foreground mb-4">💳 Payment</h3>
        <div className="flex items-center justify-center gap-3 mb-8">
          <Badge variant="secondary" className="text-sm px-3 py-1">Dana</Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">GoPay</Badge>
        </div>
        <p className="text-muted-foreground mb-4">📩 Minat? Chat sekarang 👇</p>
        <Button size="lg" className="gradient-primary text-primary-foreground glow-primary" asChild>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-5 h-5 mr-2" />
            wa.me/+62895351456586
          </a>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Hub Replay. All rights reserved.
      </footer>
    </div>
  );
};

export default Store;
