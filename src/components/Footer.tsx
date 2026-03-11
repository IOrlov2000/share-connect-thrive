import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Введите корректный email");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-subscription-email", {
        body: { email: email.trim() },
      });
      if (error) throw error;
      toast.success("Вы успешно подписались!");
      setEmail("");
    } catch {
      toast.error("Ошибка при подписке. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t bg-card mt-8">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-3">
            <Link to="/" className="font-display text-xl font-bold text-gradient">
              ВСЁ НА ВСЁ
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Платформа для обмена вещами, выгодных сделок и благотворительности.
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-3 pt-1">
              <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200" aria-label="ВКонтакте">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.523-2.049-1.727-1.033-1.033-1.49-1.172-1.744-1.172-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.335-3.202C4.624 10.857 4 8.756 4 8.316c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.847 2.49 2.27 4.674 2.862 4.674.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .644.271.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.78 1.202 1.253.745.847 1.32 1.558 1.473 2.049.17.474-.085.72-.576.72z"/></svg>
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200" aria-label="Telegram">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.504-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              <a href="https://rutube.ru" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200" aria-label="Rutube">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.2 16H8.4V8h6.8c1.326 0 2.4 1.074 2.4 2.4 0 1.025-.644 1.9-1.55 2.24L18 16h-2.5l-1.7-3H10.8v3H8.4V8h6.8zm0-5.6H10.8v2h4.4c.552 0 1-.448 1-1s-.448-1-1-1z"/></svg>
              </a>
            </div>
          </div>

          {/* О сервисе */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">О сервисе</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/rules" className="text-muted-foreground hover:text-foreground transition-colors">
                  Правила сервиса
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
                  Каталог
                </Link>
              </li>
              <li>
                <Link to="/charity" className="text-muted-foreground hover:text-foreground transition-colors">
                  Благотворительность
                </Link>
              </li>
            </ul>
          </div>

          {/* Помощь */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Помощь</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  Вопрос — Ответ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                  Служба поддержки
                </Link>
              </li>
            </ul>
          </div>

          {/* Политика */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Политика</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/rules" className="text-muted-foreground hover:text-foreground transition-colors">
                  Пользовательское соглашение
                </Link>
              </li>
              <li>
                <Link to="/rules" className="text-muted-foreground hover:text-foreground transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты + подписка */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Контакты</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">+7 (925) 0909231</p>
              <p>пн-пт: 09:00–18:00</p>
            </div>
            <div className="pt-2 space-y-2">
              <p className="text-xs text-muted-foreground">
                Присылать мне советы, обновления и спецпредложения.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Ваш email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                />
                <Button
                  size="sm"
                  className="shrink-0 h-9 px-3"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Всё на Всё. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
