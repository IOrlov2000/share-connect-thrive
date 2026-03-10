import { useState } from "react";
import { Phone, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function AuthPage() {
  const [phone, setPhone] = useState("+7");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const formatPhone = (value: string) => {
    // Keep only digits and leading +
    let cleaned = value.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
    return cleaned;
  };

  const handleAuth = async () => {
    const trimmedPhone = phone.trim();
    if (trimmedPhone.length < 11) {
      toast({ title: "Введите корректный номер телефона", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Пароль должен быть не менее 6 символов", variant: "destructive" });
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        phone: trimmedPhone,
        password,
      });
      setLoading(false);
      if (error) {
        if (error.message.includes("already registered")) {
          toast({ title: "Этот номер уже зарегистрирован", description: "Попробуйте войти", variant: "destructive" });
        } else {
          toast({ title: "Ошибка регистрации", description: error.message, variant: "destructive" });
        }
      } else {
        toast({ title: "Добро пожаловать!" });
        navigate("/", { replace: true });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        phone: trimmedPhone,
        password,
      });
      setLoading(false);
      if (error) {
        if (error.message.includes("Invalid login")) {
          toast({ title: "Неверный номер или пароль", variant: "destructive" });
        } else {
          toast({ title: "Ошибка входа", description: error.message, variant: "destructive" });
        }
      } else {
        navigate("/", { replace: true });
      }
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold text-gradient">Всё на Всё</h1>
          <p className="text-muted-foreground">
            {isSignUp ? "Создайте аккаунт" : "Войдите в аккаунт"}
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="+7 999 123 45 67"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="pl-10 h-12"
            />
          </div>
          <Input
            type="password"
            placeholder="Пароль (мин. 6 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
          />
          <Button className="w-full h-12" onClick={handleAuth} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSignUp ? "Зарегистрироваться" : "Войти"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
          </button>
        </div>
      </div>
    </div>
  );
}
