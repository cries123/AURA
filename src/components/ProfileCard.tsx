import { ReactNode, useState } from 'react';
import { motion } from 'motion/react';
import { Instagram, Twitter, Linkedin, Globe, Phone, Mail, ChevronRight, UserPlus, Sparkles, Share2 } from 'lucide-react';

interface AuraLink {
  type: string;
  label: string;
  value: string;
}

interface ProfileData {
  displayName: string;
  bio: string;
  avatarUrl?: string;
  username?: string;
  links: AuraLink[];
  themeColor?: string;
}

// Ensure external URLs do not resolve as relative links inside the app routing environment
function ensureAbsoluteUrl(url: string) {
  if (!url) return '';
  const trimmed = url.trim();
  // Standard protocol check
  if (/^(?:f|ht)tps?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  // No-protocol double-slash fallback
  if (trimmed.startsWith('//')) {
    return trimmed;
  }
  // Return early for communication URI components
  if (/^(?:mailto|tel):/i.test(trimmed)) {
    return trimmed;
  }
  // Otherwise prepend protocol for secure browsing
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
      default: return 'text-amber-400 group-hover:text-[#f3d078]';
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
      <div className="w-full max-w-[412px] mx-auto min-h-screen bg-gradient-to-b from-[#070709] to-[#030304] text-white p-6 pt-10 pb-8 flex flex-col justify-between relative shadow-2xl">
        <ProfileContent data={data} isMockup={isMockup} handleSaveContact={handleSaveContact} getIcon={getIcon} getColor={getColor} />
      </div>
    );
  }

  // We unify the card views to render the exact same premium, high-fidelity smartphone device card
  return (
    <div className="max-w-[340px] mx-auto relative aspect-[9/18.5] bg-[#050506] rounded-[3.2rem] border-[10px] border-zinc-900 shadow-2xl overflow-hidden shadow-aura-gold/10 flex flex-col justify-between">
      {/* Dynamic Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-zinc-900 rounded-b-2xl z-20" />
      
      {/* Content wrapper */}
      <div className="h-full w-full overflow-y-auto no-scrollbar bg-gradient-to-b from-[#070709] to-[#030304] text-white p-5 pt-10 pb-6 flex flex-col">
        <ProfileContent data={data} isMockup={isMockup} handleSaveContact={handleSaveContact} getIcon={getIcon} getColor={getColor} />
      </div>
    </div>
  );
}

function ProfileContent({ 
  data, 
  isMockup,
  handleSaveContact, 
  getIcon, 
  getColor 
}: { 
  data: ProfileData; 
  isMockup: boolean;
  handleSaveContact: () => void; 
  getIcon: (type: string) => ReactNode; 
  getColor: (type: string) => string; 
}) {
  const [copied, setCopied] = useState(false);

  // Partition links for professional balance: Compact socials vs detail cards
  const socials = data.links.filter(l => l.value && ['instagram', 'twitter', 'linkedin'].includes(l.type));
  const otherLinks = data.links.filter(l => l.value && !['instagram', 'twitter', 'linkedin'].includes(l.type));

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/${data.username || ''}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${data.displayName || 'Aura Member'} - Digital Card`,
        text: data.bio || `Check out my Aura digital card!`,
        url: profileUrl,
      }).catch(() => {
        copyFallback(profileUrl);
      });
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

  return (
    <div className="flex flex-col items-center gap-5 flex-grow justify-start">
      
      {/* Wave Signal Branding */}
      <div className="flex justify-center items-center gap-1 opacity-25 mt-1 animate-pulse">
        <div className="w-[3px] h-[8px] rounded bg-white"></div>
        <div className="w-[3px] h-[12px] rounded bg-white"></div>
        <div className="w-[3px] h-[16px] rounded bg-white"></div>
        <span className="text-[6px] uppercase tracking-[0.4em] font-mono whitespace-nowrap ml-1.5 font-bold">Aura Secure NFC</span>
      </div>

      {/* Avatar Area with Premium Gold Ripple Ring */}
      <div className="relative group/avatar mt-2">
        <div className="absolute -inset-2 rounded-full bg-gradient-radial from-aura-gold/40 via-yellow-600/5 to-transparent blur-lg opacity-60 group-hover/avatar:opacity-90 transition-opacity duration-700" />
        <div className="relative w-24 h-24 rounded-full p-[2.5px] bg-gradient-to-tr from-[#c49215] via-zinc-800 to-white/40 hover:via-aura-gold/50 transition-all duration-700 flex items-center justify-center shadow-[0_0_20px_rgba(196,146,21,0.15)] group-hover/avatar:shadow-[0_0_30px_rgba(196,146,21,0.3)]">
          <div className="w-full h-full rounded-full bg-[#0a0a0c] overflow-hidden flex items-center justify-center">
            {data.avatarUrl ? (
              <img 
                src={data.avatarUrl} 
                alt={data.displayName} 
                className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform duration-500" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-aura-gold/15 to-zinc-950 flex items-center justify-center">
                <span className="text-3xl font-display font-medium italic text-aura-gold">
                  {(data.displayName || 'A').charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Floating member sparkle */}
        <div className="absolute -bottom-1 -right-1 bg-zinc-950 border border-zinc-800/80 rounded-full p-1.5 shadow-lg flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-aura-gold animate-pulse duration-[3s]" />
        </div>
      </div>
      
      {/* User Meta with Luxury Editorial Styling */}
      <div className="text-center w-full">
        <h2 className="text-2xl font-display font-medium tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent italic px-2">
          {data.displayName || 'Aura Member'}
        </h2>
        
        {/* Verified Handle Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-b from-[#111] to-[#060607] border border-zinc-900 shadow-inner mt-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-aura-gold shadow-[0_0_8px_rgba(196,146,21,1)]" />
          <p className="text-zinc-300 text-[9.5px] font-mono tracking-wider">
            {data.username ? `@${data.username}` : 'member'}
          </p>
        </div>

        <p className="text-zinc-400 text-[11px] leading-relaxed mt-4 px-4 max-w-sm mx-auto font-sans font-light">
          {data.bio || 'Your personalized professional bio will appear beautifully here once setup.'}
        </p>
      </div>

      {/* Actions & Links Area */}
      <div className="w-full space-y-4 mt-2">
        {/* Gold Shimmer Save Contact Button */}
        <button 
          onClick={handleSaveContact}
          className="relative w-full py-[13px] bg-gradient-to-b from-white via-zinc-100 to-zinc-200 text-black hover:from-white hover:to-aura-gold transition-all duration-500 rounded-2xl text-[9px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 overflow-hidden shadow-lg hover:shadow-aura-gold/10 hover:scale-[1.01] active:scale-[0.98] outline-none border border-white/10 group/btn"
        >
          <UserPlus className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform text-current" />
          Add to Contacts
        </button>

        {/* Dynamic Social Network Grid (Instagram, Twitter, LinkedIn) */}
        {socials.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {socials.map((link, idx) => (
              <a
                key={idx}
                href={ensureAbsoluteUrl(link.value)}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-1.5 bg-gradient-to-b from-[#0b0b0d] to-[#040405] border border-zinc-900/90 hover:border-aura-gold/40 hover:bg-[#0c0c0e] rounded-xl flex flex-col items-center justify-center gap-1.5 group transition-all duration-300 shadow-sm"
              >
                <div className={`${getColor(link.type)} group-hover:scale-110 transition-transform duration-300`}>
                  {getIcon(link.type)}
                </div>
                <span className="text-[7.5px] font-mono tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors truncate max-w-full font-semibold uppercase">
                  {link.label || link.type}
                </span>
              </a>
            ))}
          </div>
        )}
        
        {/* Detailed direct/other link list rows */}
        <div className="space-y-2.5">
          {otherLinks.map((link, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <a 
                href={link.type === 'phone' ? `tel:${link.value}` : link.type === 'email' ? `mailto:${link.value}` : ensureAbsoluteUrl(link.value)}
                target={link.type !== 'phone' && link.type !== 'email' ? "_blank" : undefined}
                rel="noreferrer"
                className="w-full p-4 bg-gradient-to-b from-[#0b0b0c]/90 to-[#040405]/95 hover:bg-[#0e0e11] hover:border-aura-gold/30 border border-zinc-900/95 rounded-2xl flex items-center justify-between group transition-all duration-300 shadow-sm"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-9 h-9 rounded-xl bg-[#030304] border border-zinc-900 flex items-center justify-center shrink-0 ${getColor(link.type)} group-hover:scale-105 duration-300`}>
                    {getIcon(link.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-zinc-300 group-hover:text-white transition-colors truncate">
                      {link.label || link.type}
                    </p>
                    <p className="text-[9px] text-[#555] group-hover:text-zinc-500 mt-0.5 truncate max-w-[155px] whitespace-nowrap overflow-hidden transition-colors">
                      {link.value}
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-center group-hover:border-aura-gold/20 group-hover:bg-[#060608] transition-all shrink-0">
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-aura-gold transition-colors" />
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        {socials.length === 0 && otherLinks.length === 0 && (
          <div className="text-center py-7 border border-dashed border-zinc-805/50 rounded-2xl bg-zinc-950/20">
            <p className="text-zinc-650 text-[8.5px] uppercase font-bold tracking-[0.2em]">Contact Card Live</p>
            <p className="text-zinc-700 text-[8px] mt-1">Configure active links in your workspace dashboard</p>
          </div>
        )}

        {/* Footer Brand Call-To-Action buttons strictly at the bottom of the Card */}
        <div className="pt-4 border-t border-zinc-900/80 flex items-center gap-2.5 w-full shrink-0">
          <a
            href="/"
            className="flex-1 h-11 bg-gradient-to-r from-aura-gold via-[#dfba49] to-[#c49215] text-zinc-950 hover:brightness-110 active:scale-[0.97] transition-all duration-300 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(196,146,21,0.25)]"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            Get Your Card
          </a>
          <button
            onClick={handleShareProfile}
            className="flex-1 h-11 bg-gradient-to-b from-[#0e0e11] to-[#050507] hover:from-[#131318] hover:to-[#09090c] border border-zinc-850 hover:border-aura-gold/45 text-zinc-300 hover:text-white active:scale-[0.97] transition-all duration-300 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            {copied ? "Copied!" : "Share Link"}
          </button>
        </div>

        {/* Verified Badge */}
        <div className="pt-3 text-center text-zinc-500 font-mono tracking-[0.2em] text-[8px] uppercase font-bold flex items-center justify-center gap-1.5 opacity-60">
          <span className="w-1 h-1 bg-aura-gold rounded-full shadow-[0_0_6px_#c49215] animate-pulse" />
          <span>Verified Aura Member</span>
        </div>

      </div>

    </div>
  );
}
