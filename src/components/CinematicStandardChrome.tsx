import { useState } from 'react';
import CinematicNavigationMenu, { CinematicMenuButton } from './CinematicNavigationMenu';

export default function CinematicStandardChrome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_12%,rgba(197,160,89,0.22),transparent_28%),radial-gradient(circle_at_18%_42%,rgba(197,160,89,0.1),transparent_24%),linear-gradient(115deg,rgba(3,3,3,0.96),rgba(15,12,6,0.78)_48%,rgba(3,3,3,0.96))]" />
        <div className="absolute inset-y-0 right-0 w-[62%] bg-[linear-gradient(90deg,transparent,rgba(197,160,89,0.08)),linear-gradient(rgba(197,160,89,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(197,160,89,0.1)_1px,transparent_1px)] bg-[size:100%_100%,64px_64px,64px_64px] [transform:perspective(760px)_rotateX(58deg)_translateY(9%)] [transform-origin:center]" />
        <div className="absolute right-[-12rem] top-[-8rem] h-[42rem] w-[42rem] rounded-full border border-aura-gold/15 aura-spin-slow" />
        <div className="absolute left-[8%] top-[18%] h-[22rem] w-[22rem] rounded-full bg-aura-gold/10 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[18%] h-px w-[34rem] max-w-[60vw] bg-gradient-to-r from-transparent via-aura-gold/60 to-transparent aura-scan-drift" />
      </div>
      <div className="cinematic-noise pointer-events-none fixed inset-0 z-[1]" />
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_50%_35%,transparent_0%,transparent_36%,rgba(0,0,0,0.58)_82%)]" />

      <div className="fixed left-6 top-6 z-40 flex items-start gap-6 md:left-10">
        <CinematicMenuButton onClick={() => setIsMenuOpen(true)} />
        <div>
          <p className="font-display text-xl font-bold uppercase leading-none tracking-[0.18em]">
            Aura<span className="text-aura-gold">Tap</span>
          </p>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.42em] text-zinc-500">
            Command deck
          </p>
        </div>
      </div>

      <CinematicNavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}
