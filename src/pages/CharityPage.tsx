import { useState, useEffect } from "react";
import { Heart, Building2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ListingCard, { ListingCardSkeleton } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface CharityListing {
  id: string;
  title: string;
  images: string[] | null;
  price: number | null;
  location: string | null;
  is_charity: boolean | null;
  categories: { name: string } | null;
}

interface Foundation {
  id: string;
  name: string;
  description: string | null;
  items_received: number | null;
  logo_url: string | null;
}

export default function CharityPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<CharityListing[]>([]);
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [listingsRes, foundationsRes] = await Promise.all([
        supabase
          .from("listings")
          .select("id, title, images, price, location, is_charity, categories(name)")
          .eq("is_charity", true)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase.from("foundations").select("*").order("items_received", { ascending: false }),
      ]);
      if (listingsRes.data) setListings(listingsRes.data as CharityListing[]);
      if (foundationsRes.data) setFoundations(foundationsRes.data);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleDonate = () => {
    navigate("/create?charity=true");
  };

  return (
    <div className="container py-6 space-y-8 animate-fade-in">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-charity/10 to-primary/10 p-8 text-center">
        <Heart className="mx-auto h-12 w-12 text-charity mb-4" />
        <h1 className="font-display text-3xl font-bold">Помогите вашему сообществу</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Пожертвуйте вещи в местные фонды и помогите нуждающимся. Каждая вещь имеет значение.
        </p>
        <Button className="mt-4 bg-charity hover:bg-charity/90 text-charity-foreground" onClick={handleDonate}>
          Пожертвовать вещь
        </Button>
      </section>

      {foundations.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Фонды-партнёры
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {foundations.map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-xl border bg-card p-4 cursor-pointer hover:shadow-md transition-all">
                {f.logo_url ? (
                  <img src={f.logo_url} alt={f.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="text-3xl">🤝</span>
                )}
                <div>
                  <p className="font-semibold text-sm">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.items_received || 0} вещей получено</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Доступные пожертвования</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                image={listing.images?.[0] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop"}
                price="Бесплатно"
                location={listing.location || "Не указано"}
                category={(listing.categories as any)?.name || "Другое"}
                isCharity={true}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>Пока нет благотворительных объявлений</p>
            <Button className="mt-4" variant="outline" onClick={handleDonate}>
              Стать первым — пожертвовать вещь
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
