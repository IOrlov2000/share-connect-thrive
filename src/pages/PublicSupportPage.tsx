import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Send, Loader2, ChevronDown, ChevronUp, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const generalFaq = [
  { q: "Сервис бесплатный?", a: "Да, регистрация и публикация объявлений полностью бесплатны." },
  { q: "Как быстро отвечает поддержка?", a: "Мы стараемся отвечать в течение 24 часов в рабочие дни." },
  { q: "Можно ли использовать без регистрации?", a: "Вы можете просматривать объявления без регистрации, но для создания объявлений, обмена и переписки нужна авторизация." },
  { q: "В каких городах работает сервис?", a: "Сервис работает по всей России. Вы можете обмениваться вещами в любом городе." },
  { q: "Есть мобильное приложение?", a: "Сейчас сервис доступен через мобильный браузер. Мобильное приложение в разработке." },
];

export default function PublicSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error("Заполните все поля");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Введите корректный email");
      return;
    }
    setSending(true);
    // Simulate sending — in production would call an edge function
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Сообщение отправлено! Мы ответим на ваш email.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setSending(false);
  };

  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold">Служба поддержки</h1>
      </div>

      {/* General FAQ */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Общие вопросы</h2>
        <div className="space-y-2">
          {generalFaq.map((item, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                {item.q}
                {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
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
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Написать нам</h2>
        </div>
        <p className="text-sm text-muted-foreground">Ваш вопрос будет отправлен на нашу почту. Мы ответим в течение 24 часов.</p>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ваше имя</Label>
              <Input placeholder="Иван" className="h-12" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ваш email</Label>
              <Input placeholder="ivan@mail.ru" className="h-12" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Тема обращения</Label>
            <Input placeholder="Кратко опишите проблему" className="h-12" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Сообщение</Label>
            <Textarea placeholder="Подробно опишите вашу проблему или вопрос..." rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button className="w-full h-12 text-base gap-2" onClick={handleSubmit} disabled={sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Отправить
          </Button>
        </div>
      </section>

      <Separator />

      <div className="rounded-xl border bg-accent/50 p-4 text-center space-y-2">
        <MessageCircle className="h-6 w-6 mx-auto text-primary" />
        <p className="text-sm font-medium">Нужна срочная помощь?</p>
        <p className="text-xs text-muted-foreground">Напишите нам в Telegram: <a href="https://t.me/vsenavsesupport" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@vsenavsesupport</a></p>
        <p className="text-xs text-muted-foreground">Или позвоните: <span className="font-medium text-foreground">+7 (925) 0909231</span></p>
      </div>
    </div>
  );
}
