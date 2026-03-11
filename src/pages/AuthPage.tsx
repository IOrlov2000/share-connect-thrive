import { useState } from "react";
import { Mail, ArrowRight, Loader2, Phone, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type AuthMode = "email" | "phone";
type PhoneStep = "enter" | "verify";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("+7");
  const [otpCode, setOtpCode] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("phone");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("enter");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailAuth = async () => {
    if (!email.trim()) {
      toast({ title: "Введите email", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Пароль должен быть не менее 6 символов", variant: "destructive" });
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (error) {
        toast({ title: "Ошибка регистрации", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Добро пожаловать!" });
        navigate("/", { replace: true });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (error) {
        toast({ title: "Неверный email или пароль", variant: "destructive" });
      } else {
        navigate("/", { replace: true });
      }
    }
  };

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, "");
    if (!/^\+7\d{10}$/.test(cleaned)) {
      toast({ title: "Введите номер в формате +7XXXXXXXXXX", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-sms-otp", {
        body: { phone: cleaned },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPhoneStep("verify");
      setCountdown(60);
      toast({ title: "Код отправлен на " + cleaned });
    } catch (err: any) {
      toast({ title: "Ошибка отправки SMS", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast({ title: "Введите 6-значный код", variant: "destructive" });
      return;
    }

    const cleaned = phone.replace(/\s/g, "");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-sms-otp", {
        body: { phone: cleaned, code: otpCode },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Sign in with the returned credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) throw signInError;

      toast({ title: "Добро пожаловать!" });
      navigate("/", { replace: true });
    } catch (err: any) {
      toast({ title: "Ошибка верификации", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    // Keep only digits and +
    let digits = value.replace(/[^\d+]/g, "");
    if (!digits.startsWith("+7")) digits = "+7";
    if (digits.length > 12) digits = digits.slice(0, 12);
    setPhone(digits);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold text-gradient">Всё на Всё</h1>
          <p className="text-muted-foreground">
            {authMode === "phone" ? "Вход по номеру телефона" : (isSignUp ? "Создайте аккаунт" : "Войдите в аккаунт")}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => { setAuthMode("phone"); setPhoneStep("enter"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              authMode === "phone" ? "bg-background shadow text-foreground" : "text-muted-foreground"
            }`}
          >
            <Phone className="h-4 w-4" /> Телефон
          </button>
          <button
            onClick={() => setAuthMode("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              authMode === "email" ? "bg-background shadow text-foreground" : "text-muted-foreground"
            }`}
          >
            <Mail className="h-4 w-4" /> Email
          </button>
        </div>

        {authMode === "phone" ? (
          <div className="space-y-4">
            {phoneStep === "enter" ? (
              <>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+7 999 123 45 67"
                    value={phone}
                    onChange={(e) => formatPhone(e.target.value)}
                    className="pl-10 h-12 text-lg tracking-wider"
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  />
                </div>
                <Button className="w-full h-12" onClick={handleSendOtp} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Получить код <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-center text-muted-foreground">
                  Код отправлен на <span className="font-medium text-foreground">{phone}</span>
                </p>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button className="w-full h-12" onClick={handleVerifyOtp} disabled={loading || otpCode.length !== 6}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                  Подтвердить
                </Button>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => { setPhoneStep("enter"); setOtpCode(""); }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Изменить номер
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={countdown > 0 || loading}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {countdown > 0 ? `Повторно через ${countdown}с` : "Отправить снова"}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Input
              type="password"
              placeholder="Пароль (мин. 6 символов)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
            />
            <Button className="w-full h-12" onClick={handleEmailAuth} disabled={loading}>
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
        )}
      </div>
    </div>
  );
}
