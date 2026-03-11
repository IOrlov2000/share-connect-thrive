import { useState, useEffect, useRef } from "react";
import { Camera, MapPin, Loader2, X } from "lucide-react";
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

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

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

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ru&limit=5&accept-language=ru`
      );
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    }
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    setLatitude(null);
    setLongitude(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(value), 400);
  };

  const selectSuggestion = (s: AddressSuggestion) => {
    setLocation(s.display_name);
    setLatitude(parseFloat(s.lat));
    setLongitude(parseFloat(s.lon));
    setShowSuggestions(false);
    setSuggestions([]);
    setShowMap(true);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!title.trim()) {
      toast({ title: "Введите название", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    // Compress and upload images in parallel
    const compressImage = async (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ratio = Math.min(maxWidth / img.width, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => resolve(blob || file),
            "image/webp",
            quality
          );
        };
        img.src = URL.createObjectURL(file);
      });
    };

    const uploadPromises = images.map(async (file) => {
      const compressed = await compressImage(file);
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const { error } = await supabase.storage.from("listing-images").upload(path, compressed, {
        contentType: "image/webp",
      });
      if (!error) {
        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
        return urlData.publicUrl;
      }
      return null;
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.filter(Boolean) as string[];

    const { error } = await supabase.from("listings").insert({
      title: title.trim(),
      description: description.trim() || null,
      category_id: categoryId || null,
      price: isCharity ? 0 : price ? Number(price) : null,
      location: location.trim() || null,
      latitude,
      longitude,
      is_charity: isCharity,
      images: imageUrls,
      user_id: user.id,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Объявление опубликовано! ✅" });
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
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
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
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Начните вводить адрес..."
            className="pl-10 h-12"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border bg-popover shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-accent transition-colors flex items-start gap-2"
                  onMouseDown={() => selectSuggestion(s)}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{s.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {latitude && longitude && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setShowMap(!showMap)}
              className="text-sm text-primary hover:underline"
            >
              {showMap ? "Скрыть карту" : "Показать на карте"}
            </button>
            <span className="text-xs text-muted-foreground">
              ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </span>
          </div>
        )}
        {showMap && latitude && longitude && (
          <div className="mt-2 rounded-xl overflow-hidden border">
            <iframe
              title="map-preview"
              width="100%"
              height="250"
              src={`https://yandex.ru/map-widget/v1/?ll=${longitude},${latitude}&z=15&pt=${longitude},${latitude},pm2rdm`}
              className="rounded-xl"
              style={{ border: 0 }}
            />
          </div>
        )}
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
