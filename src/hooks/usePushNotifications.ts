import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !Capacitor.isNativePlatform()) return;

    const setupPush = async () => {
      try {
        const permResult = await PushNotifications.requestPermissions();
        if (permResult.receive !== "granted") return;

        await PushNotifications.register();

        PushNotifications.addListener("registration", async (token) => {
          // Save push token to profile for server-side sending
          await supabase
            .from("profiles")
            .update({ push_token: token.value } as any)
            .eq("user_id", user.id);
        });

        PushNotifications.addListener("registrationError", (err) => {
          console.error("Push registration error:", err);
        });

        PushNotifications.addListener("pushNotificationReceived", (notification) => {
          console.log("Push received:", notification);
        });

        PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
          // Navigate to messages when tapping notification
          if (notification.notification.data?.type === "message") {
            window.location.href = "/messages";
          }
        });
      } catch (err) {
        console.error("Push setup error:", err);
      }
    };

    setupPush();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user]);
}
