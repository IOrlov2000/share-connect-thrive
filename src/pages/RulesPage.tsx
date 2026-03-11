import { Link } from "react-router-dom";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function RulesPage() {
  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold">Правила сервиса</h1>
      </div>

      <section className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
          <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h2 className="font-display text-base font-semibold">Общие положения</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Сервис «Всё на Всё» — площадка для обмена вещами между пользователями. Регистрируясь, вы соглашаетесь с настоящими правилами и обязуетесь их соблюдать.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-display text-base font-semibold">Правила публикации</h2>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1 leading-relaxed">
              <li>• Объявления должны содержать реальные фото и описание вещи</li>
              <li>• Запрещено размещать запрещённые законом товары</li>
              <li>• Запрещена реклама и спам</li>
              <li>• Одна вещь — одно объявление</li>
              <li>• Указывайте реальное местоположение</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
          <Users className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
          <div>
            <h2 className="font-display text-base font-semibold">Правила обмена</h2>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1 leading-relaxed">
              <li>• Обмен происходит по взаимному согласию сторон</li>
              <li>• Встречайтесь в общественных безопасных местах</li>
              <li>• Проверяйте вещи перед обменом</li>
              <li>• Сервис не несёт ответственности за качество обмениваемых вещей</li>
              <li>• Споры решаются между участниками обмена</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <h2 className="font-display text-base font-semibold">Запрещено</h2>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1 leading-relaxed">
              <li>• Мошенничество и обман пользователей</li>
              <li>• Публикация заведомо ложной информации</li>
              <li>• Оскорбления и угрозы в переписке</li>
              <li>• Использование чужих фото и данных</li>
              <li>• Создание дублирующих аккаунтов</li>
            </ul>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Конфиденциальность</h2>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p>Мы собираем минимально необходимые данные: номер телефона для входа, имя и местоположение для объявлений.</p>
          <p>Ваши данные не передаются третьим лицам и используются исключительно для работы сервиса.</p>
          <p>Вы можете удалить свой аккаунт и все связанные данные в настройках профиля.</p>
        </div>
      </section>

      <div className="text-xs text-muted-foreground text-center pt-4">
        Последнее обновление: март 2026
      </div>
    </div>
  );
}
