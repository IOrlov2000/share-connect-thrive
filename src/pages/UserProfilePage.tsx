import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, ArrowLeft, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  display_name: string | null;
  location: string | null;
  rating: number | null;
  trades_count: number | null;
  avatar_url: string | null;
  bio: string | null;
}

interface Listing {
  id: string;
  title: string;
  images: string[] | null;
  price: number | null;
  is_charity: boolean | null;
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const [{ data: p }, { data: l }] = await Promise.all([
        supabase.from("profiles").select("display_name, location, rating, trades_count, avatar_url, bio").eq("user_id", userId).maybeSingle(),
        supabase.from("listings").select("id, title, images, price, is_charity").eq("user_id", userId).eq("status", "active").order("created_at", { ascending: false }),
      ]);
      if (p) setProfile(p);
      setListings(l || []);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Пользователь не найден</p>
        <Link to="/" className="text-primary underline mt-2 inline-block">На главную</Link>
      </div>
    );
  }

  const initials = profile.display_name
    ? profile.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <Link to="/messages" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Назад
      </Link>

      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-display font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">{profile.display_name || "Пользователь"}</h1>
          {profile.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {profile.location}
            </div>
          )}
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-secondary text-secondary" /> {profile.rating || 0}
            </span>
            <span className="text-sm text-muted-foreground">• {profile.trades_count || 0} обменов</span>
          </div>
        </div>
      </div>

      {profile.bio && (
        <p className="text-sm text-muted-foreground">{profile.bio}</p>
      )}

      <div>
        <h2 className="font-display text-lg font-semibold mb-3">Объявления</h2>
        {listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет активных объявлений</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {listings.map((l) => (
              <Link key={l.id} to={`/listing/${l.id}`} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={l.images?.[0] || "/placeholder.svg"}
                    alt={l.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium truncate">{l.title}</p>
                  <p className="text-sm font-bold text-primary">
                    {l.is_charity ? "Бесплатно" : l.price ? `${l.price.toLocaleString()} ₽` : "Договорная"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
