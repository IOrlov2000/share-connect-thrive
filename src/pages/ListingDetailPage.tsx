import { useParams, Link } from "react-router-dom";
import { Heart, ArrowRightLeft, MessageCircle, MapPin, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Mock data — will be replaced with DB fetch
const allListings: Record<string, { title: string; image: string; price: string; location: string; category: string; description: string; seller: string; sellerRating: number; isCharity?: boolean }> = {
  "1": { title: "MacBook Pro 2023 — как новый", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop", price: "89 000 ₽", location: "Москва", category: "Электроника", description: "MacBook Pro 14\" M2 Pro, 16 ГБ ОЗУ, 512 ГБ SSD. Использовал всего 3 месяца. Полный комплект: коробка, зарядка, документы. Состояние идеальное, без царапин и потёртостей.", seller: "Анна М.", sellerRating: 4.9 },
  "2": { title: "Винтажная кожаная куртка", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop", price: "12 000 ₽", location: "Москва", category: "Одежда", description: "Настоящая кожаная куртка в винтажном стиле. Размер M. Мягкая кожа, отличное состояние. Подойдёт для повседневной носки.", seller: "Дмитрий К.", sellerRating: 4.7 },
  "3": { title: "Кресло в стиле mid-century", image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop", price: "25 000 ₽", location: "Санкт-Петербург", category: "Мебель", description: "Стильное кресло середины века. Деревянные ножки, мягкая обивка. Идеальное состояние.", seller: "Мария Л.", sellerRating: 4.8 },
  "4": { title: "Горный велосипед Trek", image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&h=600&fit=crop", price: "45 000 ₽", location: "Казань", category: "Спорт", description: "Trek Marlin 7, рама L, 29 колёса. Проехал всего 500 км. Полное ТО пройдено.", seller: "Алексей В.", sellerRating: 4.6 },
  "5": { title: "Nintendo Switch комплект", image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&h=600&fit=crop", price: "20 000 ₽", location: "Новосибирск", category: "Игры", description: "Nintendo Switch OLED + 3 игры (Zelda, Mario Kart, Animal Crossing). Два джойкона, зарядная станция.", seller: "Иван П.", sellerRating: 4.5 },
  "6": { title: "Коллекция детских книг", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop", price: "Бесплатно", location: "Екатеринбург", category: "Книги", description: "Более 30 книг для детей 3-7 лет. Русские и зарубежные авторы. Хорошее состояние.", seller: "Ольга С.", sellerRating: 5.0, isCharity: true },
  "7": { title: "Кроссовки Nike Air", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop", price: "6 500 ₽", location: "Москва", category: "Одежда", description: "Nike Air Max 90, размер 42. Носил пару раз, практически новые.", seller: "Дмитрий К.", sellerRating: 4.7 },
  "8": { title: "Камера Canon EOS R6", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop", price: "120 000 ₽", location: "Москва", category: "Электроника", description: "Canon EOS R6 Mark II, полный кадр, 24.2 МП. Пробег 5000 кадров. В комплекте объектив RF 24-105mm f/4.", seller: "Анна М.", sellerRating: 4.9 },
  "c1": { title: "Коллекция детских книг", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop", price: "Бесплатно", location: "Екатеринбург", category: "Книги", description: "Более 30 книг для детей 3-7 лет.", seller: "Ольга С.", sellerRating: 5.0, isCharity: true },
  "c2": { title: "Детская одежда (0-12 мес)", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop", price: "Бесплатно", location: "Москва", category: "Детское", description: "Пакет детской одежды на возраст 0-12 месяцев. Всё в хорошем состоянии.", seller: "Мария Л.", sellerRating: 4.8, isCharity: true },
  "c3": { title: "Зимние куртки (разные размеры)", image: "https://images.unsplash.com/photo-1544923246-77307dd270cb?w=800&h=600&fit=crop", price: "Бесплатно", location: "Москва", category: "Одежда", description: "5 зимних курток разных размеров. Хорошее состояние.", seller: "Алексей В.", sellerRating: 4.6, isCharity: true },
  "c4": { title: "Офисный стол и стул", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=600&fit=crop", price: "Бесплатно", location: "Санкт-Петербург", category: "Мебель", description: "Офисный стол 120x60 см и кресло. Подходит для удалённой работы.", seller: "Иван П.", sellerRating: 4.5, isCharity: true },
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const listing = id ? allListings[id] : null;

  if (!listing) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Объявление не найдено</p>
        <Link to="/browse" className="text-primary underline mt-2 inline-block">Вернуться в каталог</Link>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-6 space-y-6 animate-fade-in">
      {/* Back */}
      <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Назад
      </Link>

      {/* Image */}
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
        <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
        {listing.isCharity && (
          <span className="absolute top-3 left-3 rounded-full bg-charity px-3 py-1 text-sm font-medium text-charity-foreground">
            Благотворительность
          </span>
        )}
        <span className="absolute top-3 right-3 rounded-full bg-card/90 px-3 py-1 text-sm font-medium backdrop-blur-sm">
          {listing.category}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold">{listing.title}</h1>
        <p className="text-2xl font-bold text-primary">{listing.price}</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> {listing.location}
        </div>
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-2">
        <h2 className="font-display text-lg font-semibold">Описание</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
      </div>

      <Separator />

      {/* Seller */}
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{listing.seller.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-semibold">{listing.seller}</p>
          <p className="text-xs text-muted-foreground">⭐ {listing.sellerRating}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="flex-1 h-12 text-base gap-2">
          <ArrowRightLeft className="h-5 w-5" /> Предложить обмен
        </Button>
        <Button variant="outline" className="flex-1 h-12 text-base gap-2">
          <MessageCircle className="h-5 w-5" /> Написать
        </Button>
        <Button variant="outline" size="icon" className="h-12 w-12">
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" className="h-12 w-12">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
