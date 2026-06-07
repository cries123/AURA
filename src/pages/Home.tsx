import { useRef } from 'react';
import CinematicCardScene from '../components/CinematicCardScene';

const panels = [
  {
    id: 'intro',
    chapter: '01',
    eyebrow: 'AURA TAP / REVOLUTIONIZED',
    ghost: 'TAP',
    title: 'Your card is no longer paper.',
    body: 'A cinematic NFC object built to turn a first meeting into an instant digital handoff.',
    align: 'items-start text-left',
    copyAlign: '',
  },
  {
    id: 'science',
    chapter: '02',
    eyebrow: 'THE SCIENCE OF THE TAP',
    ghost: 'SIGNAL',
    title: 'One gesture. A complete profile transfer.',
    body: 'NFC opens the right destination instantly: contact details, links, lead capture, and team-managed identity without an app download.',
    align: 'items-start text-left',
    copyAlign: '',
  },
  {
    id: 'system',
    chapter: '03',
    eyebrow: 'LIVE PROFILE SYSTEM',
    ghost: 'PULSE',
    title: 'A physical card with a living backend.',
    body: 'Update offers, routing, team details, and analytics from Aura Platform while the card in your hand stays the same.',
    align: 'items-end text-right',
    copyAlign: 'ml-auto',
  },
  {
    id: 'contact',
    chapter: '04',
    eyebrow: 'DEPLOY THE NETWORK',
    ghost: 'AURA',
    title: 'Make every introduction measurable.',
    body: 'Equip founders, sales teams, and creators with a reusable networking layer that feels premium before the link even opens.',
    align: 'items-end text-right',
    copyAlign: 'ml-auto',
  },
];

export default function Home() {
  const scrollRootRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRootRef}
      className="relative min-h-[400vh] overflow-hidden bg-[#030303] text-white"
    >
      <CinematicCardScene scrollRootRef={scrollRootRef} />

      <div className="cinematic-noise pointer-events-none fixed inset-0 z-[1]" />
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_50%_45%,transparent_0%,transparent_38%,rgba(0,0,0,0.62)_78%)]" />
      <div className="pointer-events-none fixed left-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex">
        <span className="h-24 w-px bg-gradient-to-b from-transparent via-aura-gold to-transparent" />
        <span className="rotate-180 [writing-mode:vertical-rl] text-[10px] font-bold uppercase tracking-[0.38em] text-aura-gold/70">
          Aura Taps
        </span>
        <span className="h-24 w-px bg-gradient-to-b from-transparent via-aura-gold to-transparent" />
      </div>

      <div className="pointer-events-none relative z-10">
        {panels.map((panel, index) => (
          <section
            id={panel.id}
            key={panel.title}
            data-cinematic-panel
            className={`relative flex min-h-screen px-6 pt-28 md:px-12 ${panel.align}`}
          >
            <div
              aria-hidden="true"
              className={`absolute inset-x-0 top-[16%] select-none text-center font-display text-[23vw] font-bold uppercase leading-none tracking-[-0.12em] text-white/[0.025] md:top-[10%] ${
                index > 1 ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'
              }`}
            >
              {panel.ghost}
            </div>

            <div
              data-cinematic-copy
              className="flex min-h-screen w-full max-w-7xl mx-auto flex-col justify-center"
            >
              <div className={`relative max-w-2xl ${panel.copyAlign}`}>
                <div className={`mb-8 flex items-center gap-4 ${index > 1 ? 'justify-end' : ''}`}>
                  <span className="font-mono text-xs text-aura-gold/80">{panel.chapter}</span>
                  <span className="h-px w-16 bg-aura-gold/50" />
                  <p className="text-[10px] font-black uppercase tracking-[0.46em] text-aura-gold">
                    {panel.eyebrow}
                  </p>
                </div>
                <h1 className="font-display text-6xl font-bold uppercase leading-[0.82] tracking-[-0.075em] text-white md:text-8xl lg:text-9xl">
                  {panel.title}
                </h1>
                <p className="mt-8 max-w-xl text-base font-medium leading-8 text-zinc-300/80 md:text-xl">
                  {panel.body}
                </p>
                {index === panels.length - 1 && (
                  <a
                    href="mailto:sales@auratap.net"
                    className="pointer-events-auto mt-10 inline-flex rounded-full border border-aura-gold/50 bg-aura-gold px-7 py-3 text-[11px] font-black uppercase tracking-[0.28em] text-black shadow-[0_0_42px_rgba(197,160,89,0.22)] transition hover:bg-white"
                  >
                    Start the rollout
                  </a>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
