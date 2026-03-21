import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Gift, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const GiftClaim = () => {
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ready" | "full" | "claimed" | "invalid" | "already">("loading");
  const [giftInfo, setGiftInfo] = useState<{ id: string; replay_id: string; max_winners: number; claimed_count: number; replayTitle: string } | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/auth?redirect=/gift/${token}`, { replace: true });
      return;
    }
    checkGift();
  }, [authLoading, user, token]);

  const checkGift = async () => {
    if (!token || !user) return;

    // Find gift by token
    const { data: gift } = await supabase
      .from("gifts")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (!gift) {
      setStatus("invalid");
      return;
    }

    // Get replay title
    const { data: replay } = await supabase
      .from("replays")
      .select("title")
      .eq("id", gift.replay_id)
      .single();

    setGiftInfo({
      id: gift.id,
      replay_id: gift.replay_id,
      max_winners: gift.max_winners,
      claimed_count: gift.claimed_count,
      replayTitle: replay?.title || "Replay",
    });

    // Check if already claimed by this user
    const { data: existing } = await supabase
      .from("gift_claims")
      .select("id")
      .eq("gift_id", gift.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      setStatus("already");
      return;
    }

    // Check slots
    if (gift.claimed_count >= gift.max_winners) {
      setStatus("full");
      return;
    }

    setStatus("ready");
  };

  const handleClaim = async () => {
    if (!giftInfo || !user) return;
    setClaiming(true);

    // Insert claim
    const { error: claimError } = await supabase
      .from("gift_claims")
      .insert({ gift_id: giftInfo.id, user_id: user.id });

    if (claimError) {
      toast.error("Gagal klaim gift!");
      setClaiming(false);
      return;
    }

    // Increment claimed_count
    const { error: updateError } = await supabase
      .from("gifts")
      .update({ claimed_count: giftInfo.claimed_count + 1 })
      .eq("id", giftInfo.id);

    if (updateError) {
      toast.error("Gagal update slot!");
      setClaiming(false);
      return;
    }

    // Unlock replay permanently
    await supabase.from("replay_unlocks").insert({
      replay_id: giftInfo.replay_id,
      user_id: user.id,
    });

    toast.success("Gift berhasil diklaim! Replay terbuka permanen.");
    setStatus("claimed");
    setClaiming(false);
  };

  if (authLoading || status === "loading") return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center space-y-5">
        {status === "invalid" && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Link Tidak Valid</h2>
            <p className="text-sm text-muted-foreground">Link gift ini tidak ditemukan atau sudah tidak berlaku.</p>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">Kembali</Button>
          </>
        )}

        {status === "full" && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Yah, Telat! 😔</h2>
            <p className="text-sm text-muted-foreground">Udah penuh slotnya. Gift untuk <strong>{giftInfo?.replayTitle}</strong> sudah habis diklaim.</p>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">Kembali</Button>
          </>
        )}

        {status === "already" && (
          <>
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Sudah Diklaim ✓</h2>
            <p className="text-sm text-muted-foreground">Kamu sudah klaim gift <strong>{giftInfo?.replayTitle}</strong>. Replay sudah terbuka permanen.</p>
            <Button onClick={() => navigate("/")} className="w-full">Tonton Sekarang</Button>
          </>
        )}

        {status === "ready" && giftInfo && (
          <>
            <Gift className="w-16 h-16 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">🎁 Gift Replay</h2>
            <p className="text-sm text-muted-foreground">
              <strong>{giftInfo.replayTitle}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Slot tersisa: {giftInfo.max_winners - giftInfo.claimed_count}/{giftInfo.max_winners}
            </p>
            <Button onClick={handleClaim} disabled={claiming} className="w-full">
              {claiming ? "Mengklaim..." : "🎉 Klaim Gift"}
            </Button>
          </>
        )}

        {status === "claimed" && (
          <>
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Berhasil! 🎉</h2>
            <p className="text-sm text-muted-foreground">Replay <strong>{giftInfo?.replayTitle}</strong> sudah terbuka permanen untukmu.</p>
            <Button onClick={() => navigate("/")} className="w-full">Tonton Sekarang</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default GiftClaim;
