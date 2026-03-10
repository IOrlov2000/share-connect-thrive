import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MyListing {
  id: string;
  title: string;
  images: string[] | null;
  price: number | null;
  location: string | null;
  is_charity: boolean | null;
  status: string;
  categories: { name: string } | null;
}

export default function MyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchListings = async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, images, price, location, is_charity, status, categories(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setListings(data as MyListing[]);
      setLoading(false);
    };
    fetchListings();
  }, [user]);

  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold flex-1">Мои объявления</h1>
        <Link to="/create">
          <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Создать</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {listings.map((listing) => (
            <div key={listing.id} className="relative">
              {listing.status === "active" && (
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                  <CheckCircle2 className="h-3 w-3" />
                  Опубликовано
                </div>
              )}
              <ListingCard
                id={listing.id}
                title={listing.title}
                image={listing.images?.[0] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop"}
                price={listing.is_charity ? "Бесплатно" : listing.price ? `${listing.price.toLocaleString()} ₽` : "Договорная"}
                location={listing.location || "Не указано"}
                category={(listing.categories as any)?.name || "Другое"}
                isCharity={listing.is_charity || false}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <p>У вас пока нет объявлений</p>
          <Link to="/create">
            <Button className="mt-4">Создать первое объявление</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
