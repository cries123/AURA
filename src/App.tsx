import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Platform from './pages/Platform';
import Pricing from './pages/Pricing';
import WarrantyPage from './pages/WarrantyPage';
import FAQPage from './pages/FAQPage';
import Affiliate from './pages/Affiliate';
import Portal from './pages/Portal';
import UserProfile from './pages/UserProfile';
import LoadingScreen from './components/LoadingScreen';
import CinematicStandardChrome from './components/CinematicStandardChrome';
import FloatingCartControl from './components/FloatingCartControl';

const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
if (navigationEntry?.type === 'reload' && window.location.pathname !== '/') {
  window.history.replaceState(null, '', '/');
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      {/* @ts-ignore - key is used for AnimatePresence to trigger re-renders */}
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
              transition={{ duration: 0.3 }}
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
  const systemPaths = ['/', '/platform', '/pricing', '/faq', '/warranty', '/affiliate', '/portal'];
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
        <AnimatedRoutes />
      </main>
    </div>
  );
}

export default function App() {
  const systemPaths = ['/', '/platform', '/pricing', '/faq', '/warranty', '/affiliate', '/portal'];
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
