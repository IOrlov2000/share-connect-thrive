import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ArrowRightLeft, MessageCircle, MapPin, ArrowLeft, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ExchangeModal from "@/components/ExchangeModal";

interface ListingDetail {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  price: number | null;
  location: string | null;
  is_charity: boolean | null;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  categories: { name: string } | null;
}

interface SellerProfile {
  display_name: string | null;
  rating: number | null;
  avatar_url: string | null;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchListing = async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, description, images, price, location, is_charity, user_id, latitude, longitude, categories(name)")
        .eq("id", id)
        .maybeSingle();

      if (data) {
        setListing(data as ListingDetail);
        // Fetch seller profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, rating, avatar_url")
          .eq("user_id", data.user_id)
          .maybeSingle();
        if (profileData) setSeller(profileData);
      }
      setLoading(false);
    };
    fetchListing();
  }, [id]);

  const handleMessage = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!listing) return;
    if (listing.user_id === user.id) {
      toast({ title: "Это ваше объявление" });
      return;
    }

    // Check existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listing.id)
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .maybeSingle();

    if (existing) {
      navigate("/messages");
      return;
    }

    // Create new conversation
    const { error } = await supabase.from("conversations").insert({
      listing_id: listing.id,
      participant_1: user.id,
      participant_2: listing.user_id,
    });

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      navigate("/messages");
    }
  };

  if (loading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Объявление не найдено</p>
        <Link to="/browse" className="text-primary underline mt-2 inline-block">Вернуться в каталог</Link>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"];

  const sellerInitials = seller?.display_name
    ? seller.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="container max-w-3xl py-6 space-y-6 animate-fade-in">
      <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Назад
      </Link>

      {/* Images */}
      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
          <img src={images[currentImage]} alt={listing.title} className="h-full w-full object-cover" />
          {listing.is_charity && (
            <span className="absolute top-3 left-3 rounded-full bg-charity px-3 py-1 text-sm font-medium text-charity-foreground">
              Благотворительность
            </span>
          )}
          <span className="absolute top-3 right-3 rounded-full bg-card/90 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            {(listing.categories as any)?.name || "Другое"}
          </span>
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-all ${i === currentImage ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold">{listing.title}</h1>
        <p className="text-2xl font-bold text-primary">
          {listing.is_charity ? "Бесплатно" : listing.price ? `${listing.price.toLocaleString()} ₽` : "Договорная"}
        </p>
        {listing.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {listing.location}
          </div>
        )}
      </div>

      <Separator />

      {/* Description */}
      {listing.description && (
        <>
          <div className="space-y-2">
            <h2 className="font-display text-lg font-semibold">Описание</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>
          <Separator />
        </>
      )}

      {/* Map */}
      {listing.latitude && listing.longitude && (
        <>
          <div className="space-y-2">
            <h2 className="font-display text-lg font-semibold">На карте</h2>
            <div className="rounded-xl overflow-hidden border">
              <iframe
                title="listing-map"
                width="100%"
                height="250"
                src={`https://yandex.ru/map-widget/v1/?ll=${listing.longitude},${listing.latitude}&z=14&pt=${listing.longitude},${listing.latitude},pm2rdm`}
                style={{ border: 0 }}
              />
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Seller */}
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{sellerInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-semibold">{seller?.display_name || "Пользователь"}</p>
          <p className="text-xs text-muted-foreground">⭐ {seller?.rating || 0}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="flex-1 h-12 text-base gap-2" onClick={handleMessage}>
          <MessageCircle className="h-5 w-5" /> Написать продавцу
        </Button>
        <Button variant="outline" className="flex-1 h-12 text-base gap-2" onClick={() => !user ? navigate("/auth") : toast({ title: "Предложение обмена отправлено!" })}>
          <ArrowRightLeft className="h-5 w-5" /> Предложить обмен
        </Button>
        <Button variant="outline" size="icon" className="h-12 w-12">
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
