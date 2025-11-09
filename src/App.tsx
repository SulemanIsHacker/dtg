
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CurrencyProvider } from "@/hooks/useCurrencyConverter";
import { PreloadResources } from "@/components/PreloadResources";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { PersistentCartProvider } from "@/hooks/usePersistentCart";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const ProductTestimonials = lazy(() => import("./pages/ProductTestimonials"));
const WhyUs = lazy(() => import("./pages/WhyUs"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Tools = lazy(() => import("./pages/Tools"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Contact = lazy(() => import("./pages/Contact"));
const SubscriptionManagement = lazy(() => import("./pages/SubscriptionManagement"));
const CheckoutConfirmation = lazy(() => import("./pages/CheckoutConfirmation"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const ReceiptDemo = lazy(() => import("./pages/ReceiptDemo"));
const CheckoutDemo = lazy(() => import("./pages/CheckoutDemo"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const FinanceManagement = lazy(() => import("./pages/FinanceManagement"));

// Import the optimized loading component
import { PageLoader } from "@/components/LoadingSpinner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const location = useLocation();
  
  if (import.meta.env.DEV) {
    console.log('App component rendering, current location:', location.pathname);
  }
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CurrencyProvider>
            <PersistentCartProvider>
              <TooltipProvider>
              <PreloadResources />
              <PerformanceMonitor />
              <AnalyticsTracker />
              <Toaster />
              <Sonner />
              <AnimatePresence mode="wait" initial={false}>
                <Suspense fallback={<PageLoader />}>
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Index />} />
                    <Route path="/tools" element={<Tools />} />
                    <Route path="/testimonials" element={<Testimonials />} />
                    <Route path="/testimonials/:productSlug" element={<ProductTestimonials />} />
                    <Route path="/product/:productSlug" element={<ProductPage />} />
                    <Route path="/why-us" element={<WhyUs />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/sitemap" element={<SitemapPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/subscriptions" element={<SubscriptionManagement />} />
                    <Route path="/checkout-confirmation" element={<CheckoutConfirmation />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/receipt-demo" element={<ReceiptDemo />} />
                    <Route path="/checkout-demo" element={<CheckoutDemo />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/finance" element={<FinanceManagement />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AnimatePresence>
              </TooltipProvider>
            </PersistentCartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
