import { Link, useNavigate } from "react-router-dom";
import { Settings, MapPin, Star, Heart, FileText, ArrowRightLeft, ClipboardList, Headphones, LogOut, Trash2, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const primaryItems = [
  { to: "/profile/listings", icon: FileText, label: "Мои объявления", tone: "primary" as const },
  { to: "/profile/offers", icon: ArrowRightLeft, label: "Мои предложения", tone: "secondary" as const },
  { to: "/profile/favorites", icon: Heart, label: "Избранное", tone: "destructive" as const },
  { to: "/profile/requests", icon: ClipboardList, label: "Мои заявки", tone: "primary" as const },
];

const secondaryItems = [
  { to: "/profile/settings", icon: Settings, label: "Настройки профиля" },
  { to: "/profile/support", icon: Headphones, label: "Служба поддержки" },
];

const toneClasses: Record<string, string> = {
  primary: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  secondary: "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground",
  destructive: "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground",
};

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
    <div className="container max-w-2xl py-6 animate-fade-in">
      <div className="overflow-hidden rounded-[2rem] border bg-card shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.25)]">
        {/* Header with gradient + glow */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 animate-pulse rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/15 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="group relative">
              <div className="absolute inset-0 scale-110 rounded-[2rem] bg-white/30 blur-xl transition-transform duration-500 group-hover:scale-125" />
              <Avatar className="relative h-24 w-24 rounded-[1.75rem] border-4 border-white/30 shadow-2xl">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" className="rounded-[1.5rem]" />}
                <AvatarFallback className="rounded-[1.5rem] bg-white/15 text-2xl font-display font-bold text-white backdrop-blur-md">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 rounded-full bg-card p-1.5 shadow-lg">
                <div className="h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
              </div>
            </div>

            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-white">
              {profile?.display_name || user?.email || "Пользователь"}
            </h1>
            <div className="mt-2 flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
              <span className="text-xs font-semibold text-white">
                {Number(profile?.rating || 0).toFixed(1)}
                {profile?.location ? <> • <MapPin className="-mt-0.5 inline h-3 w-3" /> {profile.location}</> : null}
              </span>
            </div>
          </div>
        </div>

        {/* Stats — overlap onto header */}
        <div className="relative z-20 -mt-8 px-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Объявления", value: listingsCount, to: "/profile/listings", color: "text-primary" },
              { label: "Обмены", value: profile?.trades_count || 0, to: "/profile/offers", color: "text-secondary" },
              { label: "Помощь", value: 0, to: "/charity", color: "text-[hsl(var(--charity))]" },
            ].map((stat) => (
              <Link
                key={stat.label}
                to={stat.to}
                className="group flex flex-col items-center rounded-3xl border border-border bg-card/80 p-4 shadow-xl backdrop-blur-xl transition-colors hover:bg-card"
              >
                <span className={`text-2xl font-black transition-transform group-hover:scale-110 ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-3 p-6">
          <div className="space-y-1">
            {primaryItems.map(({ to, icon: Icon, label, tone }) => (
              <Link
                key={to}
                to={to}
                className="group flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300 hover:bg-muted/60 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-2.5 transition-colors ${toneClasses[tone]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-foreground">{label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-colors group-hover:text-primary" />
              </Link>
            ))}
          </div>

          <div className="mx-4 h-px bg-border" />

          <div className="space-y-1">
            {secondaryItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="group flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300 hover:bg-muted/60"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-muted p-2.5 text-muted-foreground transition-colors group-hover:bg-muted/80">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-foreground">{label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-auto flex flex-col gap-3 p-6 pt-0">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 font-bold text-background shadow-lg transition-transform active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            Выйти из аккаунта
          </button>
          <button className="flex w-full items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest text-destructive/70 transition-colors hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            Удалить профиль
          </button>
        </div>
      </div>
    </div>
  );
}
