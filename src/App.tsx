import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Suspense, lazy, useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import UserProfile from './pages/UserProfile';
import LoadingScreen from './components/LoadingScreen';
import ProfilePageSkeleton from './components/ProfilePageSkeleton';
import CinematicStandardChrome from './components/CinematicStandardChrome';
import FloatingCartControl from './components/FloatingCartControl';

const Home = lazy(() => import('./pages/Home'));
const Platform = lazy(() => import('./pages/Platform'));
const Pricing = lazy(() => import('./pages/Pricing'));
const WarrantyPage = lazy(() => import('./pages/WarrantyPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const Affiliate = lazy(() => import('./pages/Affiliate'));
const Portal = lazy(() => import('./pages/Portal'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));

const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
if (navigationEntry?.type === 'reload' && window.location.pathname !== '/') {
  window.history.replaceState(null, '', '/');
}

function RouteFallback() {
  const location = useLocation();
  const systemPaths = ['/', '/platform', '/pricing', '/faq', '/warranty', '/privacy-policy', '/refund-policy', '/affiliate', '/portal'];
  const isProfilePage = !systemPaths.includes(location.pathname);

  if (isProfilePage) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-aura-gold/20 border-t-aura-gold rounded-full animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes key={location.pathname} location={location}>
        <Route 
          path="/" 
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Home />
            </motion.div>
          } 
        />
        <Route 
          path="/platform" 
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Platform />
            </motion.div>
          } 
        />
        <Route 
          path="/pricing" 
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Pricing />
            </motion.div>
          } 
        />
        <Route 
          path="/faq" 
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <FAQPage />
            </motion.div>
          } 
        />
        <Route 
          path="/warranty" 
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WarrantyPage />
            </motion.div>
          } 
        />
        <Route
          path="/privacy-policy"
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <PrivacyPolicy />
            </motion.div>
          }
        />
        <Route
          path="/refund-policy"
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <RefundPolicy />
            </motion.div>
          }
        />
        <Route 
          path="/affiliate" 
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Affiliate />
            </motion.div>
          } 
        />
        <Route 
          path="/portal" 
          element={
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Portal />
            </motion.div>
          } 
        />
        <Route 
          path="/:username" 
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <UserProfile />
            </motion.div>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();
  const systemPaths = ['/', '/platform', '/pricing', '/faq', '/warranty', '/privacy-policy', '/refund-policy', '/affiliate', '/portal'];
  const isProfilePage = !systemPaths.includes(location.pathname);
  const isCinematicHome = location.pathname === '/';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {!isProfilePage && !isCinematicHome && <CinematicStandardChrome />}
      {!isProfilePage && <FloatingCartControl />}
      <main className={!isProfilePage && !isCinematicHome ? 'relative z-10 [&_section]:bg-transparent' : undefined}>
        <Suspense fallback={<RouteFallback />}>
          <AnimatedRoutes />
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  const systemPaths = ['/', '/platform', '/pricing', '/faq', '/warranty', '/privacy-policy', '/refund-policy', '/affiliate', '/portal'];
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const isProfilePage = !systemPaths.includes(path);
  const [isLoading, setIsLoading] = useState(!isProfilePage);

  if (isLoading) {
    return (
      <AuthProvider>
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      </AuthProvider>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
