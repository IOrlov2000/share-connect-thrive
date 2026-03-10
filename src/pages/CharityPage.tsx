import { Heart, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";

const charityListings = [
  { id: "c1", title: "Коллекция детских книг", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop", price: "Бесплатно", location: "Екатеринбург", category: "Книги", isCharity: true },
  { id: "c2", title: "Детская одежда (0-12 мес)", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop", price: "Бесплатно", location: "Москва", category: "Детское", isCharity: true },
  { id: "c3", title: "Зимние куртки (разные размеры)", image: "https://images.unsplash.com/photo-1544923246-77307dd270cb?w=400&h=400&fit=crop", price: "Бесплатно", location: "Москва", category: "Одежда", isCharity: true },
  { id: "c4", title: "Офисный стол и стул", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop", price: "Бесплатно", location: "Санкт-Петербург", category: "Мебель", isCharity: true },
];

const foundations = [
  { name: "Фонд «Помощь рядом»", items: 156, icon: "🤝" },
  { name: "Фонд «Дети прежде всего»", items: 89, icon: "👶" },
  { name: "Центр помощи сообществу", items: 234, icon: "🏘️" },
];

export default function CharityPage() {
  return (
    <div className="container py-6 space-y-8 animate-fade-in">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-charity/10 to-primary/10 p-8 text-center">
        <Heart className="mx-auto h-12 w-12 text-charity mb-4" />
        <h1 className="font-display text-3xl font-bold">Помогите вашему сообществу</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Пожертвуйте вещи в местные фонды и помогите нуждающимся. Каждая вещь имеет значение.
        </p>
        <Button className="mt-4 bg-charity hover:bg-charity/90 text-charity-foreground">
          Пожертвовать вещь
        </Button>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" /> Фонды-партнёры
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {foundations.map((f) => (
            <div key={f.name} className="flex items-center gap-3 rounded-xl border bg-card p-4 cursor-pointer hover:shadow-md transition-all">
              <span className="text-3xl">{f.icon}</span>
              <div>
                <p className="font-semibold text-sm">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.items} вещей получено</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Доступные пожертвования</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {charityListings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
