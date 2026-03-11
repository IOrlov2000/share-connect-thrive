import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRightLeft, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ExchangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetListingId: string;
  targetListingTitle: string;
  targetUserId: string;
}

interface MyListing {
  id: string;
  title: string;
  images: string[] | null;
  price: number | null;
}

export default function ExchangeModal({ open, onOpenChange, targetListingId, targetListingTitle, targetUserId }: ExchangeModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    setSelectedId(null);
    supabase
      .from("listings")
      .select("id, title, images, price")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMyListings(data || []);
        setLoading(false);
      });
  }, [open, user]);

  const handleSubmit = async () => {
    if (!selectedId || !user) return;
    setSubmitting(true);

    try {
      // 1. Find or create conversation
      let conversationId: string;

      const { data: existingConvo } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", targetListingId)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .maybeSingle();

      if (existingConvo) {
        conversationId = existingConvo.id;
      } else {
        const { data: newConvo, error: convoError } = await supabase
          .from("conversations")
          .insert({
            listing_id: targetListingId,
            participant_1: user.id,
            participant_2: targetUserId,
          })
          .select("id")
          .single();

        if (convoError || !newConvo) {
          throw new Error("Не удалось создать диалог");
        }
        conversationId = newConvo.id;
      }

      // 2. Create exchange offer
      const { error: offerError } = await supabase.from("exchange_offers").insert({
        sender_id: user.id,
        receiver_id: targetUserId,
        sender_listing_id: selectedId,
        receiver_listing_id: targetListingId,
        conversation_id: conversationId,
        status: "pending",
      });

      if (offerError) throw offerError;

      // 3. Send message about exchange
      const selectedListing = myListings.find((l) => l.id === selectedId);
      const messageContent = `🔄 Предложение обмена:\nМоё: «${selectedListing?.title}»\nНа ваше: «${targetListingTitle}»`;

      await supabase.from("messages").insert({
        content: messageContent,
        conversation_id: conversationId,
        sender_id: user.id,
      });

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      toast({ title: "Предложение обмена отправлено! ✅" });
      onOpenChange(false);
      navigate("/messages");
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Предложить обмен
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Выберите своё объявление для обмена на «{targetListingTitle}»
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : myListings.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">У вас нет активных объявлений</p>
            <Button variant="outline" onClick={() => { onOpenChange(false); navigate("/create"); }}>
              Создать объявление
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-2 pr-2">
                {myListings.map((listing) => (
                  <button
                    key={listing.id}
                    onClick={() => setSelectedId(listing.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:bg-muted/50 ${
                      selectedId === listing.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border"
                    }`}
                  >
                    <img
                      src={listing.images?.[0] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&h=80&fit=crop"}
                      alt=""
                      className="h-14 w-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {listing.price ? `${listing.price.toLocaleString()} ₽` : "Договорная"}
                      </p>
                    </div>
                    {selectedId === listing.id && (
                      <Check className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>

            <Button
              className="w-full h-12 text-base gap-2"
              disabled={!selectedId || submitting}
              onClick={handleSubmit}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}
              Отправить предложение
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
