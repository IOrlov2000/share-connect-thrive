import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const faqItems = [
  { q: "Как создать объявление?", a: "Нажмите кнопку «Создать» в нижнем меню или в навигации. Заполните форму: добавьте фото, название, описание, категорию и цену." },
  { q: "Как предложить обмен?", a: "Откройте интересующее объявление и нажмите «Предложить обмен». Выберите свою вещь для обмена и отправьте предложение." },
  { q: "Как работает благотворительность?", a: "При создании объявления включите переключатель «Пожертвовать». Ваша вещь будет доступна бесплатно для фондов-партнёров." },
  { q: "Как удалить объявление?", a: "Перейдите в «Мои объявления» в профиле, откройте нужное объявление и нажмите «Удалить»." },
  { q: "Безопасно ли обмениваться?", a: "Мы рекомендуем встречаться в общественных местах, проверять вещи перед обменом и использовать внутренний чат для общения." },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="container max-w-lg py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold">Служба поддержки</h1>
      </div>

      {/* FAQ */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Частые вопросы</h2>
        <div className="space-y-2">
          {faqItems.map((item, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                {item.q}
                {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Contact Form */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Написать в поддержку</h2>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Тема обращения</Label>
            <Input placeholder="Кратко опишите проблему" className="h-12" />
          </div>
          <div className="space-y-2">
            <Label>Сообщение</Label>
            <Textarea placeholder="Подробно опишите вашу проблему или вопрос..." rows={4} />
          </div>
          <Button className="w-full h-12 text-base gap-2">
            <Send className="h-4 w-4" /> Отправить
          </Button>
        </div>
      </section>

      <Separator />

      <div className="rounded-xl border bg-accent/50 p-4 text-center space-y-1">
        <MessageCircle className="h-6 w-6 mx-auto text-primary" />
        <p className="text-sm font-medium">Нужна срочная помощь?</p>
        <p className="text-xs text-muted-foreground">Напишите нам в Telegram: @vsenavsesupport</p>
      </div>
    </div>
  );
}
