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
          </div>

          {/* О сервисе */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">О сервисе</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
                  Правила сервиса
                </Link>
              </li>
            </ul>
          </div>

          {/* Помощь */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Помощь</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/charity" className="text-muted-foreground hover:text-foreground transition-colors">
                  Помощь риелторов
                </Link>
              </li>
              <li>
                <Link to="/profile/support" className="text-muted-foreground hover:text-foreground transition-colors">
                  Вопрос - Ответ
                </Link>
              </li>
              <li>
                <Link to="/profile/support" className="text-muted-foreground hover:text-foreground transition-colors">
                  Служба поддержки
                </Link>
              </li>
            </ul>
          </div>

          {/* Политика */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Политика сайта</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Пользовательское соглашение
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
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
