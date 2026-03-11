import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, MessageCircle, User, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

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

  return (
    <header className="sticky top-0 z-50 hidden border-b bg-card/80 backdrop-blur-md md:block">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-2xl font-bold text-gradient">
          Всё на Всё
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
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
