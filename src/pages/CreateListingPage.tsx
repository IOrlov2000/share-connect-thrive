import { useState, useEffect } from "react";
import { Camera, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
}

export default function CreateListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCharity, setIsCharity] = useState(searchParams.get("charity") === "true");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("categories").select("id, name").order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast({ title: "Максимум 5 фото", variant: "destructive" });
      return;
    }
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);
    setPreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!title.trim()) {
      toast({ title: "Введите название", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    // Upload images
    const imageUrls: string[] = [];
    for (const file of images) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("listing-images").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }
    }

    const { error } = await supabase.from("listings").insert({
      title: title.trim(),
      description: description.trim() || null,
      category_id: categoryId || null,
      price: isCharity ? 0 : price ? Number(price) : null,
      location: location.trim() || null,
      is_charity: isCharity,
      images: imageUrls,
      user_id: user.id,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Объявление опубликовано!" });
      navigate("/profile/listings");
    }
  };

  return (
    <div className="container max-w-lg py-6 space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold">Создать объявление</h1>

      <div className="space-y-2">
        <Label>Фотографии (до 5)</Label>
        <div className="grid grid-cols-3 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl border">
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
          {previews.length < 5 && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-accent">
              <Camera className="h-6 w-6 text-muted-foreground" />
              <span className="mt-1 text-xs text-muted-foreground">Добавить</span>
              <input type="file" accept="image/*" className="hidden" multiple onChange={handleImageChange} />
            </label>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Название</Label>
        <Input placeholder="Что вы предлагаете?" className="h-12" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Описание</Label>
        <Textarea placeholder="Опишите предмет, состояние и детали..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Категория</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Цена (₽)</Label>
        <Input type="number" placeholder="0" className="h-12" disabled={isCharity} value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Местоположение</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Введите ваш город" className="pl-10 h-12" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border bg-charity/5 p-4">
        <div className="space-y-0.5">
          <Label className="text-sm font-semibold">Пожертвовать</Label>
          <p className="text-xs text-muted-foreground">Объявление будет бесплатным для фондов</p>
        </div>
        <Switch checked={isCharity} onCheckedChange={setIsCharity} />
      </div>

      <Button className="w-full h-12 text-base" onClick={handleSubmit} disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Опубликовать
      </Button>
    </div>
  );
}
