import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
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
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/create" element={<CreateListingPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/listings" element={<MyListingsPage />} />
            <Route path="/profile/offers" element={<MyOffersPage />} />
            <Route path="/profile/favorites" element={<FavoritesPage />} />
            <Route path="/profile/requests" element={<MyRequestsPage />} />
            <Route path="/profile/settings" element={<ProfileSettingsPage />} />
            <Route path="/profile/support" element={<SupportPage />} />
            <Route path="/charity" element={<CharityPage />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
