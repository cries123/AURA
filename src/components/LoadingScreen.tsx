import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, ArrowRight } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [status, setStatus] = useState<'waiting' | 'tapped' | 'zooming'>('waiting');

  const handleTapComplete = () => {
    if (status !== 'waiting') return;
    setStatus('tapped');
    // Show preview for 1 second then zoom
    setTimeout(() => {
      setStatus('zooming');
      setTimeout(() => {
        onComplete();
      }, 1200);
    }, 1200);
  };

  useEffect(() => {
    // Automatically trigger NFC tap simulation after 4 seconds of inactivity
    const timer = setTimeout(() => {
      if (status === 'waiting') {
        handleTapComplete();
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [status]);

  return (
    <div className="fixed inset-0 z-[200] bg-aura-black flex flex-col items-center justify-center overflow-hidden px-6">
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 md:gap-24 scale-[0.7] sm:scale-90 md:scale-100 transition-transform duration-500">
        
        {/* The Phone */}
        <motion.div 
          animate={{ 
            scale: status === 'zooming' ? 20 : 1,
            opacity: status === 'zooming' ? 0 : 1,
            x: status === 'waiting' && (typeof window !== 'undefined' ? window.innerWidth >= 768 : true) ? 40 : 0,
            y: status === 'waiting' && (typeof window !== 'undefined' ? window.innerWidth < 768 : false) ? 40 : 0
          }}
          transition={{ 
            duration: status === 'zooming' ? 1.5 : 1, 
            ease: [0.7, 0, 0.3, 1] 
          }}
          className="w-[300px] h-[600px] bg-zinc-950 border-[12px] border-zinc-900 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center flex-shrink-0"
        >
          {/* Internal Screen Content */}
          <div className={`w-full h-full relative flex flex-col origin-top transition-colors duration-500 ${status === 'waiting' ? 'bg-zinc-950' : 'bg-aura-black'}`}>
            <AnimatePresence>
              {status !== 'waiting' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full flex flex-col"
                >
                  <div className="absolute top-0 w-32 h-6 bg-zinc-900 rounded-b-2xl z-20 left-1/2 -translate-x-1/2" />
                  
                  {/* Mock Nav */}
                  <div className="px-6 pt-10 flex justify-between items-center opacity-40">
                    <div className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-aura-gold" />
                      <span className="text-[8px] font-display font-bold text-white uppercase tracking-tight">AURA TAP</span>
                    </div>
                    <div className="w-10 h-4 rounded-md bg-aura-gold/20" />
                  </div>

                  {/* Mock Hero Preview */}
                  <div className="px-8 pt-12 flex-1">
                    <div className="inline-block px-2 py-0.5 rounded-full border border-aura-gold/30 text-aura-gold text-[6px] font-bold uppercase tracking-wider mb-4">
                      NFC + Dashboard
                    </div>
                    <h1 className="text-3xl font-display font-medium text-white leading-none mb-4">
                      Deliver a <br />
                      <span className="text-aura-gold italic">professional</span> <br />
                      first impression.
                    </h1>
                    <div className="space-y-2 mb-8 opacity-20">
                      <div className="h-1 w-full bg-white rounded" />
                      <div className="h-1 w-3/4 bg-white rounded" />
                    </div>

                    <div className="flex gap-2 mb-10">
                      <div className="h-8 w-1/2 bg-aura-gold rounded-lg" />
                      <div className="h-8 w-1/4 bg-zinc-800 rounded-lg" />
                    </div>

                    <div className="aspect-square w-full rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                      <div className="w-24 h-40 bg-aura-black rounded-lg border border-zinc-700 shadow-xl p-3 flex flex-col">
                        <span className="text-[8px] font-display font-bold text-white">AURA</span>
                        <div className="mt-auto flex justify-end">
                          <div className="w-4 h-4 rounded bg-aura-gold/20 border border-aura-gold/40" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* NFC Pulse Effect */}
          <AnimatePresence>
            {status === 'tapped' && (
              <motion.div 
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 8, opacity: 0 }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-aura-gold rounded-full z-30"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* The Card */}
        <AnimatePresence>
          {status === 'waiting' && (
            <motion.div
              initial={{ x: 100, opacity: 0, rotate: 10 }}
              animate={{ x: 0, opacity: 1, rotate: -5 }}
              exit={{ 
                scale: 0.8, 
                opacity: 0, 
                y: -100,
                transition: { duration: 0.5 } 
              }}
              drag
              dragConstraints={{ left: -600, right: 600, top: -600, bottom: 600 }}
              onDragEnd={(e, info) => {
                const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
                if (isDesktop) {
                  if (info.point.x < window.innerWidth / 2) handleTapComplete();
                } else {
                  if (info.point.y < window.innerHeight / 2) handleTapComplete();
                }
              }}
              whileTap={{ scale: 1.05, rotate: 0 }}
              className="w-[280px] h-[170px] bg-zinc-900 rounded-3xl border border-zinc-800 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] p-8 cursor-grab active:cursor-grabbing z-50 flex flex-col items-center justify-center text-center relative overflow-hidden flex-shrink-0"
            >
              <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-aura-gold/5 flex items-center justify-center">
                <div className="w-4 h-4 bg-aura-gold/20 rounded-full" />
              </div>

              <div className="space-y-5">
                <div className="text-4xl font-display font-bold tracking-tighter text-white">AURA</div>
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-aura-gold animate-pulse">
                    Drag Card to Phone
                  </div>
                  <p className="text-[9px] text-zinc-500 font-medium leading-relaxed max-w-[200px] mx-auto opacity-70">
                    Networking is moving faster than paper. <br /> Experience the future of connection.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions Text removed - integrated into card */}
      </div>

      {/* Decorative Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-aura-gold/5 to-transparent opacity-50" />
      </div>
    </div>
  );
}

