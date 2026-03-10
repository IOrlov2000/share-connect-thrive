import { useState } from "react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function AuthPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast({ title: "Введите email", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setLoading(false);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Код отправлен", description: "Проверьте вашу почту" });
      setStep("otp");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast({ title: "Введите 6-значный код", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: "email",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Неверный код", description: error.message, variant: "destructive" });
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold text-gradient">Всё на Всё</h1>
          <p className="text-muted-foreground">
            {step === "email" ? "Введите email для входа" : "Введите код, который мы отправили на " + email}
          </p>
        </div>

        {step === "email" ? (
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              />
            </div>
            <Button className="w-full h-12" onClick={handleSendOtp} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Отправить код <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
            <Button className="w-full h-12" onClick={handleVerifyOtp} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Подтвердить и войти
            </Button>
            <button
              onClick={() => { setStep("email"); setOtp(""); }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Назад к email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
