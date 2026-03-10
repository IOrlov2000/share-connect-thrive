import { useState } from "react";
import { Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function AuthPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold text-gradient">SwapSpot</h1>
          <p className="text-muted-foreground">
            {step === "phone" ? "Enter your phone number to get started" : "Enter the code we sent you"}
          </p>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button className="w-full h-12" onClick={() => setStep("otp")}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6}>
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
            <Button className="w-full h-12">
              Verify & Sign In
            </Button>
            <button
              onClick={() => setStep("phone")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to phone number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
