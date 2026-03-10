import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ListingCard from "@/components/ListingCard";

const favoriteListings = [
  { id: "3", title: "Кресло в стиле mid-century", image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop", price: "25 000 ₽", location: "Санкт-Петербург", category: "Мебель" },
  { id: "5", title: "Nintendo Switch комплект", image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop", price: "20 000 ₽", location: "Новосибирск", category: "Игры" },
  { id: "8", title: "Камера Canon EOS R6", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop", price: "120 000 ₽", location: "Москва", category: "Электроника" },
];

export default function FavoritesPage() {
  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold">Избранное</h1>
      </div>

      {favoriteListings.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {favoriteListings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <p>В избранном пока ничего нет</p>
          <Link to="/browse" className="text-primary underline mt-2 inline-block">Перейти в каталог</Link>
        </div>
      )}
    </div>
  );
}
