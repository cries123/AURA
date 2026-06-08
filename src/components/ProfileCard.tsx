import { ReactNode, useState } from 'react';
import { motion } from 'motion/react';
import { Instagram, Twitter, Linkedin, Globe, Phone, Mail, ChevronRight, UserPlus, Share2, BadgeCheck } from 'lucide-react';

interface AuraLink {
  type: string;
  label: string;
  value: string;
}

interface ProfileData {
  displayName: string;
  bio: string;
  avatarUrl?: string;
  bannerUrl?: string;
  username?: string;
  links: AuraLink[];
  themeColor?: string;
  jobTitle?: string;
  location?: string;
  tags?: string[];
}

function ensureAbsoluteUrl(url: string) {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(?:f|ht)tps?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return trimmed;
  if (/^(?:mailto|tel):/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function ProfileCard({ data, isMockup = true }: { data: ProfileData; isMockup?: boolean }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'instagram': return 'text-pink-400 group-hover:text-pink-300';
      case 'twitter': return 'text-sky-400 group-hover:text-sky-300';
      case 'linkedin': return 'text-indigo-400 group-hover:text-indigo-300';
      case 'phone': return 'text-emerald-400 group-hover:text-emerald-300';
      case 'email': return 'text-purple-400 group-hover:text-purple-300';
      default: return 'text-aura-gold group-hover:text-white';
    }
  };

  const handleSaveContact = () => {
    const phoneLink = data.links.find(l => l.type === 'phone')?.value || '';
    const emailLink = data.links.find(l => l.type === 'email')?.value || '';

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${data.displayName || 'Aura Contact'}
TEL;TYPE=CELL:${phoneLink}
EMAIL;TYPE=INTERNET:${emailLink}
NOTE:Aura Member profile - https://aurataps.net/${data.username || ''}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.displayName || 'contact'}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isMockup) {
    return (
      <div className="relative w-full max-w-md mx-auto min-h-screen">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-aura-gold/10 blur-[120px]" />
          <div className="absolute bottom-24 -right-16 h-56 w-56 rounded-full bg-aura-lime/5 blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
        </div>

        <div className="relative z-10 min-h-screen border-x border-white/[0.04] bg-[#030304]/90 shadow-[0_0_80px_rgba(0,0,0,0.65)] backdrop-blur-sm">
          <ProfileContent
            data={data}
            isMockup={isMockup}
            handleSaveContact={handleSaveContact}
            getIcon={getIcon}
            getColor={getColor}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[340px] mx-auto relative aspect-[9/18.5] bg-[#050506] rounded-[3.2rem] border-[10px] border-zinc-900 shadow-2xl overflow-hidden shadow-aura-gold/10 flex flex-col justify-between">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-zinc-900 rounded-b-2xl z-20" />
      <div className="h-full w-full overflow-y-auto no-scrollbar bg-[#030304] text-white p-4 pt-10 pb-6 flex flex-col">
        <ProfileContent
          data={data}
          isMockup={isMockup}
          handleSaveContact={handleSaveContact}
          getIcon={getIcon}
          getColor={getColor}
        />
      </div>
    </div>
  );
}

function ProfileContent({
  data,
  isMockup,
  handleSaveContact,
  getIcon,
  getColor,
}: {
  data: ProfileData;
  isMockup: boolean;
  handleSaveContact: () => void;
  getIcon: (type: string) => ReactNode;
  getColor: (type: string) => string;
}) {
  const [copied, setCopied] = useState(false);
  const activeLinks = data.links.filter(l => l.value);

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/${data.username || ''}`;

    if (navigator.share) {
      navigator.share({
        title: `${data.displayName || 'Aura Member'} - Digital Card`,
        text: data.bio || 'Check out my Aura digital card!',
        url: profileUrl,
      }).catch(() => copyFallback(profileUrl));
    } else {
      copyFallback(profileUrl);
    }
  };

  const copyFallback = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const jobTitle = isMockup ? (data.jobTitle || 'Aura Representative') : data.jobTitle;
  const location = isMockup ? (data.location || 'Silicon Valley, CA') : data.location;
  const tags = isMockup ? (data.tags?.length ? data.tags : ['NFC Smart Tap', 'Networking', 'Aura Cloud']) : (data.tags || []);
  const handle = data.username || (isMockup ? 'handle' : '');

  const getLinkLabel = (type: string) => {
    switch (type) {
      case 'instagram': return 'Instagram';
      case 'twitter': return 'Twitter';
      case 'linkedin': return 'LinkedIn';
      case 'phone': return 'Phone';
      case 'email': return 'Email';
      case 'website': return 'Website';
      default: return 'Link';
    }
  };

  return (
    <div className={`flex flex-col h-full w-full ${isMockup ? '' : 'px-0'}`}>
      <div className="flex flex-col w-full flex-grow">
        <div className={`text-center w-full shrink-0 relative z-30 ${isMockup ? 'py-1.5' : 'py-5'}`}>
          <span className="font-display text-[11px] font-bold tracking-[0.42em] text-zinc-500 uppercase select-none">
            Aura<span className="text-aura-gold">.</span>
          </span>
        </div>

        <div className={`relative w-full overflow-hidden shrink-0 ${isMockup ? 'h-[132px] rounded-[1.35rem] mt-1' : 'h-[168px] rounded-none'}`}>
          {data.bannerUrl ? (
            <img
              src={data.bannerUrl}
              alt={`${data.displayName || 'Aura'} banner`}
              className="absolute inset-0 h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(232,215,162,0.28),transparent_32%),radial-gradient(circle_at_88%_68%,rgba(184,255,44,0.14),transparent_28%),linear-gradient(160deg,#14120f_0%,#050506_55%,#000000_100%)]" />
              <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:18px_18px]" />
              <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-aura-gold/15 blur-3xl aura-pulse-ring" />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030304] to-transparent" />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030304] via-transparent to-black/25" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aura-gold/50 to-transparent" />
        </div>

        <div className={`relative flex justify-start w-full z-10 shrink-0 ${isMockup ? 'px-5 -mt-10' : 'px-6 -mt-12'}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative group/avatar"
          >
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-aura-gold/50 via-aura-lime/15 to-transparent opacity-80 blur-lg" />
            <div className={`relative rounded-full p-[3px] bg-gradient-to-br from-aura-gold via-zinc-700 to-white/20 shadow-[0_12px_40px_rgba(232,215,162,0.18)] ${isMockup ? 'w-20 h-20' : 'w-24 h-24'}`}>
              <div className="w-full h-full rounded-full bg-[#030304] overflow-hidden flex items-center justify-center">
                {data.avatarUrl ? (
                  <img
                    src={data.avatarUrl}
                    alt={data.displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-aura-gold/20 to-zinc-950 flex items-center justify-center">
                    <span className={`font-display font-bold italic text-aura-gold ${isMockup ? 'text-2xl' : 'text-3xl'}`}>
                      {(data.displayName || 'A').charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className={`text-left w-full flex-grow ${isMockup ? 'px-5 mt-3.5' : 'px-6 mt-5'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className={`font-display font-bold tracking-[-0.03em] text-white leading-[1.05] ${isMockup ? 'text-lg' : 'text-[1.75rem]'}`}>
                {data.displayName || 'Aura Member'}
              </h1>
              {handle && (
                <p className="mt-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-aura-gold/90 uppercase">
                  @{handle}
                </p>
              )}
            </div>
            {!isMockup && (
              <div className="shrink-0 rounded-full border border-aura-gold/20 bg-aura-gold/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-aura-gold">
                Live
              </div>
            )}
          </div>

          {(jobTitle || location) && (
            <div className="mt-4 border-l-2 border-aura-gold/80 pl-4 py-0.5">
              {jobTitle && (
                <p className="text-sm font-semibold text-white tracking-wide">{jobTitle}</p>
              )}
              {location && (
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">{location}</p>
              )}
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-400 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {data.bio && (
            <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3.5 backdrop-blur-md">
              <p className={`text-zinc-300 leading-relaxed ${isMockup ? 'text-[10px]' : 'text-sm'}`}>
                {data.bio}
              </p>
            </div>
          )}

          <div className={`flex items-center gap-2.5 w-full ${isMockup ? 'mt-4' : 'mt-6'}`}>
            <button
              onClick={handleSaveContact}
              className="group flex-grow relative overflow-hidden rounded-2xl border border-aura-gold/25 bg-gradient-to-r from-[#12110d] via-[#0a0a0a] to-[#12110d] px-4 py-3.5 font-bold text-[11px] uppercase tracking-[0.18em] text-aura-gold transition-all duration-300 hover:border-aura-gold/50 hover:text-white active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-aura-gold/0 via-aura-gold/10 to-aura-gold/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                Save Contact
              </span>
            </button>
            <button
              onClick={handleShareProfile}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-zinc-300 transition-all duration-300 hover:border-aura-gold/30 hover:text-white active:scale-95"
              title={copied ? 'Link copied' : 'Share card'}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className={`space-y-2.5 ${isMockup ? 'pb-6' : 'pb-8'}`}>
            {activeLinks.map((link, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + idx * 0.05 }}
              >
                <a
                  href={link.type === 'phone' ? `tel:${link.value}` : link.type === 'email' ? `mailto:${link.value}` : ensureAbsoluteUrl(link.value)}
                  target={link.type !== 'phone' && link.type !== 'email' ? '_blank' : undefined}
                  rel="noreferrer"
                  className="group flex w-full items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-all duration-300 hover:border-aura-gold/25 hover:bg-white/[0.04] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 ${getColor(link.type)}`}>
                      {getIcon(link.type)}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-white">
                        {link.label || getLinkLabel(link.type)}
                      </p>
                      <p className="mt-1 truncate font-mono text-[10px] text-zinc-500">
                        {link.value}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-aura-gold" />
                </a>
              </motion.div>
            ))}

            {activeLinks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-8 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">No links yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className={`shrink-0 text-center ${isMockup ? 'pt-2 pb-1' : 'px-6 pb-8 pt-2'}`}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-500">
          <BadgeCheck className="h-3.5 w-3.5 text-aura-gold" />
          <span>Verified Aura NFC Member</span>
        </div>
      </div>
    </div>
  );
}
