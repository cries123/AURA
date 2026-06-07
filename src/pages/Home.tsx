import { useRef } from 'react';
import CinematicCardScene from '../components/CinematicCardScene';

const panels = [
  {
    eyebrow: 'Aura Taps NFC',
    title: 'Your first impression, made cinematic.',
    body: 'A premium NFC smart card that lets prospects save your profile, contact details, and links with one tap.',
    align: 'items-start text-left',
  },
  {
    eyebrow: 'No Apps Required',
    title: 'Tap. Share. Connect.',
    body: 'Aura Taps works with modern phones instantly, turning every introduction into a polished digital handoff.',
    align: 'items-start text-left',
  },
  {
    eyebrow: 'Dashboard Managed',
    title: 'Update once. Stay current everywhere.',
    body: 'Change your profile, offers, and team information from the Aura Platform without reprinting a single card.',
    align: 'items-end text-right',
  },
  {
    eyebrow: 'Built For Teams',
    title: 'One card for every moment.',
    body: 'Give sales teams, founders, and creators a memorable networking tool backed by analytics and reusable hardware.',
    align: 'items-end text-right',
  },
];

export default function Home() {
  const scrollRootRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollRootRef} className="relative min-h-[400vh] bg-aura-black text-white">
      <CinematicCardScene scrollRootRef={scrollRootRef} />

      <div className="pointer-events-none relative z-10">
        {panels.map((panel, index) => (
          <section
            id={index === panels.length - 1 ? 'contact' : undefined}
            key={panel.title}
            data-cinematic-panel
            className={`flex min-h-screen px-6 pt-28 md:px-12 ${panel.align}`}
          >
            <div
              data-cinematic-copy
              className="flex min-h-screen w-full max-w-7xl mx-auto flex-col justify-center"
            >
              <div className="max-w-xl">
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.42em] text-aura-gold">
                  {panel.eyebrow}
                </p>
                <h1 className="font-display text-5xl font-medium leading-[0.92] tracking-tight text-white md:text-7xl lg:text-8xl">
                  {panel.title}
                </h1>
                <p className="mt-8 text-base leading-8 text-zinc-400 md:text-xl">
                  {panel.body}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
