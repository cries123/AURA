import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  // States:
  // - 'intro': Initial fade-in layout
  // - 'dragging': Card automatically gliding across screen to the phone's reader
  // - 'tapped': Card lands, NFC signal pulse, screen fully illuminates
  // - 'zooming': Camera zooms directly through phone screen into the app template
  const [status, setStatus] = useState<'intro' | 'dragging' | 'tapped' | 'zooming'>('intro');
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    // 1. Initial breathing screen is shown for 1200ms, then the automatic drag starts
    const startDragTimer = setTimeout(() => {
      setStatus('dragging');
    }, 1200);

    // 2. The drag is animated over 1500ms; at 2700ms total, the tap wave begins
    const tapTimer = setTimeout(() => {
      setStatus('tapped');
    }, 2750);

    // 3. The card merges into/unlocks the phone screen for 1250ms, then begins zooming
    const zoomTimer = setTimeout(() => {
      setStatus('zooming');
    }, 4000);

    // 4. The camera completely enters the interface over 1300ms, triggering final complete callback
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5300);

    return () => {
      clearTimeout(startDragTimer);
      clearTimeout(tapTimer);
      clearTimeout(zoomTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-aura-black flex flex-col items-center justify-center overflow-hidden px-6 select-none">
      
      {/* Skip Button (Helper for quick previewing / repeat testing) */}
      <button 
        onClick={onComplete}
        className="absolute bottom-8 right-8 text-zinc-500 hover:text-white font-mono text-[9px] uppercase tracking-widest bg-zinc-950/40 border border-zinc-900 px-3.5 py-2 rounded-lg transition-all duration-300 pointer-events-auto z-[210] hover:border-zinc-800"
      >
        Skip Intro
      </button>

      <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 md:gap-24 scale-[0.7] sm:scale-90 md:scale-100 transition-transform duration-500">
        
        {/* The Phone */}
        <motion.div 
          animate={{ 
            scale: status === 'zooming' ? 32 : (status === 'tapped' ? 1.05 : 1),
            opacity: status === 'zooming' ? 0 : 1,
            x: (status === 'intro' || status === 'dragging') && isDesktop ? 40 : 0,
            y: (status === 'intro' || status === 'dragging') && !isDesktop ? 40 : 0
          }}
          transition={{ 
            duration: status === 'zooming' ? 1.4 : 1, 
            ease: [0.7, 0, 0.3, 1] 
          }}
          style={{
            transformOrigin: status === 'zooming' ? "center 26%" : "center center"
          }}
          className="w-[300px] h-[600px] bg-zinc-950 border-[12px] border-zinc-900 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center flex-shrink-0"
        >
          {/* Internal Screen Content */}
          <div className={`w-full h-full relative flex flex-col origin-top transition-colors duration-500 ${status === 'intro' || status === 'dragging' ? 'bg-zinc-950' : 'bg-aura-black'}`}>
            <AnimatePresence>
              {status !== 'intro' && status !== 'dragging' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
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
                animate={{ scale: 9, opacity: 0 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-aura-gold rounded-full z-30"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* The Card */}
        <AnimatePresence>
          {(status === 'intro' || status === 'dragging') && (
            <motion.div
              initial={{ x: 100, opacity: 0, rotate: 10 }}
              animate={
                status === 'dragging' 
                  ? {
                      x: isDesktop ? -260 : 0,
                      y: isDesktop ? -30 : -345,
                      rotate: -15,
                      scale: 0.95,
                      opacity: 0.25,
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                    }
                  : { 
                      x: 0, 
                      opacity: 1, 
                      rotate: -5,
                      scale: 1,
                    }
              }
              exit={{ 
                scale: 0.7, 
                opacity: 0, 
                transition: { duration: 0.3 } 
              }}
              transition={{
                duration: status === 'dragging' ? 1.55 : 0.8,
                ease: [0.25, 1, 0.5, 1]
              }}
              className="w-[280px] h-[170px] bg-zinc-900 rounded-3xl border border-zinc-800 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] p-8 z-50 flex flex-col items-center justify-center text-center relative overflow-hidden flex-shrink-0"
            >
              <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-aura-gold/5 flex items-center justify-center">
                <div className="w-4 h-4 bg-aura-gold/20 rounded-full animate-ping" />
              </div>

              <div className="space-y-5">
                <div className="text-4xl font-display font-bold tracking-tighter text-white">AURA</div>
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-aura-gold">
                    {status === 'dragging' ? 'Tapping NFC...' : 'Aura Smart Tap'}
                  </div>
                  <p className="text-[9px] text-zinc-500 font-medium leading-relaxed max-w-[200px] mx-auto opacity-70">
                    Networking is moving faster than paper. <br /> Experience the future of connection.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Gradient Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-aura-gold/5 to-transparent opacity-50" />
      </div>
    </div>
  );
}
