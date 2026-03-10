import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, MessageCircle, User, Heart } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Главная" },
  { to: "/browse", icon: Search, label: "Каталог" },
  { to: "/create", icon: PlusCircle, label: "Создать" },
  { to: "/charity", icon: Heart, label: "Помощь" },
  { to: "/messages", icon: MessageCircle, label: "Чат" },
  { to: "/profile", icon: User, label: "Профиль" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
