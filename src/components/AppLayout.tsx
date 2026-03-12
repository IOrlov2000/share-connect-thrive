import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import DesktopNav from "./DesktopNav";
import Footer from "./Footer";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DesktopNav />
      <main className="flex-1 pb-24 md:pb-0" style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}>{children}</main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
