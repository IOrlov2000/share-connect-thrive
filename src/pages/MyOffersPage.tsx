import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRightLeft, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  is_sender: boolean;
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

  useEffect(() => {
    if (!user) return;
    const fetchOffers = async () => {
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

        const [{ data: senderListing }, { data: receiverListing }, { data: profile }] = await Promise.all([
          supabase.from("listings").select("title").eq("id", offer.sender_listing_id).maybeSingle(),
          supabase.from("listings").select("title").eq("id", offer.receiver_listing_id).maybeSingle(),
          supabase.from("profiles").select("display_name").eq("user_id", partnerId).maybeSingle(),
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
          is_sender: isSender,
        });
      }
      setOffers(enriched);
      setLoading(false);
    };
    fetchOffers();
  }, [user]);

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
                {offer.status === "pending" && (
                  <div className="flex gap-2">
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
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <p>У вас пока нет предложений обмена</p>
        </div>
      )}
    </div>
  );
}
