import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ROICalculator from './ROICalculator';

export default function Hero() {
  const [isROIModalOpen, setIsROIModalOpen] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden bg-aura-black">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-aura-gold/5 rounded-full blur-[80px]" 
          style={{ willChange: 'filter' }}
        />
        <div 
          className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] bg-aura-gold/5 rounded-full blur-[80px]" 
          style={{ willChange: 'filter' }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col items-center text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="max-w-4xl"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] uppercase tracking-[0.2em] font-bold text-aura-gold mb-8"
          >
            The Future of Professional Networking
          </motion.div>
          
          <h1 className="text-6xl md:text-9xl font-display font-medium tracking-tight mb-10 leading-[0.9]">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="block"
              style={{ willChange: 'transform, opacity' }}
            >
              Deliver a <span className="text-white">professional</span>
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="block"
              style={{ willChange: 'transform, opacity' }}
            >
              first <span className="text-transparent bg-clip-text bg-gradient-to-r from-aura-gold to-[#f2e6b8] italic">impression.</span>
            </motion.span>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-sans"
          >
            Premium NFC cards and wristbands connected to the Aura Platform. 
            One tap shares your dashboard-managed profile instantly. No apps. No waste. No limits.
          </motion.p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
            <Link to="/pricing" className="w-full sm:w-auto px-10 py-5 bg-white text-aura-black font-bold rounded-2xl hover:bg-aura-gold hover:scale-105 transition-all shadow-xl shadow-aura-gold/10 inline-block text-center">
              Get Started Now
            </Link>
            <button 
              onClick={() => setIsROIModalOpen(true)}
              className="w-full sm:w-auto px-10 py-5 bg-zinc-900/50 border border-zinc-800 text-zinc-300 font-bold rounded-2xl hover:bg-zinc-800 hover:text-white transition-all backdrop-blur-sm"
            >
              See the ROI Math
            </button>
          </div>

          {/* Simple Product Visuals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto opacity-40">
             {['NFC Cards', 'Wristbands', 'Dashboard', 'Analytics'].map(text => (
               <div key={text} className="px-4 py-3 rounded-xl border border-zinc-800 text-[10px] uppercase tracking-widest font-bold text-zinc-600">
                 {text}
               </div>
             ))}
          </div>
        </motion.div>
      </div>

      <ROICalculator 
        isOpen={isROIModalOpen} 
        onClose={() => setIsROIModalOpen(false)} 
      />
    </section>
  );
}
