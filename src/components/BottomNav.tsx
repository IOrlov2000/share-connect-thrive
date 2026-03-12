import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, MessageCircle, User, Heart } from "lucide-react";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

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
  const unreadCount = useUnreadMessages();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          const isMessages = to === "/messages";
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] leading-tight truncate max-w-[3.5rem]">{label}</span>
              {isMessages && unreadCount > 0 && (
                <span className="absolute -top-1 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
