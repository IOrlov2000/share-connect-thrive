import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, MessageCircle, User, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const navItems = [
  { to: "/", icon: Home, label: "Главная" },
  { to: "/browse", icon: Search, label: "Каталог" },
  { to: "/create", icon: PlusCircle, label: "Создать" },
  { to: "/charity", icon: Heart, label: "Благотворительность" },
  { to: "/messages", icon: MessageCircle, label: "Сообщения" },
  { to: "/profile", icon: User, label: "Профиль" },
];

export default function DesktopNav() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const unreadCount = useUnreadMessages();

  return (
    <header className="sticky top-0 z-50 hidden border-b bg-card/80 backdrop-blur-md md:block">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex flex-col">
          <span className="font-display text-2xl font-bold text-gradient leading-none">Всё на Всё</span>
          <span className="text-[10px] text-muted-foreground tracking-wider uppercase">сервис обмена</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            const isMessages = to === "/messages";
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {isMessages && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        {user ? (
          <Button size="sm" variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Выйти
          </Button>
        ) : (
          <Link to="/auth">
            <Button size="sm">Войти</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
