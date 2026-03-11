import { useState, useEffect, useRef } from "react";
import { Phone, ArrowRight, Loader2, KeyRound, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type PhoneStep = "enter" | "verify" | "telegram-waiting";
type AuthMethod = "sms" | "telegram";

export default function AuthPage() {
  const [phone, setPhone] = useState("+7");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("enter");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("sms");
  const [countdown, setCountdown] = useState(0);
  const [telegramLink, setTelegramLink] = useState("");
  const [linkToken, setLinkToken] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  // Poll for Telegram OTP delivery
  useEffect(() => {
    if (phoneStep !== "telegram-waiting" || !linkToken) return;

    pollRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke("check-telegram-otp", {
          body: { link_token: linkToken },
        });
        if (error) return;
        
        if (data?.status === "sent") {
          // Code was sent via Telegram, show OTP input
          setPhoneStep("verify");
          if (data.phone) setPhone(data.phone);
          toast({ title: "Код отправлен в Telegram!" });
        } else if (data?.status === "expired") {
          setPhoneStep("enter");
          toast({ title: "Ссылка устарела. Попробуйте снова.", variant: "destructive" });
        }
      } catch {}
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [phoneStep, linkToken]);

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, "");
    if (!/^\+7\d{10}$/.test(cleaned)) {
      toast({ title: "Введите номер в формате +7XXXXXXXXXX", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (authMethod === "sms") {
        const { data, error } = await supabase.functions.invoke("send-sms-otp", {
          body: { phone: cleaned },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setPhoneStep("verify");
        setCountdown(60);
        toast({ title: "Вам позвонит робот и продиктует код" });
      } else {
        // Telegram flow
        const { data, error } = await supabase.functions.invoke("send-telegram-otp", {
          body: { phone: cleaned },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setTelegramLink(data.telegram_link);
        setLinkToken(data.link_token);
        setPhoneStep("telegram-waiting");
        setCountdown(300); // 5 min timeout
        toast({ title: "Откройте Telegram по ссылке ниже" });
      }
    } catch (err: any) {
      toast({ title: "Ошибка отправки", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || otpCode;
    if (finalCode.length !== 6) {
      toast({ title: "Введите 6-значный код", variant: "destructive" });
      return;
    }

    const cleaned = phone.replace(/\s/g, "");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-sms-otp", {
        body: { phone: cleaned, code: finalCode },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

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

  const handleOtpChange = (value: string) => {
    setOtpCode(value);
    if (value.length === 6) {
      handleVerifyOtp(value);
    }
  };

  const formatPhone = (value: string) => {
    let digits = value.replace(/[^\d+]/g, "");
    if (!digits.startsWith("+7")) digits = "+7";
    if (digits.length > 12) digits = digits.slice(0, 12);
    setPhone(digits);
  };

  const resetFlow = () => {
    setPhoneStep("enter");
    setOtpCode("");
    setTelegramLink("");
    setLinkToken("");
    if (pollRef.current) clearInterval(pollRef.current);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold text-gradient">Всё на Всё</h1>
          <p className="text-muted-foreground">Вход по номеру телефона</p>
        </div>

        <div className="space-y-4">
          {phoneStep === "enter" ? (
            <>
              {/* Auth method toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setAuthMethod("sms")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    authMethod === "sms" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  SMS
                </button>
                <button
                  onClick={() => setAuthMethod("telegram")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    authMethod === "telegram" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Telegram
                </button>
              </div>

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
                {authMethod === "sms" ? "Получить код" : "Войти через Telegram"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {authMethod === "telegram" && (
                <p className="text-xs text-center text-muted-foreground">
                  Код придёт в Telegram-бот. Нужно нажать на ссылку и открыть бота.
                </p>
              )}
            </>
          ) : phoneStep === "telegram-waiting" ? (
            <>
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Откройте Telegram и нажмите кнопку ниже, чтобы получить код:
                </p>
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0088cc] text-white rounded-lg font-medium hover:bg-[#006699] transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  Открыть Telegram
                </a>
                <p className="text-xs text-muted-foreground">
                  Ожидание... Код будет отправлен автоматически после открытия бота.
                  {countdown > 0 && ` (${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')})`}
                </p>
              </div>
              <button
                onClick={resetFlow}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Назад
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-center text-muted-foreground">
                Код отправлен на <span className="font-medium text-foreground">{phone}</span>
                {authMethod === "telegram" && " через Telegram"}
              </p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={handleOtpChange} autoFocus>
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
              <Button className="w-full h-12" onClick={() => handleVerifyOtp()} disabled={loading || otpCode.length !== 6}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Подтвердить
              </Button>
              <div className="flex justify-between items-center">
                <button
                  onClick={resetFlow}
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
      </div>
    </div>
  );
}
