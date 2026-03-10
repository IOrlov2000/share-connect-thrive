import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ListingCard from "@/components/ListingCard";

const allListings = [
  { id: "1", title: "MacBook Pro 2023 — как новый", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop", price: "89 000 ₽", location: "Москва", category: "Электроника" },
  { id: "2", title: "Винтажная кожаная куртка", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop", price: "12 000 ₽", location: "Москва", category: "Одежда" },
  { id: "3", title: "Кресло в стиле mid-century", image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop", price: "25 000 ₽", location: "Санкт-Петербург", category: "Мебель" },
  { id: "4", title: "Горный велосипед Trek", image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=400&fit=crop", price: "45 000 ₽", location: "Казань", category: "Спорт" },
  { id: "5", title: "Nintendo Switch комплект", image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop", price: "20 000 ₽", location: "Новосибирск", category: "Игры" },
  { id: "6", title: "Антикварная настольная лампа", image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop", price: "4 500 ₽", location: "Екатеринбург", category: "Мебель" },
  { id: "7", title: "Кроссовки Nike Air", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", price: "6 500 ₽", location: "Москва", category: "Одежда" },
  { id: "8", title: "Камера Canon EOS R6", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop", price: "120 000 ₽", location: "Москва", category: "Электроника" },
];

const categories = ["Все", "Электроника", "Одежда", "Мебель", "Спорт", "Игры", "Книги", "Детское", "Инструменты"];

export default function BrowsePage() {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [search, setSearch] = useState("");

  const filtered = allListings.filter((l) => {
    const matchesCategory = activeCategory === "Все" || l.category === activeCategory;
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold">Каталог объявлений</h1>

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
        {categories.map((cat) => (
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

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          Ничего не найдено
        </div>
      )}
    </div>
  );
}
