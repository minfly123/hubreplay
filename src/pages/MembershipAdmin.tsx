import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Plus, Copy, Check, Clock, User, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Membership {
  id: string;
  token: string;
  duration: string;
  created_at: string;
  activated_by: string | null;
  activated_at: string | null;
  expires_at: string | null;
  is_used: boolean;
  activated_email?: string;
}

const DURATION_LABELS: Record<string, string> = {
  "1_week": "1 Minggu",
  "1_month": "1 Bulan",
  permanent: "Permanen",
};

const generateToken = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 20; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const MembershipAdmin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [duration, setDuration] = useState("1_week");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      navigate("/", { replace: true });
      return;
    }
    fetchMemberships();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchMemberships = async () => {
    const { data } = await supabase
      .from("memberships")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      // Fetch emails for activated memberships
      const activatedIds = data.filter(m => m.activated_by).map(m => m.activated_by!);
      let emailMap: Record<string, string> = {};
      if (activatedIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, email")
          .in("user_id", activatedIds);
        if (profiles) {
          profiles.forEach(p => { emailMap[p.user_id] = p.email || "Unknown"; });
        }
      }
      setMemberships(data.map(m => ({
        ...m,
        activated_email: m.activated_by ? emailMap[m.activated_by] || "Unknown" : undefined,
      })));
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    const token = generateToken();
    const { error } = await supabase.from("memberships").insert({
      token,
      duration,
      created_by: user.id,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Membership berhasil dibuat!");
      fetchMemberships();
    }
    setCreating(false);
  };

  const getExpiryLabel = (m: Membership) => {
    if (!m.is_used) return "Belum diaktifkan";
    if (m.duration === "permanent") return "Permanen";
    if (m.expires_at) return new Date(m.expires_at).toLocaleString("id-ID");
    return "-";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus membership ini? Jika sudah diaktivasi, membership pengguna akan dicabut.")) return;
    const { error } = await supabase.from("memberships").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Membership dihapus!");
      fetchMemberships();
    }
  };

  const copyMembershipInfo = (m: Membership) => {
    const url = `${window.location.origin}/membership/${m.token}`;
    const text = `🎫 Membership Arcanove48\n\n📋 ID: ${m.id.slice(0, 8)}\n⏱ Durasi: ${DURATION_LABELS[m.duration]}\n🔗 URL Aktivasi: ${url}\n⏳ Masa Habis: ${getExpiryLabel(m)}\n\n⚠️ Jangan bagikan link ini! Hanya bisa diaktivasi 1 kali untuk 1 akun.`;
    navigator.clipboard.writeText(text);
    setCopiedId(m.id);
    toast.success("Info membership disalin!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-sm">
              Arca<span className="text-gradient">nove48</span> — Membership
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Create form */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">Buat Membership Baru</h2>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground mb-1 block">Durasi</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_week">1 Minggu</SelectItem>
                  <SelectItem value="1_month">1 Bulan</SelectItem>
                  <SelectItem value="permanent">Permanen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="gradient-primary text-primary-foreground glow-primary"
            >
              <Plus className="w-4 h-4 mr-1" />
              {creating ? "Membuat..." : "Buat"}
            </Button>
          </div>
        </div>

        {/* List */}
        <h2 className="text-lg font-display font-bold text-foreground mb-4">
          Daftar Membership ({memberships.length})
        </h2>
        <div className="space-y-3">
          {memberships.map((m) => (
            <div key={m.id} className="glass-card p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    if (!m.is_used) return <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Belum Aktif</span>;
                    if (m.duration === "permanent") return <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Aktif (Permanen)</span>;
                    if (m.expires_at && new Date(m.expires_at).getTime() <= Date.now()) return <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Kadaluarsa</span>;
                    return <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Aktif</span>;
                  })()}
                  <span className="text-xs text-muted-foreground">
                    {DURATION_LABELS[m.duration]}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyMembershipInfo(m)}
                    className="text-xs"
                  >
                    {copiedId === m.id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedId === m.id ? "Tersalin" : "Salin Info"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(m.id)}
                    className="text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-mono break-all">
                Token: {m.token}
              </p>
              <p className="text-xs text-muted-foreground">
                URL: {window.location.origin}/membership/{m.token}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Habis: {getExpiryLabel(m)}
                </span>
                {m.activated_email && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {m.activated_email}
                  </span>
                )}
              </div>
            </div>
          ))}
          {memberships.length === 0 && (
            <p className="text-muted-foreground text-center py-8">Belum ada membership dibuat.</p>
          )}
        </div>

        {/* Panduan Cara Pemakaian */}
        <div className="mt-10 glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-base font-display font-bold text-foreground">📘 Cara Pakai Halaman Membership</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold text-foreground mb-1">1. Generate Token Membership</h4>
              <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                <li>• Pilih durasi: <span className="text-foreground font-medium">1 Minggu, 1 Bulan, atau Permanen</span></li>
                <li>• Klik tombol <span className="text-primary font-medium">"Buat Token"</span></li>
                <li>• Sistem otomatis generate token unik 20 karakter</li>
                <li>• Token bersifat <span className="text-foreground font-medium">sekali pakai</span> — setelah diaktivasi, tidak bisa dipakai lagi</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-1">2. Kirim ke Pembeli</h4>
              <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                <li>• Klik tombol <span className="text-primary font-medium">"Salin Info"</span> untuk copy info lengkap (token + URL)</li>
                <li>• Kirim URL aktivasi ke pembeli via WhatsApp/chat</li>
                <li>• Format URL: <span className="font-mono text-primary">/membership/[TOKEN]</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-1">3. Pembeli Aktivasi</h4>
              <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                <li>• Pembeli klik URL → login → otomatis aktivasi</li>
                <li>• Durasi dihitung berbasis <span className="text-foreground font-medium">kalender</span> (bukan jumlah hari kasar)</li>
                <li>• Contoh: aktivasi 1 Bulan tanggal 19 April → kadaluarsa tanggal 19 Mei</li>
                <li>• Membership <span className="text-foreground font-medium">Permanen</span> tidak ada tanggal kadaluarsa</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-1">4. Pantau & Kelola</h4>
              <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                <li>• Daftar membership menampilkan: token, durasi, tanggal kadaluarsa, dan email pembeli (setelah aktivasi)</li>
                <li>• Token yang belum dipakai bisa dihapus dengan ikon 🗑</li>
                <li>• Token yang sudah dipakai sebaiknya tidak dihapus untuk arsip</li>
              </ul>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-3">
              <p className="text-xs text-yellow-500 font-medium mb-1">⚠️ Tips Penting</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Pastikan pembeli sudah <span className="text-foreground">login</span> sebelum klik URL aktivasi</li>
                <li>• Catat email/nomor pembeli sebagai bukti transaksi</li>
                <li>• Harga jual: 1 Minggu Rp7.000 • 1 Bulan Rp10.000 • Permanen Rp20.000</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MembershipAdmin;
