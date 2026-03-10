import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";

const myListings = [
  { id: "1", title: "MacBook Pro 2023 — как новый", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop", price: "89 000 ₽", location: "Москва", category: "Электроника" },
  { id: "2", title: "Винтажная кожаная куртка", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop", price: "12 000 ₽", location: "Москва", category: "Одежда" },
];

export default function MyListingsPage() {
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

      {myListings.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {myListings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
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
