import { Link } from "react-router-dom";
import { Settings, MapPin, Star, Package, Heart, FileText, ArrowRightLeft, ClipboardList, Headphones, LogOut, Trash2, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { to: "/profile/listings", icon: FileText, label: "Мои объявления" },
  { to: "/profile/offers", icon: ArrowRightLeft, label: "Мои предложения" },
  { to: "/profile/favorites", icon: Heart, label: "Избранное" },
  { to: "/profile/requests", icon: ClipboardList, label: "Мои заявки" },
  { to: "/profile/settings", icon: Settings, label: "Настройки профиля" },
  { to: "/profile/support", icon: Headphones, label: "Служба поддержки" },
];

export default function ProfilePage() {
  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-display font-bold">ИП</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">Иван Петров</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> Москва
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-secondary text-secondary" /> 4.8</span>
            <span className="text-sm text-muted-foreground">• 23 обмена</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Объявления", value: "12" },
          { label: "Обмены", value: "8" },
          { label: "Пожертвования", value: "3" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold font-display">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Menu Items */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {menuItems.map(({ to, icon: Icon, label }, index) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50"
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {index < menuItems.length - 1 && <Separator className="absolute bottom-0 left-4 right-4" />}
          </Link>
        ))}
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <button className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 text-left">
          <LogOut className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Выйти из аккаунта</span>
        </button>
        <Separator />
        <button className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-destructive/10 text-left">
          <Trash2 className="h-5 w-5 text-destructive" />
          <span className="flex-1 text-sm font-medium text-destructive">Удалить аккаунт</span>
        </button>
      </div>
    </div>
  );
}
