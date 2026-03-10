import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import BrowsePage from "@/pages/BrowsePage";
import CreateListingPage from "@/pages/CreateListingPage";
import MessagesPage from "@/pages/MessagesPage";
import ProfilePage from "@/pages/ProfilePage";
import CharityPage from "@/pages/CharityPage";
import ListingDetailPage from "@/pages/ListingDetailPage";
import MyListingsPage from "@/pages/MyListingsPage";
import MyOffersPage from "@/pages/MyOffersPage";
import FavoritesPage from "@/pages/FavoritesPage";
import MyRequestsPage from "@/pages/MyRequestsPage";
import ProfileSettingsPage from "@/pages/ProfileSettingsPage";
import SupportPage from "@/pages/SupportPage";
import UserProfilePage from "@/pages/UserProfilePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/create" element={<RequireAuth><CreateListingPage /></RequireAuth>} />
              <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
              <Route path="/profile/listings" element={<RequireAuth><MyListingsPage /></RequireAuth>} />
              <Route path="/profile/offers" element={<RequireAuth><MyOffersPage /></RequireAuth>} />
              <Route path="/profile/favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
              <Route path="/profile/requests" element={<RequireAuth><MyRequestsPage /></RequireAuth>} />
              <Route path="/profile/settings" element={<RequireAuth><ProfileSettingsPage /></RequireAuth>} />
              <Route path="/profile/support" element={<RequireAuth><SupportPage /></RequireAuth>} />
              <Route path="/charity" element={<CharityPage />} />
              <Route path="/listing/:id" element={<ListingDetailPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
