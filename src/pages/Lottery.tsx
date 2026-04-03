import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTimeValidation } from "@/hooks/useTimeValidation";
import AppNavigation from "@/components/AppNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Coins, Ticket, Gift, Clock, Download, Copy, Trophy, Sparkles, AlertTriangle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Prize {
  key: string;
  name: string;
  weight: number;
  type: "coins" | "telegram" | "photobook";
  coinAmount?: number;
  telegramLink?: string;
  waTemplate?: string;
}

const PRIZES: Prize[] = [
  { key: "coins_50", name: "50 Koin Gratis", weight: 40, type: "coins", coinAmount: 50 },
  { key: "photobook_pumpkin", name: "PDF Digital Photobook Oh My Pumpkin", weight: 25, type: "photobook", waTemplate: "Halo Admin, saya mendapat hadiah 'PDF Digital Photobook Oh My Pumpkin' dari undian Hub Replay. Berikut bukti hadiah saya:" },
  { key: "pm_jkt48", name: "PM Member JKT48 All Member Permanen (via Telegram)", weight: 20, type: "telegram", telegramLink: "https://t.me/addlist/06SXr_6fklg5NjU1" },
  { key: "photobook_idola", name: "PDF Digital Photobook Andai Ku Bukan Idola", weight: 14, type: "photobook", waTemplate: "Halo Admin, saya mendapat hadiah 'PDF Digital Photobook Andai Ku Bukan Idola' dari undian Hub Replay. Berikut bukti hadiah saya:" },
  { key: "coins_1000", name: "1000 Koin Jackpot!", weight: 1, type: "coins", coinAmount: 1000 },
];

const TOTAL_WEIGHT = PRIZES.reduce((s, p) => s + p.weight, 0);
const TICKET_PRICE = 1000;
const OPERATING_START = 14;
const OPERATING_END = 23;

const pickPrize = (): Prize => {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const p of PRIZES) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return PRIZES[0];
};

const isOperatingHours = (serverTimeMs?: number | null) => {
  // Use server time if available, fallback to local
  const now = serverTimeMs ? new Date(serverTimeMs) : new Date();
  // Convert to WIB (UTC+7)
  const wibOffset = 7 * 60; // minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const wibMinutes = (utcMinutes + wibOffset) % (24 * 60);
  const wibHour = Math.floor(wibMinutes / 60);
  return wibHour >= OPERATING_START && wibHour < OPERATING_END;
};

const Lottery = () => {
  const { user, loading: authLoading } = useAuth();
  const [coins, setCoins] = useState(0);
  const [tickets, setTickets] = useState(0);
  const [buyAmount, setBuyAmount] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [hasFreeSpin, setHasFreeSpin] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [open, setOpen] = useState(isOperatingHours());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketPrize, setTicketPrize] = useState<any>(null);

  // Check operating hours every minute
  useEffect(() => {
    const check = () => setOpen(isOperatingHours());
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [coinsRes, historyRes] = await Promise.all([
      supabase.from("user_coins").select("balance").eq("user_id", user.id).maybeSingle(),
      supabase.from("lottery_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setCoins(coinsRes.data?.balance ?? 0);
    setHistory(historyRes.data || []);
    // Check if user has ever spun (first spin free)
    setHasFreeSpin(!historyRes.data || historyRes.data.length === 0);
    setLoadingData(false);
  }, [user]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // Realtime coins subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("user-coins-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_coins", filter: `user_id=eq.${user.id}` }, (payload: any) => {
        if (payload.new?.balance !== undefined) setCoins(payload.new.balance);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const buyTickets = async () => {
    if (!user) return;
    const count = parseInt(buyAmount);
    if (!count || count < 1) { toast.error("Masukkan jumlah tiket yang valid!"); return; }
    const cost = count * TICKET_PRICE;
    if (cost > coins) { toast.error(`Koin tidak cukup! Butuh ${cost.toLocaleString()} koin.`); return; }

    const { data: ok } = await supabase.rpc("spend_coins", { _user_id: user.id, _amount: cost });
    if (!ok) { toast.error("Gagal membeli tiket. Koin tidak cukup!"); return; }

    await supabase.from("coin_transactions").insert({ user_id: user.id, amount: -cost, type: "ticket_purchase", description: `Beli ${count} tiket undian` });
    setTickets((t) => t + count);
    setCoins((c) => c - cost);
    setBuyAmount("");
    toast.success(`Berhasil membeli ${count} tiket!`);
  };

  const spin = async () => {
    if (!user || spinning) return;
    if (!hasFreeSpin && tickets <= 0) { toast.error("Tidak ada tiket! Beli tiket dulu."); return; }

    setSpinning(true);
    setResult(null);

    // Use free spin or deduct ticket
    if (hasFreeSpin) {
      setHasFreeSpin(false);
    } else {
      setTickets((t) => t - 1);
    }

    // Simulate spin animation delay
    await new Promise((r) => setTimeout(r, 2500));

    const prize = pickPrize();
    setResult(prize);

    // Record result
    await supabase.from("lottery_results").insert({
      user_id: user.id,
      prize_key: prize.key,
      prize_name: prize.name,
    });

    // Grant coin prizes atomically
    if (prize.type === "coins" && prize.coinAmount) {
      await supabase.rpc("add_coins", { _user_id: user.id, _amount: prize.coinAmount });
      await supabase.from("coin_transactions").insert({
        user_id: user.id,
        amount: prize.coinAmount,
        type: "lottery_win",
        description: `Hadiah undian: ${prize.name}`,
      });
    }

    // If photobook, show canvas ticket
    if (prize.type === "photobook") {
      setTicketPrize(prize);
      setShowTicket(true);
    }

    loadData();
    setSpinning(false);
  };

  const drawTicketCanvas = useCallback(() => {
    if (!canvasRef.current || !ticketPrize || !user) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 600;
    canvas.height = 340;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 600, 340);
    grad.addColorStop(0, "#1a1625");
    grad.addColorStop(1, "#2d1b4e");
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, 600, 340, 16);
    ctx.fill();

    // Border
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 3;
    ctx.roundRect(8, 8, 584, 324, 12);
    ctx.stroke();

    // Random security pattern
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
      ctx.fillRect(Math.random() * 600, Math.random() * 340, 3, 3);
    }
    ctx.globalAlpha = 1;

    // Title
    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 22px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("🎫 BUKTI HADIAH UNDIAN HUB REPLAY 🎫", 300, 40);

    // Divider
    ctx.strokeStyle = "#a855f750";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 55);
    ctx.lineTo(570, 55);
    ctx.stroke();

    // Prize info
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "16px system-ui";
    ctx.textAlign = "left";
    ctx.fillText(`Hadiah: ${ticketPrize.name}`, 30, 90);
    ctx.fillText(`Pemenang: ${user.email}`, 30, 120);
    ctx.fillText(`Tanggal: ${new Date().toLocaleString("id-ID")}`, 30, 150);

    // Unique code
    const code = `HR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`Kode Verifikasi: ${code}`, 30, 185);

    // Security hash
    const hash = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
    ctx.fillStyle = "#64748b";
    ctx.font = "10px monospace";
    ctx.fillText(`Hash: ${hash}`, 30, 210);

    // QR-like pattern (security visual)
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (Math.random() > 0.4) {
          ctx.fillStyle = "#a855f7";
          ctx.fillRect(440 + x * 18, 80 + y * 18, 14, 14);
        }
      }
    }

    // Footer
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Klaim via WA Admin: +62895351456586", 300, 280);
    ctx.fillText("Screenshot/download bukti ini untuk klaim hadiah", 300, 300);
    ctx.fillText("Hub Replay — Create by Dimzzvloper", 300, 325);
  }, [ticketPrize, user]);

  useEffect(() => {
    if (showTicket) setTimeout(drawTicketCanvas, 100);
  }, [showTicket, drawTicketCanvas]);

  const downloadTicket = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `bukti-hadiah-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  if (authLoading) return <LoadingSpinner />;
  if (!user) {
    window.location.href = "/auth";
    return <LoadingSpinner />;
  }
  if (loadingData) return <LoadingSpinner />;

  if (!open) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <main className="container mx-auto px-4 py-16 max-w-md text-center">
          <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Undian Sedang Tutup</h2>
          <p className="text-muted-foreground mb-4">
            Jam operasional undian setiap hari pukul <span className="text-primary font-bold">14:00 - 23:00 WIB</span>
          </p>
          <p className="text-sm text-muted-foreground">Silakan kembali pada jam operasional untuk bermain undian!</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Undian <span className="text-gradient">Hadiah</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Putar undian & dapatkan hadiah menarik!</p>
        </div>

        {/* Coin Balance */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo Koin</p>
              <p className="text-xl font-bold text-foreground">{coins.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Tiket</p>
            <p className="text-xl font-bold text-primary">{tickets + (hasFreeSpin ? 1 : 0)}</p>
          </div>
        </div>

        {/* Free spin notice */}
        {hasFreeSpin && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
            <p className="text-sm text-primary font-medium">🎉 Kamu punya 1x undian GRATIS! Putar sekarang!</p>
          </div>
        )}

        {/* Spin Button */}
        <div className="text-center">
          <Button
            onClick={spin}
            disabled={spinning || (!hasFreeSpin && tickets <= 0)}
            className="gradient-primary text-primary-foreground glow-primary px-8 py-6 text-lg font-bold rounded-xl"
          >
            {spinning ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">🎰</span> Memutar...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Gift className="w-5 h-5" /> Putar Undian
              </span>
            )}
          </Button>
        </div>

        {/* Spin Result */}
        {result && !spinning && (
          <div className="bg-card border-2 border-primary/50 rounded-xl p-5 text-center space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <Trophy className="w-10 h-10 text-primary mx-auto" />
            <h3 className="text-lg font-bold text-foreground">🎉 Selamat!</h3>
            <p className="text-foreground font-medium">{result.name}</p>

            {result.type === "telegram" && result.telegramLink && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Klik link di bawah untuk bergabung:</p>
                <a href={result.telegramLink} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm break-all">
                  {result.telegramLink}
                </a>
              </div>
            )}

            {result.type === "coins" && (
              <p className="text-sm text-muted-foreground">Koin sudah ditambahkan ke saldo kamu!</p>
            )}

            {result.type === "photobook" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Klaim via WA Admin dengan screenshot/download bukti hadiah di bawah.
                </p>
                <Button variant="outline" size="sm" onClick={() => {
                  const wa = `https://wa.me/+62895351456586?text=${encodeURIComponent(result.waTemplate || "")}`;
                  window.open(wa, "_blank");
                }}>
                  <Copy className="w-4 h-4 mr-1" /> Hubungi Admin via WA
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Canvas Ticket for Photobook */}
        {showTicket && (
          <div className="space-y-3">
            <canvas ref={canvasRef} className="w-full rounded-lg border border-border" style={{ imageRendering: "auto" }} />
            <Button onClick={downloadTicket} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" /> Download Bukti Hadiah
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowTicket(false)}>
              Tutup
            </Button>
          </div>
        )}

        {/* Buy Tickets */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" /> Beli Tiket Undian
          </h3>
          <p className="text-xs text-muted-foreground">1 tiket = 1.000 koin. Masukkan jumlah tiket yang ingin dibeli.</p>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              placeholder="Jumlah tiket"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
            />
            <Button onClick={buyTickets} disabled={!buyAmount || parseInt(buyAmount) < 1}>
              Beli
            </Button>
          </div>
          {buyAmount && parseInt(buyAmount) > 0 && (
            <p className="text-xs text-muted-foreground">
              Total: {(parseInt(buyAmount) * TICKET_PRICE).toLocaleString()} koin
            </p>
          )}
        </div>

        {/* Prize List */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-foreground">🎁 Daftar Hadiah</h3>
          <div className="space-y-2">
            {PRIZES.map((p) => (
              <div key={p.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{p.name}</span>
                <Badge variant="outline" className="text-xs">
                  {((p.weight / TOTAL_WEIGHT) * 100).toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground">📜 Riwayat Undian</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-1.5 text-sm border-b border-border last:border-0">
                  <span className="text-foreground truncate flex-1">{h.prize_name}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {new Date(h.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-secondary/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Info Penting:</p>
          <p>• Undian pertama GRATIS! Selanjutnya beli tiket.</p>
          <p>• Beli replay satuan via admin = +200 koin bonus.</p>
          <p>• Jam operasional undian: 14:00 - 23:00 WIB.</p>
          <p>• Hadiah Photobook diklaim via WA Admin dengan bukti.</p>
        </div>
      </main>
    </div>
  );
};

export default Lottery;
