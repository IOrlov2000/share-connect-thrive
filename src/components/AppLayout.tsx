import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import DesktopNav from "./DesktopNav";
import Footer from "./Footer";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AppLayout({ children }: { children: ReactNode }) {
  usePushNotifications();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DesktopNav />
      <main
        className="flex-1"
        style={isMobile ? { paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' } : undefined}
      >
        {children}
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
