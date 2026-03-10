import { Link } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function ProfileSettingsPage() {
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
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-display font-bold">ИП</AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-md hover:bg-primary/90 transition-colors">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">Нажмите для смены фото</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Имя</Label>
          <Input defaultValue="Иван Петров" className="h-12" />
        </div>

        <div className="space-y-2">
          <Label>Телефон</Label>
          <Input defaultValue="+7 (999) 123-45-67" className="h-12" disabled />
          <p className="text-xs text-muted-foreground">Номер телефона нельзя изменить</p>
        </div>

        <div className="space-y-2">
          <Label>Город</Label>
          <Input defaultValue="Москва" className="h-12" />
        </div>

        <div className="space-y-2">
          <Label>О себе</Label>
          <Textarea defaultValue="Люблю обмениваться интересными вещами" rows={3} />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Уведомления</h2>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-border" />
            <span>Новые сообщения</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-border" />
            <span>Предложения обмена</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded border-border" />
            <span>Новости и акции</span>
          </label>
        </div>
      </div>

      <Button className="w-full h-12 text-base">Сохранить изменения</Button>
    </div>
  );
}
