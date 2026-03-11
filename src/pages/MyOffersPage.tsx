import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRightLeft, Loader2, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ExchangeOffer {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender_listing_title: string;
  receiver_listing_title: string;
  partner_name: string;
  partner_id: string;
  is_sender: boolean;
  has_rated: boolean;
}

const statusMap: Record<string, { label: string; variant: "outline" | "default" | "destructive" }> = {
  pending: { label: "Ожидает", variant: "outline" },
  accepted: { label: "Принято", variant: "default" },
  rejected: { label: "Отклонено", variant: "destructive" },
};

export default function MyOffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<ExchangeOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<{ offerId: string; partnerId: string; partnerName: string } | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchOffers();
  }, [user]);

  const fetchOffers = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("exchange_offers")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const enriched: ExchangeOffer[] = [];
    for (const offer of data) {
      const isSender = offer.sender_id === user.id;
      const partnerId = isSender ? offer.receiver_id : offer.sender_id;

      const [{ data: senderListing }, { data: receiverListing }, { data: profile }, { data: existingRating }] = await Promise.all([
        supabase.from("listings").select("title").eq("id", offer.sender_listing_id).maybeSingle(),
        supabase.from("listings").select("title").eq("id", offer.receiver_listing_id).maybeSingle(),
        supabase.from("profiles").select("display_name").eq("user_id", partnerId).maybeSingle(),
        supabase.from("ratings").select("id").eq("offer_id", offer.id).eq("rater_id", user.id).maybeSingle(),
      ]);

      enriched.push({
        id: offer.id,
        sender_id: offer.sender_id,
        receiver_id: offer.receiver_id,
        status: offer.status,
        created_at: offer.created_at,
        sender_listing_title: senderListing?.title || "Удалено",
        receiver_listing_title: receiverListing?.title || "Удалено",
        partner_name: profile?.display_name || "Пользователь",
        partner_id: partnerId,
        is_sender: isSender,
        has_rated: !!existingRating,
      });
    }
    setOffers(enriched);
    setLoading(false);
  };

  const updateStatus = async (offerId: string, newStatus: string) => {
    const { error } = await supabase
      .from("exchange_offers")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", offerId);

    if (error) {
      toast({ title: "Ошибка", variant: "destructive" });
    } else {
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o)));
      toast({ title: newStatus === "accepted" ? "Обмен принят! ✅" : "Предложение отклонено" });
    }
  };

  const submitRating = async () => {
    if (!ratingModal || !user) return;
    setSubmittingRating(true);

    const { error } = await supabase.from("ratings").insert({
      offer_id: ratingModal.offerId,
      rater_id: user.id,
      rated_id: ratingModal.partnerId,
      score: ratingScore,
      comment: ratingComment.trim() || null,
    });

    if (error) {
      toast({ title: "Ошибка отправки отзыва", variant: "destructive" });
    } else {
      toast({ title: "Отзыв отправлен ⭐" });
      setOffers((prev) => prev.map((o) => o.id === ratingModal.offerId ? { ...o, has_rated: true } : o));
    }
    setSubmittingRating(false);
    setRatingModal(null);
    setRatingScore(5);
    setRatingComment("");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold">Мои предложения</h1>
      </div>

      {offers.length > 0 ? (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {offer.partner_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold">{offer.partner_name}</span>
                </div>
                <Badge variant={statusMap[offer.status]?.variant || "outline"}>
                  {statusMap[offer.status]?.label || offer.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex-1 rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">{offer.is_sender ? "Вы отдаёте" : "Вам предлагают"}</p>
                  <p className="font-medium mt-0.5 truncate">{offer.is_sender ? offer.sender_listing_title : offer.receiver_listing_title}</p>
                </div>
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">{offer.is_sender ? "Вы получаете" : "Они хотят"}</p>
                  <p className="font-medium mt-0.5 truncate">{offer.is_sender ? offer.receiver_listing_title : offer.sender_listing_title}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(offer.created_at).toLocaleDateString("ru-RU")}
                </span>
                <div className="flex gap-2">
                  {offer.status === "pending" && (
                    <>
                      {offer.is_sender ? (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(offer.id, "rejected")}>
                          Отменить
                        </Button>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(offer.id, "rejected")}>
                            Отклонить
                          </Button>
                          <Button size="sm" onClick={() => updateStatus(offer.id, "accepted")}>
                            Принять
                          </Button>
                        </>
                      )}
                    </>
                  )}
                  {offer.status === "accepted" && !offer.has_rated && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => setRatingModal({
                        offerId: offer.id,
                        partnerId: offer.partner_id,
                        partnerName: offer.partner_name,
                      })}
                    >
                      <Star className="h-3.5 w-3.5" /> Оценить
                    </Button>
                  )}
                  {offer.has_rated && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-secondary text-secondary" /> Оценено
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <p>У вас пока нет предложений обмена</p>
        </div>
      )}

      {/* Rating Modal */}
      <Dialog open={!!ratingModal} onOpenChange={(open) => !open && setRatingModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Оценить {ratingModal?.partnerName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRatingScore(s)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      s <= ratingScore ? "fill-secondary text-secondary" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {ratingScore === 1 && "Ужасно"}
              {ratingScore === 2 && "Плохо"}
              {ratingScore === 3 && "Нормально"}
              {ratingScore === 4 && "Хорошо"}
              {ratingScore === 5 && "Отлично!"}
            </p>
            <Textarea
              placeholder="Комментарий (необязательно)..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              rows={3}
            />
            <Button className="w-full" onClick={submitRating} disabled={submittingRating}>
              {submittingRating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Отправить отзыв
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
