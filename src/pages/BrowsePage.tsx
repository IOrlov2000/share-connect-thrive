import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Map as MapIcon, Grid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";
import ListingsMap from "@/components/ListingsMap";
import { supabase } from "@/integrations/supabase/client";

interface Listing {
  id: string;
  title: string;
  images: string[] | null;
  price: number | null;
  location: string | null;
  is_charity: boolean | null;
  latitude: number | null;
  longitude: number | null;
  category_id: string | null;
  category_name?: string;
}

const categoryLabels = ["Все", "Электроника", "Одежда", "Мебель", "Спорт", "Игры", "Книги", "Детское", "Инструменты"];

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const searchFromUrl = searchParams.get("search") || "";
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl || "Все");
  const [search, setSearch] = useState(searchFromUrl);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (categoryFromUrl) setActiveCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    if (searchFromUrl) setSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, images, price, location, is_charity, latitude, longitude, category_id, categories(name)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (data) {
        setListings(
          data.map((l: any) => ({
            ...l,
            category_name: l.categories?.name || "",
          }))
        );
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

  const filtered = listings.filter((l) => {
    const matchesCategory = activeCategory === "Все" || l.category_name === activeCategory;
    const matchesSearch = !search.trim() || l.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const mapListings = filtered
    .filter((l) => l.latitude && l.longitude)
    .map((l) => ({ id: l.id, title: l.title, latitude: l.latitude!, longitude: l.longitude!, price: l.price }));

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Каталог объявлений</h1>
        <Button variant="outline" size="sm" onClick={() => setShowMap(!showMap)}>
          {showMap ? <Grid className="h-4 w-4 mr-1" /> : <MapIcon className="h-4 w-4 mr-1" />}
          {showMap ? "Список" : "Карта"}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск..."
          className="pl-10 h-12 rounded-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categoryLabels.map((cat) => (
          <Badge
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap px-4 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {showMap && <ListingsMap listings={mapListings} className="h-[400px]" />}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              image={listing.images?.[0] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop"}
              price={listing.price ? `${listing.price.toLocaleString()} ₽` : "Бесплатно"}
              location={listing.location || "Не указано"}
              category={listing.category_name || "Другое"}
              isCharity={listing.is_charity || false}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground">Ничего не найдено</div>
      )}
    </div>
  );
}
