import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { CartProvider } from '@/src/context/CartContext';
import { AuthProvider } from '@/src/context/AuthContext';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import Home from '@/src/pages/Home';
import Platform from '@/src/pages/Platform';
import Pricing from '@/src/pages/Pricing';
import WarrantyPage from '@/src/pages/WarrantyPage';
import FAQPage from '@/src/pages/FAQPage';
import Affiliate from '@/src/pages/Affiliate';
import Portal from '@/src/pages/Portal';
import UserProfile from '@/src/pages/UserProfile';
import LoadingScreen from '@/src/components/LoadingScreen';

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
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AnimatePresence>
            {isLoading && (
              <LoadingScreen onComplete={() => setIsLoading(false)} />
            )}
          </AnimatePresence>

          <div className={`min-h-screen selection:bg-aura-gold selection:text-aura-black transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <Navbar />
            <main>
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
