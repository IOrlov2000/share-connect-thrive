import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const offers = [
  {
    id: "1",
    myItem: "MacBook Pro 2023",
    theirItem: "iPhone 15 Pro + 20 000 ₽",
    partner: "Анна М.",
    status: "pending" as const,
    date: "10 мар 2026",
  },
  {
    id: "2",
    myItem: "Винтажная кожаная куртка",
    theirItem: "Кроссовки Nike Air + Рюкзак",
    partner: "Дмитрий К.",
    status: "accepted" as const,
    date: "9 мар 2026",
  },
  {
    id: "3",
    myItem: "Горный велосипед Trek",
    theirItem: "Nintendo Switch + 15 000 ₽",
    partner: "Мария Л.",
    status: "rejected" as const,
    date: "8 мар 2026",
  },
];

const statusMap = {
  pending: { label: "Ожидает", variant: "outline" as const },
  accepted: { label: "Принято", variant: "default" as const },
  rejected: { label: "Отклонено", variant: "destructive" as const },
};

export default function MyOffersPage() {
  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold">Мои предложения</h1>
      </div>

      {offers.length > 0 ? (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {offer.partner.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold">{offer.partner}</span>
                </div>
                <Badge variant={statusMap[offer.status].variant}>
                  {statusMap[offer.status].label}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex-1 rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Вы отдаёте</p>
                  <p className="font-medium mt-0.5">{offer.myItem}</p>
                </div>
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Вы получаете</p>
                  <p className="font-medium mt-0.5">{offer.theirItem}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{offer.date}</span>
                {offer.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Отменить</Button>
                    <Button size="sm">Написать</Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <p>У вас пока нет предложений обмена</p>
        </div>
      )}
    </div>
  );
}
