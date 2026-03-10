import { useState } from "react";
import { Camera, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const categories = ["Электроника", "Одежда", "Мебель", "Спорт", "Книги", "Игры", "Детское", "Инструменты", "Другое"];

export default function CreateListingPage() {
  const [isCharity, setIsCharity] = useState(false);

  return (
    <div className="container max-w-lg py-6 space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold">Создать объявление</h1>

      <div className="space-y-2">
        <Label>Фотографии</Label>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <label
              key={i}
              className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-accent"
            >
              <Camera className="h-6 w-6 text-muted-foreground" />
              <span className="mt-1 text-xs text-muted-foreground">Добавить</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Название</Label>
        <Input placeholder="Что вы предлагаете?" className="h-12" />
      </div>

      <div className="space-y-2">
        <Label>Описание</Label>
        <Textarea placeholder="Опишите предмет, состояние и детали..." rows={4} />
      </div>

      <div className="space-y-2">
        <Label>Категория</Label>
        <Select>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Цена (₽)</Label>
        <Input type="number" placeholder="0" className="h-12" disabled={isCharity} />
      </div>

      <div className="space-y-2">
        <Label>Местоположение</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Введите ваш город" className="pl-10 h-12" />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border bg-charity/5 p-4">
        <div className="space-y-0.5">
          <Label className="text-sm font-semibold">Пожертвовать</Label>
          <p className="text-xs text-muted-foreground">Объявление будет бесплатным для фондов</p>
        </div>
        <Switch checked={isCharity} onCheckedChange={setIsCharity} />
      </div>

      <Button className="w-full h-12 text-base">Опубликовать</Button>
    </div>
  );
}
