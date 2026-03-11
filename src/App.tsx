import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";

// Lazy-loaded pages for faster initial load
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const BrowsePage = lazy(() => import("@/pages/BrowsePage"));
const CreateListingPage = lazy(() => import("@/pages/CreateListingPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const CharityPage = lazy(() => import("@/pages/CharityPage"));
const ListingDetailPage = lazy(() => import("@/pages/ListingDetailPage"));
const MyListingsPage = lazy(() => import("@/pages/MyListingsPage"));
const MyOffersPage = lazy(() => import("@/pages/MyOffersPage"));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage"));
const MyRequestsPage = lazy(() => import("@/pages/MyRequestsPage"));
const ProfileSettingsPage = lazy(() => import("@/pages/ProfileSettingsPage"));
const SupportPage = lazy(() => import("@/pages/SupportPage"));
const UserProfilePage = lazy(() => import("@/pages/UserProfilePage"));
const RulesPage = lazy(() => import("@/pages/RulesPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const PublicSupportPage = lazy(() => import("@/pages/PublicSupportPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/rules" element={<RulesPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/support" element={<PublicSupportPage />} />
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
                <Route path="/user/:userId" element={<UserProfilePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
