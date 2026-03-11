import { useState, useEffect, useRef } from "react";
import { Search, Laptop, Shirt, Sofa, Bike, BookOpen, Gamepad2, Baby, Wrench, Loader2, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";
import CategoryCard from "@/components/CategoryCard";
import YandexMap from "@/components/YandexMap";
import { supabase } from "@/integrations/supabase/client";


const categoryIcons = [
  { name: "Электроника", icon: Laptop },
  { name: "Одежда", icon: Shirt },
  { name: "Мебель", icon: Sofa },
  { name: "Спорт", icon: Bike },
  { name: "Книги", icon: BookOpen },
  { name: "Игры", icon: Gamepad2 },
  { name: "Детское", icon: Baby },
  { name: "Инструменты", icon: Wrench },
];

interface DBListing {
  id: string;
  title: string;
  images: string[] | null;
  price: number | null;
  location: string | null;
  is_charity: boolean | null;
  latitude: number | null;
  longitude: number | null;
  categories: { name: string } | null;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<DBListing[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<DBListing[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: listingsData } = await supabase
        .from("listings")
        .select("id, title, images, price, location, is_charity, latitude, longitude, categories(name)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(8);

      if (listingsData) setListings(listingsData as DBListing[]);

      const { data: allListings } = await supabase
        .from("listings")
        .select("category_id, categories(name), latitude, longitude")
        .eq("status", "active");

      if (allListings) {
        const counts: Record<string, number> = {};
        allListings.forEach((l: any) => {
          const name = l.categories?.name;
          if (name) counts[name] = (counts[name] || 0) + 1;
        });
        setCategoryCounts(counts);
      }
    };
    fetchData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("listings")
        .select("id, title, images, price, location, is_charity, categories(name)")
        .eq("status", "active")
        .ilike("title", `%${value.trim()}%`)
        .order("created_at", { ascending: false })
        .limit(6);

      setSearchResults((data as DBListing[]) || []);
      setShowResults(true);
      setSearching(false);
    }, 300);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim()) {
      setShowResults(false);
      navigate(`/browse?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="container px-4 py-6 space-y-8">
      {/* Hero */}
      <section
        className="relative text-center space-y-4 py-10 sm:py-16 animate-fade-in rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent"
      >
        <div className="relative z-10 space-y-4 px-4">
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold leading-tight">
          <span className="inline-block animate-[fade-in_0.6s_ease-out_0.1s_both]">Обменивайся на</span>{" "}
          <span className="text-gradient inline-block animate-[fade-in_0.8s_ease-out_0.4s_both] hover:scale-105 transition-transform duration-300 cursor-default">Всё на Всё</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-lg max-w-xl mx-auto">
          Обменивай вещи, находи выгодные предложения или помогай нуждающимся.
        </p>
        <div className="relative max-w-md mx-auto" ref={searchContainerRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
          <Input
            placeholder="Поиск объявлений..."
            className="pl-10 h-12 rounded-full"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onKeyDown={handleSearchSubmit}
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-30 mt-2 w-full rounded-xl border bg-popover shadow-xl max-h-80 overflow-y-auto">
              {searchResults.map((item) => (
                <Link
                  key={item.id}
                  to={`/listing/${item.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                  onClick={() => setShowResults(false)}
                >
                  <img
                    src={item.images?.[0] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&h=80&fit=crop"}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.is_charity ? "Бесплатно" : item.price ? `${item.price.toLocaleString()} ₽` : "Договорная"}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
              <Link
                to={`/browse?search=${encodeURIComponent(search)}`}
                className="block px-4 py-3 text-sm text-primary font-medium hover:bg-accent transition-colors text-center border-t"
                onClick={() => setShowResults(false)}
              >
                Показать все результаты →
              </Link>
            </div>
          )}
          {showResults && search.trim().length >= 2 && searchResults.length === 0 && !searching && (
            <div className="absolute z-30 mt-2 w-full rounded-xl border bg-popover shadow-xl p-4 text-center text-sm text-muted-foreground">
              Ничего не найдено по запросу «{search}»
            </div>
          )}
        </div>
        </div>
      </section>

      {/* Map - right after hero */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Объявления на карте
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setMapExpanded(!mapExpanded)}
          >
            {mapExpanded ? (
              <>Свернуть <ChevronUp className="ml-1 h-4 w-4" /></>
            ) : (
              <>Открыть карту <ChevronDown className="ml-1 h-4 w-4" /></>
            )}
          </Button>
        </div>
        <div className={`transition-all duration-300 overflow-hidden ${mapExpanded ? "max-h-[600px]" : "max-h-[200px]"}`}>
          <YandexMap
            listings={listings
              .filter((l) => l.latitude && l.longitude)
              .map((l) => ({
                id: l.id,
                title: l.title,
                latitude: l.latitude!,
                longitude: l.longitude!,
                price: l.price,
                is_charity: l.is_charity || false,
                image: l.images?.[0],
              }))}
            className={mapExpanded ? "!h-[580px]" : "!h-[200px]"}
          />
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Категории</h2>
        <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
          {categoryIcons.map((cat) => (
            <CategoryCard
              key={cat.name}
              name={cat.name}
              icon={cat.icon}
              count={categoryCounts[cat.name] || 0}
              color="bg-accent text-accent-foreground"
            />
          ))}
        </div>
      </section>

      {/* Listings from DB */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Последние объявления</h2>
          <Link to="/browse" className="text-sm text-primary font-medium hover:underline">Смотреть все →</Link>
        </div>
        {listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                image={listing.images?.[0] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop"}
                price={listing.is_charity ? "Бесплатно" : listing.price ? `${listing.price.toLocaleString()} ₽` : "Договорная"}
                location={listing.location || "Не указано"}
                category={(listing.categories as any)?.name || "Другое"}
                isCharity={listing.is_charity || false}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            Пока нет объявлений. <Link to="/create" className="text-primary hover:underline">Создайте первое!</Link>
          </div>
        )}
      </section>
    </div>
  );
}
