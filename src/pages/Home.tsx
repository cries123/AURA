import { type CSSProperties, type PointerEvent, useRef, useState } from 'react';
import CinematicCardScene from '../components/CinematicCardScene';
import CinematicNavigationMenu, {
  CinematicMenuButton,
} from '../components/CinematicNavigationMenu';

const panels = [
  {
    id: 'intro',
    chapter: '01',
    eyebrow: 'AURA TAP / REVOLUTIONIZED',
    ghost: 'TAP',
    label: 'Genesis',
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
    label: 'Science',
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
    label: 'System',
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
    label: 'Network',
    title: 'Make every introduction measurable.',
    body: 'Equip founders, sales teams, and creators with a reusable networking layer that feels premium before the link even opens.',
    align: 'items-end text-right',
    copyAlign: 'ml-auto',
  },
];

function CinematicHud({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <>
      <div className="pointer-events-none fixed left-6 right-6 top-6 z-30 flex items-start justify-between text-white md:left-10 md:right-10">
        <div className="flex items-start gap-6">
          <div className="mt-1">
            <CinematicMenuButton onClick={onOpenMenu} />
          </div>
          <div>
            <p className="font-display text-xl font-bold uppercase leading-none tracking-[0.18em]">
              Aura<span className="text-aura-gold">Tap</span>
            </p>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.42em] text-zinc-500">
              Networking. Revolutionized.
            </p>
          </div>
        </div>
        <div className="hidden text-right md:block">
          <p className="font-mono text-[9px] uppercase tracking-[0.38em] text-zinc-500">
            Current chapter
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.32em] text-aura-gold">
            <span data-cinematic-index>01</span>
            <span className="mx-2 text-zinc-600">/</span>
            <span data-cinematic-title>Genesis</span>
          </p>
        </div>
      </div>

      <div className="pointer-events-none fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex">
        {panels.map((panel, index) => (
          <span
            key={panel.id}
            data-cinematic-dot
            className="h-2 w-2 rounded-full border border-aura-gold/40 bg-transparent transition-all duration-300 first:bg-aura-gold first:shadow-[0_0_18px_rgba(232,215,162,0.8)]"
            aria-label={panel.label}
            style={{ opacity: index === 0 ? 1 : 0.35 }}
          />
        ))}
      </div>

      <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-4 md:flex">
        <span className="h-px w-14 bg-gradient-to-r from-transparent to-aura-gold/70" />
        <span className="font-mono text-[9px] uppercase tracking-[0.45em] text-zinc-500">
          Scroll to advance
        </span>
        <span className="h-px w-14 bg-gradient-to-l from-transparent to-aura-gold/70" />
      </div>
    </>
  );
}

function HomeAtmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <div className="home-reactive-glow absolute inset-0" />
      <div className="absolute -right-32 -top-40 h-[42rem] w-[42rem] rounded-full border border-aura-gold/15 aura-spin-slow" />
      <div className="absolute right-12 top-10 h-[22rem] w-[22rem] rounded-full border border-dashed border-aura-gold/20 aura-spin-slow-reverse" />
      <div className="home-reactive-drift absolute right-[12%] top-[12%] h-52 w-52 rounded-full bg-aura-lime/10 blur-[80px]" />
      <div className="home-reactive-drift-slow absolute inset-x-0 top-0 h-48 bg-[linear-gradient(rgba(232,215,162,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(232,215,162,0.06)_1px,transparent_1px)] bg-[size:54px_54px] opacity-35" />
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-aura-gold/35 to-transparent" />
    </div>
  );
}

function PanelVisuals({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_44%,rgba(232,215,162,0.14),transparent_22%),radial-gradient(circle_at_18%_68%,rgba(255,255,255,0.055),transparent_18%)]" />
        <div className="absolute left-[45%] top-1/2 h-[58rem] w-[58rem] -translate-y-1/2 rounded-full border border-aura-gold/15 aura-spin-slow" />
        <div className="absolute left-[49%] top-1/2 h-[38rem] w-[38rem] -translate-y-1/2 rounded-full border border-dashed border-aura-gold/20 aura-spin-slow-reverse" />
        <div className="absolute right-[-8rem] top-[14%] h-[24rem] w-[24rem] rounded-full bg-aura-gold/10 blur-[90px]" />
        <div className="absolute bottom-[12%] left-[8%] h-40 w-40 rounded-full bg-aura-gold/10 blur-[70px]" />
        <div className="absolute right-[18%] top-[36%] h-52 w-36 rounded-[1.8rem] border border-aura-gold/25 bg-black/30 shadow-[0_0_70px_rgba(232,215,162,0.12)] backdrop-blur aura-card-float" />
        <div className="absolute right-[21%] top-[42%] h-20 w-24 rounded-2xl border border-aura-gold/30 bg-aura-gold/10 aura-card-float-delayed" />
        <div className="absolute right-[8%] top-[18%] grid grid-cols-4 gap-3 opacity-75">
          {Array.from({ length: 16 }, (_, tileIndex) => (
            <span
              key={tileIndex}
              className="h-10 w-10 rounded-lg border border-aura-gold/20 bg-aura-gold/[0.035] aura-float"
              style={{ animationDelay: `${tileIndex * 0.08}s` }}
            />
          ))}
        </div>
        <div className="absolute bottom-[18%] right-[11%] flex items-end gap-2">
          {[92, 54, 132, 76, 116, 42, 98].map((height, barIndex) => (
            <span
              key={height}
              className="w-2 rounded-full bg-gradient-to-t from-aura-gold/10 via-aura-gold/70 to-white/70 aura-equalizer"
              style={{ height, animationDelay: `${barIndex * 0.12}s` }}
            />
          ))}
        </div>
        <div className="absolute left-[8%] bottom-[16%] rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.34em] text-zinc-400">
          Product launch sequence armed
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-[68%] bg-[linear-gradient(90deg,transparent,rgba(232,215,162,0.08)),linear-gradient(rgba(232,215,162,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(232,215,162,0.12)_1px,transparent_1px)] bg-[size:100%_100%,56px_56px,56px_56px] [transform:perspective(700px)_rotateX(58deg)_translateY(12%)] [transform-origin:center]" />
        <div className="absolute right-[7%] top-[12%] h-[70vh] w-[46vw] min-w-[26rem] rounded-full border border-aura-gold/10 bg-[radial-gradient(circle,rgba(232,215,162,0.14),transparent_56%)] blur-[1px]" />
        <div className="absolute right-[12%] top-[17%] h-[34rem] w-[34rem] rounded-full border border-aura-gold/20 aura-spin-slow" />
        <div className="absolute right-[18%] top-[24%] h-[22rem] w-[22rem] rounded-full border border-aura-gold/30 aura-pulse-ring" />
        {[
          ['right-[34%]', 'top-[32%]'],
          ['right-[18%]', 'top-[42%]'],
          ['right-[28%]', 'top-[58%]'],
          ['right-[10%]', 'top-[64%]'],
          ['right-[42%]', 'top-[70%]'],
        ].map(([x, y], nodeIndex) => (
          <span
            key={`${x}-${y}`}
            className={`absolute ${x} ${y} h-3 w-3 rounded-full bg-aura-gold shadow-[0_0_28px_rgba(232,215,162,0.9)] aura-pulse-node`}
            style={{ animationDelay: `${nodeIndex * 0.2}s` }}
          />
        ))}
        <div className="absolute right-[9%] top-[24%] rounded-full border border-aura-gold/30 bg-black/30 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.32em] text-aura-gold/80 backdrop-blur">
          NFC FIELD ACTIVE
        </div>
        <div className="absolute right-[12%] bottom-[26%] grid w-72 grid-cols-2 gap-3">
          {['13.56 MHz', '0 Apps', 'Tap Range', 'Profile URL'].map((label, statIndex) => (
            <span
              key={label}
              className="rounded-2xl border border-aura-gold/15 bg-black/35 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-300 backdrop-blur aura-float"
              style={{ animationDelay: `${statIndex * 0.13}s` }}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="absolute bottom-[18%] right-[18%] h-px w-[34rem] max-w-[62vw] bg-gradient-to-r from-transparent via-aura-gold/70 to-transparent aura-scan-drift" />
      </div>
    );
  }

  if (index === 2) {
    return (
      <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-[60%] bg-[linear-gradient(90deg,rgba(232,215,162,0.08),transparent),repeating-linear-gradient(90deg,transparent_0_34px,rgba(255,255,255,0.045)_35px_36px)]" />
        <div className="absolute left-[8%] top-[18%] h-[34rem] w-[30rem] rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_0_80px_rgba(232,215,162,0.08)] backdrop-blur-sm aura-float" />
        <div className="absolute left-[12%] top-[24%] w-72 rounded-3xl border border-aura-gold/20 bg-black/45 p-5 backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.32em] text-aura-gold">Profile Sync</span>
            <span className="h-2 w-2 rounded-full bg-aura-gold shadow-[0_0_18px_rgba(232,215,162,0.9)]" />
          </div>
          <div className="space-y-3">
            {[88, 64, 76].map((width, rowIndex) => (
              <div key={width} className="h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-aura-gold to-white aura-data-fill"
                  style={{ width: `${width}%`, animationDelay: `${rowIndex * 0.18}s` }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-[18%] left-[16%] grid w-[28rem] max-w-[70vw] grid-cols-3 gap-3">
          {['CRM', 'LINKS', 'TEAM', 'LEADS', 'ROUTE', 'DATA'].map((label, tileIndex) => (
            <span
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-5 text-center font-mono text-[10px] uppercase tracking-[0.26em] text-zinc-300 aura-float"
              style={{ animationDelay: `${tileIndex * 0.1}s` }}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="absolute left-[38%] top-[18%] hidden w-56 rounded-3xl border border-white/10 bg-black/35 p-4 font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-400 backdrop-blur lg:block">
          <p className="text-aura-gold">Routing Matrix</p>
          <div className="mt-4 space-y-2">
            {['Lead Capture', 'Team Profile', 'Analytics'].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span>{item}</span>
                <span className="text-aura-gold">ON</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute left-[28%] top-[20%] h-[36rem] w-px rotate-12 bg-gradient-to-b from-transparent via-aura-gold/60 to-transparent" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_54%,rgba(232,215,162,0.12),transparent_28%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.05),transparent_20%)]" />
      <svg className="absolute left-[5%] top-[8%] h-[84vh] w-[60vw] opacity-70" viewBox="0 0 900 700">
        <defs>
          <linearGradient id="network-line" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#e8d7a2" stopOpacity="0" />
            <stop offset="45%" stopColor="#e8d7a2" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[
          [110, 220, 260, 120],
          [260, 120, 430, 260],
          [430, 260, 620, 150],
          [260, 120, 330, 450],
          [330, 450, 610, 520],
          [620, 150, 760, 340],
          [760, 340, 610, 520],
          [110, 220, 330, 450],
        ].map(([x1, y1, x2, y2]) => (
          <line
            key={`${x1}-${y1}-${x2}-${y2}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#network-line)"
            strokeWidth="2"
          />
        ))}
        {[
          [110, 220],
          [260, 120],
          [430, 260],
          [620, 150],
          [330, 450],
          [610, 520],
          [760, 340],
        ].map(([cx, cy], nodeIndex) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={nodeIndex === 3 ? 12 : 8}
            fill="#e8d7a2"
            className="aura-svg-node"
            style={{ animationDelay: `${nodeIndex * 0.14}s` }}
          />
        ))}
      </svg>
      <div className="absolute left-[10%] top-[18%] rounded-full border border-aura-gold/25 bg-aura-gold/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-aura-gold aura-float">
        248 live taps
      </div>
      <div className="absolute bottom-[16%] left-[22%] rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-200 aura-float">
        91% saved contact
      </div>
      <div className="absolute left-[34%] top-[56%] hidden rounded-full border border-aura-gold/20 bg-black/30 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-aura-gold backdrop-blur md:block">
        Network propagation live
      </div>
      <div className="absolute right-[12%] top-[18%] h-[26rem] w-[26rem] rounded-full bg-aura-gold/10 blur-[100px]" />
    </div>
  );
}

function renderInteractiveTitle(title: string) {
  return title.split('').map((character, index) => {
    if (character === ' ') {
      return (
        <span key={`space-${index}`} className="cinematic-title-space">
          {' '}
        </span>
      );
    }

    return (
      <span
        key={`${character}-${index}`}
        className="cinematic-title-letter"
        style={{ transitionDelay: `${(index % 9) * 12}ms` }}
      >
        {character}
      </span>
    );
  });
}

export default function Home() {
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mouseReactiveStyle = {
    '--mouse-x': '0px',
    '--mouse-y': '0px',
    '--mouse-x-reverse': '0px',
    '--mouse-y-reverse': '0px',
    '--mouse-x-slow': '0px',
    '--mouse-y-slow': '0px',
    '--mouse-tilt-x': '0deg',
    '--mouse-tilt-y': '0deg',
  } as CSSProperties;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
    const x = normalizedX * 128;
    const y = normalizedY * 96;

    root.style.setProperty('--mouse-x', `${x}px`);
    root.style.setProperty('--mouse-y', `${y}px`);
    root.style.setProperty('--mouse-x-reverse', `${x * -0.55}px`);
    root.style.setProperty('--mouse-y-reverse', `${y * -0.45}px`);
    root.style.setProperty('--mouse-x-slow', `${x * -0.18}px`);
    root.style.setProperty('--mouse-y-slow', `${y * -0.14}px`);
    root.style.setProperty('--mouse-tilt-x', `${normalizedY * -7}deg`);
    root.style.setProperty('--mouse-tilt-y', `${normalizedX * 9}deg`);
  };

  const handlePointerLeave = () => {
    const root = rootRef.current;
    if (!root) return;

    root.style.setProperty('--mouse-x', '0px');
    root.style.setProperty('--mouse-y', '0px');
    root.style.setProperty('--mouse-x-reverse', '0px');
    root.style.setProperty('--mouse-y-reverse', '0px');
    root.style.setProperty('--mouse-x-slow', '0px');
    root.style.setProperty('--mouse-y-slow', '0px');
    root.style.setProperty('--mouse-tilt-x', '0deg');
    root.style.setProperty('--mouse-tilt-y', '0deg');
  };

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen overflow-hidden bg-[#030303] text-white"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={mouseReactiveStyle}
    >
      <CinematicCardScene
        pinContainerRef={pinContainerRef}
        sectionCount={panels.length}
      />

      <HomeAtmosphere />
      <div className="cinematic-noise pointer-events-none fixed inset-0 z-[2]" />
      <div className="pointer-events-none fixed inset-0 z-[3] bg-[radial-gradient(circle_at_50%_45%,transparent_0%,transparent_38%,rgba(0,0,0,0.62)_78%)]" />
      <CinematicHud onOpenMenu={() => setIsMenuOpen(true)} />
      <CinematicNavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        chapters={panels}
        chapterHrefPrefix=""
      />
      <div className="pointer-events-none fixed left-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex">
        <span className="h-24 w-px bg-gradient-to-b from-transparent via-aura-gold to-transparent" />
        <span className="rotate-180 [writing-mode:vertical-rl] text-[10px] font-bold uppercase tracking-[0.38em] text-aura-gold/70">
          Aura Taps
        </span>
        <span className="h-24 w-px bg-gradient-to-b from-transparent via-aura-gold to-transparent" />
      </div>

      <div
        ref={pinContainerRef}
        className="pointer-events-none relative z-10 h-screen overflow-hidden"
      >
        {panels.map((panel, index) => (
          <section
            id={panel.id}
            key={panel.title}
            data-cinematic-panel
            data-cinematic-label={panel.label}
            className={`absolute inset-0 isolate flex h-screen overflow-hidden px-6 pt-28 md:px-12 ${panel.align}`}
            style={{
              opacity: index === 0 ? 1 : 0,
              visibility: index === 0 ? 'visible' : 'hidden',
            }}
          >
            <div
              aria-hidden="true"
              className={`absolute inset-x-0 top-[16%] z-0 select-none text-center font-display text-[23vw] font-bold uppercase leading-none tracking-[-0.12em] text-white/[0.025] md:top-[10%] ${
                index > 1 ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'
              }`}
            >
              {panel.ghost}
            </div>

            <div
              data-cinematic-visual
              className="home-panel-visual absolute inset-0 z-0"
              style={{
                opacity: index === 0 ? 1 : 0,
                visibility: index === 0 ? 'visible' : 'hidden',
                transform: index === 0
                  ? 'perspective(1200px) rotateY(0deg) scale(1)'
                  : 'perspective(1200px) rotateY(18deg) scale(1.04)',
              }}
            >
              <PanelVisuals index={index} />
            </div>

            <div
              data-cinematic-copy
              className="relative z-10 flex h-screen w-full max-w-7xl mx-auto flex-col justify-center"
              style={{
                opacity: index === 0 ? 1 : 0,
                visibility: index === 0 ? 'visible' : 'hidden',
                transform: index === 0 ? 'translateY(0)' : 'translateY(54px)',
                filter: index === 0 ? 'blur(0px)' : 'blur(12px)',
              }}
            >
              <div className={`relative max-w-2xl ${panel.copyAlign}`}>
                <div className={`mb-8 flex items-center gap-4 ${index > 1 ? 'justify-end' : ''}`}>
                  <span className="font-mono text-xs text-aura-gold/80">{panel.chapter}</span>
                  <span className="h-px w-16 bg-aura-gold/50" />
                  <p className="text-[10px] font-black uppercase tracking-[0.46em] text-aura-gold">
                    {panel.eyebrow}
                  </p>
                </div>
                <h1 className="cinematic-title font-display text-6xl font-bold uppercase leading-[0.82] tracking-[-0.075em] text-white md:text-8xl lg:text-9xl">
                  {renderInteractiveTitle(panel.title)}
                </h1>
                <p className="mt-8 max-w-xl text-base font-medium leading-8 text-zinc-300/80 md:text-xl">
                  {panel.body}
                </p>
                {index === panels.length - 1 && (
                  <a
                    href="mailto:sales@auratap.net"
                    className="pointer-events-auto mt-10 inline-flex rounded-full border border-aura-lime/60 bg-aura-lime px-7 py-3 text-[11px] font-black uppercase tracking-[0.28em] text-black shadow-[0_0_42px_rgba(184,255,44,0.22)] transition hover:bg-white"
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
