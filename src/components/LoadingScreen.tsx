import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startedAt = window.performance.now();
    const duration = 1700;
    let frameId = 0;

    const tick = (now: number) => {
      const nextProgress = Math.min(((now - startedAt) / duration) * 100, 100);
      setProgress(nextProgress);

      if (nextProgress < 100) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration + 180);

    return () => {
      window.cancelAnimationFrame(frameId);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex select-none flex-col items-center justify-center overflow-hidden bg-[#030303] px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(197,160,89,0.18),transparent_28%),linear-gradient(115deg,rgba(3,3,3,1),rgba(16,12,6,0.9)_48%,rgba(3,3,3,1))]" />
      <div className="cinematic-noise pointer-events-none absolute inset-0 opacity-30" />
      <div className="absolute h-72 w-72 animate-spin rounded-full border border-aura-gold/15 [animation-duration:18s]" />
      <div className="absolute h-44 w-44 animate-spin rounded-full border border-dashed border-aura-gold/25 [animation-direction:reverse] [animation-duration:24s]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm text-center"
      >
        <p className="font-display text-4xl font-black uppercase tracking-[0.16em] text-white">
          Aura<span className="text-aura-gold">Tap</span>
        </p>
        <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.44em] text-zinc-500">
          Loading command deck
        </p>

        <div className="mt-10 h-px w-full overflow-hidden bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-aura-gold to-white"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-600">
          <span>Initializing</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </motion.div>
    </div>
  );
}
