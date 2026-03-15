import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
// import { AdminCreator } from "@/components/AdminCreator"; // Temporarily disabled
import { OnboardingCheck } from "@/components/OnboardingCheck";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import NotFound from "./pages/NotFound";
import FindSitters from "./pages/FindSitters";
import FindSittersSuburb from "./pages/FindSittersSuburb";
import BecomeSitter from "./pages/BecomeSitter";
import BecomeSitterSuburb from "./pages/BecomeSitterSuburb";
import YoungWalkers from "./pages/YoungWalkers";
import FindYoungWalkers from "./pages/FindYoungWalkers";
import YoungWalkerRegistration from "./pages/YoungWalkerRegistration";
import YoungWalkerSearch from "./pages/YoungWalkerSearch";
import BookYoungWalker from "./pages/BookYoungWalker";
import YoungWalkerDashboard from "./pages/YoungWalkerDashboard";
import HowItWorks from "./pages/HowItWorks";
import Profile from "./pages/Profile";
import Bookings from "./pages/Bookings";
import BookingDetails from "./pages/BookingDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminPayouts from "./pages/AdminPayouts";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetails from "./pages/AdminUserDetails";
import AdminDocumentReview from "./pages/AdminDocumentReview";
import AdminInviteUnverifiedSitters from "./pages/AdminInviteUnverifiedSitters";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DailyReports from "./pages/DailyReports";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Security from "./pages/Security";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DailyReportsInfo from "./pages/DailyReportsInfo";
import SitterProfile from "./pages/SitterProfile";
import BookingSuccess from "./pages/BookingSuccess";
import Onboarding from "./pages/Onboarding";
import OnboardingComplete from "./pages/OnboardingComplete";
import OnboardingPendingApproval from "./pages/OnboardingPendingApproval";
import CreateAdmin from "./pages/CreateAdmin";
import EmailThankYou from "./pages/EmailThankYou";
import { QuickPetOwnerWizard } from "./components/onboarding/QuickPetOwnerWizard";

import FAQ from "./pages/FAQ";
import Error500 from "./pages/Error500";
import ComprehensiveTestSuite from "./components/testing/ComprehensiveTestSuite";
import PaymentTests from "./pages/PaymentTests";
import AdminPaymentFix from "./pages/AdminPaymentFix";
import AdminFixBrokenBookings from "./pages/AdminFixBrokenBookings";
import PaymentFlowTestsPage from "./pages/PaymentFlowTests";
import PaymentFlowComprehensiveTestPage from "./pages/PaymentFlowComprehensiveTest";
import TestEmails from "./pages/TestEmails";
import TestDailyReportEmail from "./pages/TestDailyReportEmail";
import StripeOnboardingTests from "./pages/StripeOnboardingTests";
import ManualServiceCreator from "./pages/ManualServiceCreator";
import TermsAcceptanceTestPage from "./pages/TermsAcceptanceTest";
import SitterServiceTests from "./pages/SitterServiceTests";
import PayoutAutomationTests from "./pages/PayoutAutomationTests";
import SendTestEmail from "./pages/SendTestEmail";
import AdminStripeReset from "./pages/AdminStripeReset";
import ChristmasLanding from "./pages/ChristmasLanding";
// Black Friday removed - sale ended
import AdminDocumentFix from "./pages/AdminDocumentFix";
import AdminEmailManagement from "./pages/AdminEmailManagement";
import AdminLayout from "./pages/AdminLayout";
import AdminPromoCodeManagement from "./pages/AdminPromoCodeManagement";
import AdminSearchAnalytics from "./pages/AdminSearchAnalytics";
import AdminSitterRecruitment from "./pages/AdminSitterRecruitment";
import AdminSitterLeads from "./pages/AdminSitterLeads";
import AdminMarketingInsights from "./pages/AdminMarketingInsights";
import AdminConversionFunnel from "./pages/AdminConversionFunnel";
import AdminUserBehavior from "./pages/AdminUserBehavior";
import AdminSitterDemandGap from "./pages/AdminSitterDemandGap";
import AdminBookingInsights from "./pages/AdminBookingInsights";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Calendar from "./pages/Calendar";
import GoldenBadgeTests from "./pages/GoldenBadgeTests";
import CalendarTests from "./pages/CalendarTests";
import Areas from "./pages/Areas";
import Messages from "./pages/Messages";
import AucklandPetSitters from "./pages/AucklandPetSitters";
import AdminStorageOptimizer from "./pages/AdminStorageOptimizer";
import AdminSitterVetting from "./pages/AdminSitterVetting";
import AdminVetClinics from "./pages/AdminVetClinics";
import AdminKPIDashboard from "./pages/AdminKPIDashboard";
// SunshineCoastSeniorPets merged into PetSittingSunshineCoast
import PetSittingAuckland from "./pages/PetSittingAuckland";
import PetSittingWellington from "./pages/PetSittingWellington";
import PetSittingChristchurch from "./pages/PetSittingChristchurch";
import PetSittingHamilton from "./pages/PetSittingHamilton";
import PetSittingTauranga from "./pages/PetSittingTauranga";
import PetSittingDunedin from "./pages/PetSittingDunedin";
import PetSittingSunshineCoast from "./pages/PetSittingSunshineCoast";
import PetSittingNapier from "./pages/PetSittingNapier";
import PetSittingNelson from "./pages/PetSittingNelson";
import PetSittingNewPlymouth from "./pages/PetSittingNewPlymouth";
import PetSittingPalmerstonNorth from "./pages/PetSittingPalmerstonNorth";
import PetSittingQueenstown from "./pages/PetSittingQueenstown";
import PetSittingRotorua from "./pages/PetSittingRotorua";
import PetSittingWhangarei from "./pages/PetSittingWhangarei";
import PetSittingHastings from "./pages/PetSittingHastings";
import Referral from "./pages/Referral";
import Guarantee from "./pages/Guarantee";
import OurSitters from "./pages/OurSitters";
import PetCareTips from "./pages/PetCareTips";
import SitterFAQ from "./pages/SitterFAQ";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (user) {
    // Respect redirect param so users return to where they came from (e.g. sitter profile)
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    return <Navigate to={redirect || "/welcome"} replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  return (
    <ProfileProvider>
      <OnboardingCheck>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/find-sitters" element={<FindSitters />} />
            <Route path="/find-sitters/:suburb" element={<FindSittersSuburb />} />
            <Route path="/sitter/:id" element={<SitterProfile />} />
            <Route path="/become-sitter" element={<BecomeSitter />} />
            <Route path="/become-sitter/:suburb" element={<BecomeSitterSuburb />} />
            <Route path="/areas" element={<Areas />} />
            <Route path="/pet-sitters-auckland" element={<AucklandPetSitters />} />
            <Route path="/auckland" element={<AucklandPetSitters />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/sitter-faq" element={<SitterFAQ />} />
            
            {/* Young Walker Routes */}
            <Route path="/young-walkers" element={<YoungWalkers />} />
            <Route path="/find-young-walkers" element={<FindYoungWalkers />} />
            <Route path="/young-walker-registration" element={<ProtectedRoute><YoungWalkerRegistration /></ProtectedRoute>} />
            <Route path="/search-young-walkers" element={<YoungWalkerSearch />} />
            <Route path="/book-young-walker/:id" element={<BookYoungWalker />} />
            <Route path="/young-walker-dashboard" element={<ProtectedRoute><YoungWalkerDashboard /></ProtectedRoute>} />
            
            {/* Auth Route - Public only */}
            <Route 
              path="/auth" 
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } 
            />
            
            {/* Onboarding Route */}
            <Route 
              path="/onboarding" 
              element={
                <OnboardingRoute>
                  <Onboarding />
                </OnboardingRoute>
              } 
            />
            
                <Route path="/onboarding-complete" element={<OnboardingComplete />} />
                <Route path="/onboarding-pending-approval" element={<OnboardingPendingApproval />} />
                <Route path="/email-thank-you" element={<EmailThankYou />} />
                <Route path="/create-admin" element={<CreateAdmin />} />
                <Route 
                  path="/quick-setup" 
                  element={
                    <ProtectedRoute>
                      <QuickPetOwnerWizard />
                    </ProtectedRoute>
                  } 
                />
            
            {/* Protected Routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bookings" 
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              } 
             />
             <Route 
               path="/booking/:id" 
               element={
                 <ProtectedRoute>
                   <BookingDetails />
                 </ProtectedRoute>
               } 
             />
             <Route
               path="/calendar" 
               element={
                 <ProtectedRoute>
                   <Calendar />
                 </ProtectedRoute>
               } 
             />
             <Route
               path="/messages" 
               element={
                 <ProtectedRoute>
                   <Messages />
                 </ProtectedRoute>
               } 
             />
             <Route
               path="/daily-reports"
               element={
                 <ProtectedRoute>
                   <DailyReports />
                 </ProtectedRoute>
               } 
             />
            {/* Admin Routes - Wrapped in AdminLayout with Sidebar */}
            <Route element={<AdminLayout />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/payouts" element={<AdminPayouts />} />
              <Route path="/admin/documents" element={<AdminDocumentReview />} />
              <Route path="/admin/invite-unverified-sitters" element={<AdminInviteUnverifiedSitters />} />
              <Route path="/admin/user/:id" element={<AdminUserDetails />} />
              <Route path="/admin/email-management" element={<AdminEmailManagement />} />
              <Route path="/admin/promo-codes" element={<AdminPromoCodeManagement />} />
              <Route path="/admin/search-analytics" element={<AdminSearchAnalytics />} />
              <Route path="/admin/sitter-recruitment" element={<AdminSitterRecruitment />} />
              <Route path="/admin/sitter-leads" element={<AdminSitterLeads />} />
              <Route path="/admin/marketing-insights" element={<AdminMarketingInsights />} />
              <Route path="/admin/conversion-funnel" element={<AdminConversionFunnel />} />
              <Route path="/admin/user-behavior" element={<AdminUserBehavior />} />
              <Route path="/admin/demand-gap" element={<AdminSitterDemandGap />} />
              <Route path="/admin/booking-insights" element={<AdminBookingInsights />} />
              <Route path="/admin/document-fix" element={<AdminDocumentFix />} />
              <Route path="/admin/stripe-reset" element={<AdminStripeReset />} />
              <Route path="/admin/payment-fix" element={<AdminPaymentFix />} />
              <Route path="/admin/fix-broken-bookings" element={<AdminFixBrokenBookings />} />
              <Route path="/admin/storage-optimizer" element={<AdminStorageOptimizer />} />
              <Route path="/admin/sitter-vetting" element={<AdminSitterVetting />} />
              <Route path="/admin/vet-clinics" element={<AdminVetClinics />} />
              <Route path="/admin/kpis" element={<AdminKPIDashboard />} />
              {/* Test pages - admin only */}
              <Route path="/test-pricing" element={<ComprehensiveTestSuite />} />
              <Route path="/test-payment" element={<PaymentTests />} />
              <Route path="/test-payment-flow" element={<PaymentFlowTestsPage />} />
              <Route path="/test-payment-comprehensive" element={<PaymentFlowComprehensiveTestPage />} />
              <Route path="/test-terms-acceptance" element={<TermsAcceptanceTestPage />} />
              <Route path="/test-emails" element={<TestEmails />} />
              <Route path="/send-test-email" element={<SendTestEmail />} />
              <Route path="/test-daily-report-email" element={<TestDailyReportEmail />} />
              <Route path="/stripe-onboarding-tests" element={<StripeOnboardingTests />} />
              <Route path="/sitter-service-tests" element={<SitterServiceTests />} />
              <Route path="/manual-service-creator" element={<ManualServiceCreator />} />
              <Route path="/test-payout-automation" element={<PayoutAutomationTests />} />
              <Route path="/test-golden-badge" element={<GoldenBadgeTests />} />
              <Route path="/test-calendar" element={<CalendarTests />} />
            </Route>
            <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
            
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/security" element={<Security />} />
            <Route path="/safety" element={<Security />} />
            <Route path="/help" element={<Contact />} />
            <Route path="/cookies" element={<PrivacyPolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/pet-sitting-auckland" element={<PetSittingAuckland />} />
            <Route path="/pet-sitting-wellington" element={<PetSittingWellington />} />
            <Route path="/pet-sitting-christchurch" element={<PetSittingChristchurch />} />
            <Route path="/pet-sitting-hamilton" element={<PetSittingHamilton />} />
            <Route path="/pet-sitting-tauranga" element={<PetSittingTauranga />} />
            <Route path="/pet-sitting-dunedin" element={<PetSittingDunedin />} />
            <Route path="/pet-sitting-sunshine-coast" element={<PetSittingSunshineCoast />} />
            <Route path="/sunshine-coast" element={<Navigate to="/pet-sitting-sunshine-coast" replace />} />
            <Route path="/pet-sitting-napier" element={<PetSittingNapier />} />
            <Route path="/pet-sitting-nelson" element={<PetSittingNelson />} />
            <Route path="/pet-sitting-new-plymouth" element={<PetSittingNewPlymouth />} />
            <Route path="/pet-sitting-palmerston-north" element={<PetSittingPalmerstonNorth />} />
            <Route path="/pet-sitting-queenstown" element={<PetSittingQueenstown />} />
            <Route path="/pet-sitting-rotorua" element={<PetSittingRotorua />} />
            <Route path="/pet-sitting-whangarei" element={<PetSittingWhangarei />} />
            <Route path="/pet-sitting-hastings" element={<PetSittingHastings />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/guarantee" element={<Guarantee />} />
            <Route path="/our-sitters" element={<OurSitters />} />
            <Route path="/pet-care-tips" element={<PetCareTips />} />
            <Route path="/become-sitter/:suburb" element={<BecomeSitterSuburb />} />
            <Route path="/500" element={<Error500 />} />
            {/* Test routes moved inside AdminLayout below */}
            {/* test-calendar moved inside AdminLayout */}
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/daily-reports-info" element={<DailyReportsInfo />} />
            <Route path="/christmas" element={<ChristmasLanding />} />
            {/* Black Friday route removed - sale ended */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </OnboardingCheck>
    </ProfileProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* <AdminCreator /> Temporarily disabled to fix welcome page issue */}
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ScrollToTop />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
