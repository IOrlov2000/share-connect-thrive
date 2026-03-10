import { Search, Laptop, Shirt, Sofa, Bike, BookOpen, Gamepad2, Baby, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import ListingCard from "@/components/ListingCard";
import CategoryCard from "@/components/CategoryCard";

const categories = [
  { name: "Электроника", icon: Laptop, count: 234, color: "bg-accent text-accent-foreground" },
  { name: "Одежда", icon: Shirt, count: 189, color: "bg-accent text-accent-foreground" },
  { name: "Мебель", icon: Sofa, count: 97, color: "bg-accent text-accent-foreground" },
  { name: "Спорт", icon: Bike, count: 156, color: "bg-accent text-accent-foreground" },
  { name: "Книги", icon: BookOpen, count: 312, color: "bg-accent text-accent-foreground" },
  { name: "Игры", icon: Gamepad2, count: 78, color: "bg-accent text-accent-foreground" },
  { name: "Детское", icon: Baby, count: 145, color: "bg-accent text-accent-foreground" },
  { name: "Инструменты", icon: Wrench, count: 63, color: "bg-accent text-accent-foreground" },
];

const featuredListings = [
  { id: "1", title: "MacBook Pro 2023 — как новый", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop", price: "89 000 ₽", location: "Москва", category: "Электроника" },
  { id: "2", title: "Винтажная кожаная куртка", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop", price: "12 000 ₽", location: "Москва", category: "Одежда" },
  { id: "3", title: "Кресло в стиле mid-century", image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop", price: "25 000 ₽", location: "Санкт-Петербург", category: "Мебель" },
  { id: "4", title: "Горный велосипед Trek", image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=400&fit=crop", price: "45 000 ₽", location: "Казань", category: "Спорт" },
  { id: "5", title: "Nintendo Switch комплект", image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop", price: "20 000 ₽", location: "Новосибирск", category: "Игры" },
  { id: "6", title: "Коллекция детских книг", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop", price: "Бесплатно", location: "Екатеринбург", category: "Книги", isCharity: true },
];

export default function HomePage() {
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
          {categories.map((cat) => (
            <CategoryCard key={cat.name} {...cat} />
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Популярные объявления</h2>
          <Link to="/browse" className="text-sm text-primary font-medium hover:underline">Смотреть все →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
