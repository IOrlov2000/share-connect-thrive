import { useState, useEffect } from "react";
import { Search, Laptop, Shirt, Sofa, Bike, BookOpen, Gamepad2, Baby, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import ListingCard from "@/components/ListingCard";
import CategoryCard from "@/components/CategoryCard";
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
  categories: { name: string } | null;
}

export default function HomePage() {
  const [listings, setListings] = useState<DBListing[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: listingsData } = await supabase
        .from("listings")
        .select("id, title, images, price, location, is_charity, categories(name)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(8);

      if (listingsData) setListings(listingsData as DBListing[]);

      // Get category counts
      const { data: allListings } = await supabase
        .from("listings")
        .select("category_id, categories(name)")
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

  return (
    <div className="container py-6 space-y-8">
      {/* Hero */}
      <section className="text-center space-y-4 py-8 animate-fade-in">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          Обменивайся на <span className="text-gradient">Всё на Всё</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Обменивай вещи, находи выгодные предложения или помогай нуждающимся.
        </p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск рядом с вами..." className="pl-10 h-12 rounded-full" />
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
