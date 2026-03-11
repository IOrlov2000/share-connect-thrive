import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";

interface Profile {
  display_name: string | null;
  location: string | null;
  bio: string | null;
  phone: string | null;
  avatar_url: string | null;
}

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, location, bio, phone, avatar_url")
      .eq("user_id", user.id).maybeSingle().then(({ data }) => {
        if (data) {
          setProfile(data);
          setName(data.display_name || "");
          setLocation(data.location || "");
          setBio(data.bio || "");
        }
        setLoading(false);
      });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Файл слишком большой (макс. 2 МБ)", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
    setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev);
    setUploading(false);
    toast({ title: "Фото обновлено ✅" });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: name.trim() || null,
      location: location.trim() || null,
      bio: bio.trim() || null,
    }).eq("user_id", user.id);

    if (error) {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } else {
      toast({ title: "Профиль обновлён ✅" });
    }
    setSaving(false);
  };

  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-lg py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold">Настройки профиля</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar className="h-24 w-24">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" />}
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-display font-bold">{initials}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <p className="text-sm text-muted-foreground">Нажмите для смены фото</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Имя</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
        </div>

        <div className="space-y-2">
          <Label>Телефон</Label>
          <Input value={profile?.phone ? `+${profile.phone}` : ""} className="h-12" disabled />
          <p className="text-xs text-muted-foreground">Номер телефона нельзя изменить</p>
        </div>

        <div className="space-y-2">
          <Label>Город</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-12" />
        </div>

        <div className="space-y-2">
          <Label>О себе</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
        </div>
      </div>

      <Separator />

      <Button className="w-full h-12 text-base" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Сохранить изменения
      </Button>
    </div>
  );
}
