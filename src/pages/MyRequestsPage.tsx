import { Link } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const requests = [
  {
    id: "1",
    listing: "MacBook Pro 2023 — как новый",
    seller: "Анна М.",
    status: "pending" as const,
    date: "10 мар 2026",
    message: "Здравствуйте, хочу обменять на мой iPhone 15 Pro",
  },
  {
    id: "2",
    listing: "Горный велосипед Trek",
    seller: "Алексей В.",
    status: "accepted" as const,
    date: "9 мар 2026",
    message: "Готов обменять на Nintendo Switch + доплата",
  },
  {
    id: "3",
    listing: "Кресло в стиле mid-century",
    seller: "Мария Л.",
    status: "rejected" as const,
    date: "7 мар 2026",
    message: "Предлагаю обменять на офисное кресло",
  },
];

const statusConfig = {
  pending: { label: "На рассмотрении", icon: Clock, variant: "outline" as const, color: "text-muted-foreground" },
  accepted: { label: "Одобрена", icon: CheckCircle2, variant: "default" as const, color: "text-primary" },
  rejected: { label: "Отклонена", icon: XCircle, variant: "destructive" as const, color: "text-destructive" },
};

export default function MyRequestsPage() {
  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold">Мои заявки</h1>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((req) => {
            const config = statusConfig[req.status];
            const StatusIcon = config.icon;
            return (
              <div key={req.id} className="rounded-xl border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{req.listing}</h3>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{req.message}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Продавец: {req.seller}</span>
                  <span>{req.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <p>У вас пока нет заявок</p>
          <Link to="/browse" className="text-primary underline mt-2 inline-block">Перейти в каталог</Link>
        </div>
      )}
    </div>
  );
}
