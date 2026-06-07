import { Link } from 'react-router-dom';
import { useState } from 'react';
import LeadFormModal from './LeadFormModal';

type StoryChapter = {
  id: string;
  chapter: string;
  label: string;
};

type CinematicNavigationMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  chapters?: StoryChapter[];
  chapterHrefPrefix?: string;
};

const homeStoryChapters: StoryChapter[] = [
  { id: 'intro', chapter: '01', label: 'Genesis' },
  { id: 'science', chapter: '02', label: 'Science' },
  { id: 'system', chapter: '03', label: 'System' },
  { id: 'contact', chapter: '04', label: 'Network' },
];

const siteNavLinks = [
  { label: 'Platform', to: '/platform' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Warranty', to: '/warranty' },
  { label: 'Affiliate', to: '/affiliate' },
  { label: 'Portal', to: '/portal' },
];

export function CinematicMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pointer-events-auto flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-white/10 bg-black/25 text-white backdrop-blur transition hover:border-aura-gold/60 hover:text-aura-gold"
      aria-label="Open navigation menu"
    >
      <span className="h-px w-5 bg-current" />
      <span className="h-px w-5 bg-current" />
      <span className="h-px w-5 bg-current" />
    </button>
  );
}

export default function CinematicNavigationMenu({
  isOpen,
  onClose,
  chapters = homeStoryChapters,
  chapterHrefPrefix = '/',
}: CinematicNavigationMenuProps) {
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);

  if (!isOpen) {
    return (
      <LeadFormModal
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        bundleName="Sales Consultation"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080704]/95 text-white backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_34%,rgba(197,160,89,0.22),transparent_28%),radial-gradient(circle_at_78%_72%,rgba(71,109,58,0.16),transparent_30%)]" />
      <div className="cinematic-noise pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-8 md:px-14">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={onClose}
            className="font-display text-xl font-bold uppercase tracking-[0.18em]"
          >
            Aura<span className="text-aura-gold">Tap</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-2xl font-light text-white transition hover:border-aura-gold hover:text-aura-gold"
            aria-label="Close navigation menu"
          >
            x
          </button>
        </div>

        <div className="grid flex-1 gap-12 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-8">
          <div>
            <p className="mb-9 font-mono text-[10px] font-bold uppercase tracking-[0.38em] text-aura-gold">
              Explore the story
            </p>
            <div className="space-y-8">
              {chapters.map((chapter) => (
                <a
                  key={chapter.id}
                  href={`${chapterHrefPrefix}#${chapter.id}`}
                  onClick={onClose}
                  className="group block max-w-2xl"
                >
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-600">
                    Chapter {Number(chapter.chapter)}
                  </span>
                  <span className="mt-2 block font-display text-5xl font-black uppercase leading-[0.85] tracking-[-0.06em] text-white transition group-hover:text-aura-gold md:text-7xl">
                    {chapter.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-5 md:pl-10">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.38em] text-zinc-500">
              Site navigation
            </p>
            {siteNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className="flex min-h-14 items-center justify-center rounded border border-white/15 bg-white/[0.015] px-6 text-center text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-aura-gold hover:bg-aura-gold hover:text-black"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setIsLeadFormOpen(true)}
              className="mt-8 flex min-h-14 items-center justify-center border-b border-aura-gold/35 px-6 text-center text-xs font-black uppercase tracking-[0.18em] text-aura-gold transition hover:text-white"
            >
              Contact sales
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-5 font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
          <span>Premium NFC launch experience</span>
          <Link to="/pricing" onClick={onClose} className="hover:text-aura-gold">
            View pricing
          </Link>
          <Link to="/portal" onClick={onClose} className="hover:text-aura-gold">
            Client portal
          </Link>
          <span className="md:ml-auto">Aura Tap</span>
        </div>
      </div>
      <LeadFormModal
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        bundleName="Sales Consultation"
      />
    </div>
  );
}
