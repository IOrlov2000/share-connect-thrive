import { Link, useNavigate } from "react-router-dom";
import { Settings, MapPin, Star, Package, Heart, FileText, ArrowRightLeft, ClipboardList, Headphones, LogOut, Trash2, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const menuItems = [
  { to: "/profile/listings", icon: FileText, label: "Мои объявления" },
  { to: "/profile/offers", icon: ArrowRightLeft, label: "Мои предложения" },
  { to: "/profile/favorites", icon: Heart, label: "Избранное" },
  { to: "/profile/requests", icon: ClipboardList, label: "Мои заявки" },
  { to: "/profile/settings", icon: Settings, label: "Настройки профиля" },
  { to: "/profile/support", icon: Headphones, label: "Служба поддержки" },
];

interface Profile {
  display_name: string | null;
  location: string | null;
  rating: number | null;
  trades_count: number | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listingsCount, setListingsCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile(data);
    });
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("user_id", user.id).then(({ count }) => {
      setListingsCount(count || 0);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast({ title: "Вы вышли из аккаунта" });
  };

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-display font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">{profile?.display_name || user?.email || "Пользователь"}</h1>
          {profile?.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {profile.location}
            </div>
          )}
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-secondary text-secondary" /> {profile?.rating || 0}
            </span>
            <span className="text-sm text-muted-foreground">• {profile?.trades_count || 0} обменов</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Объявления", value: String(listingsCount), to: "/profile/listings" },
          { label: "Обмены", value: String(profile?.trades_count || 0), to: "/profile/offers" },
          { label: "Пожертвования", value: "0", to: "/charity" },
        ].map((stat) => (
          <Link key={stat.label} to={stat.to} className="rounded-xl border bg-card p-4 text-center hover:shadow-md transition-all hover:-translate-y-0.5">
            <p className="text-2xl font-bold font-display">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {menuItems.map(({ to, icon: Icon, label }, index) => (
          <Link key={to} to={to} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 text-left">
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
