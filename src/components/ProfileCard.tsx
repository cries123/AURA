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
  jobTitle?: string;
  location?: string;
  tags?: string[];
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
      default: return 'text-amber-450 group-hover:text-[#f3d078]';
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
      <div className="w-full max-w-[420px] mx-auto min-h-screen bg-gradient-to-b from-[#070709] to-[#030304] text-white p-5 pt-8 pb-10 flex flex-col justify-between relative shadow-2xl rounded-none md:rounded-3xl border-0 md:border border-zinc-900/60">
        <ProfileContent data={data} isMockup={isMockup} handleSaveContact={handleSaveContact} getIcon={getIcon} getColor={getColor} />
      </div>
    );
  }

  // Unified high-fidelity smartphone device container for live dashboard editor mockup
  return (
    <div className="max-w-[340px] mx-auto relative aspect-[9/18.5] bg-[#050506] rounded-[3.2rem] border-[10px] border-zinc-900 shadow-2xl overflow-hidden shadow-aura-gold/10 flex flex-col justify-between">
      {/* Dynamic Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-zinc-900 rounded-b-2xl z-20" />
      
      {/* Content wrapper */}
      <div className="h-full w-full overflow-y-auto no-scrollbar bg-gradient-to-b from-[#070709] to-[#030304] text-white p-4 pt-10 pb-6 flex flex-col">
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

  // In the layout of the images, ALL links are shown as elegant rows.
  const activeLinks = data.links.filter(l => l.value);

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

  // Setup fallbacks for jobTitle, location, tags
  const jobTitle = data.jobTitle || 'Aura Representative';
  const location = data.location || 'Silicon Valley, CA';
  const tags = data.tags || ['NFC Smart Tap', 'Networking', 'Aura Cloud'];
  
  const getLinkLabel = (type: string) => {
    switch(type) {
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
    <div className="flex flex-col h-full w-full justify-between flex-grow">
      <div className="flex flex-col w-full">
        {/* Brand Header */}
        <div className="text-center w-full py-1.5 shrink-0 relative z-30">
          <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase font-semibold select-none">
            aura<span className="text-[#c49215]">.</span>
          </span>
        </div>

        {/* Curved Header Banner Section */}
        <div className="relative w-full h-[120px] overflow-hidden rounded-2xl bg-zinc-950 mt-1 shadow-inner shrink-0">
          {/* Wave/Mesh luxury gradient */}
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-radial from-[#c49215]/20 via-[#13131a] to-[#040406]" />
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#c49215]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-2 bg-[#c49215]/5 rounded-full blur-2xl rotate-12" />
          {/* Subtle design matrix/mesh lines */}
          <div className="absolute inset-0 bg-[#c49215]/[0.015] bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:12px_12px]" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-900 via-[#c49215]/20 to-zinc-900" />
        </div>

        {/* Left-aligned Profile Picture Overlap */}
        <div className="relative px-5 -mt-10 flex justify-start w-full z-10 shrink-0">
          <div className="relative group/avatar">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#c49215]/40 via-transparent to-white/10 opacity-70 blur-md group-hover/avatar:opacity-90 duration-500" />
            <div className="relative w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-[#c49215] via-zinc-800 to-white/30 flex items-center justify-center shadow-lg">
              <div className="w-full h-full rounded-full bg-[#050506] overflow-hidden flex items-center justify-center">
                {data.avatarUrl ? (
                  <img 
                    src={data.avatarUrl} 
                    alt={data.displayName} 
                    className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#c49215]/15 to-zinc-950 flex items-center justify-center">
                    <span className="text-2xl font-display font-medium italic text-[#dfba49]">
                      {(data.displayName || 'A').charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details and Info section */}
        <div className="px-5 text-left w-full mt-3.5 flex-grow">
          {/* Display Name */}
          <h2 className="text-lg font-sans font-extrabold tracking-tight text-white leading-tight">
            {data.displayName || 'Aura Member'}
          </h2>

          {/* Let's Connect headline */}
          <p className="text-zinc-400 font-sans font-medium text-[11px] mt-0.5">
            Let's connect
          </p>

          {/* Left vertical border section containing Job Role & Location */}
          <div className="border-l-2 border-[#c49215] pl-3.5 space-y-0.5 py-0.5 my-3 text-left">
            <p className="text-zinc-200 font-sans font-semibold text-[12px] tracking-wide">
              {jobTitle}
            </p>
            <p className="text-zinc-500 font-sans font-medium text-[10px]">
              {location}
            </p>
          </div>

          {/* Tags section (pills side-by-side) */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-full">
              {tags.map((tag, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 bg-[#0f0f13] border border-zinc-900 rounded-full text-[8.5px] font-sans font-semibold text-zinc-400 shadow-sm select-none"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Bio / Description */}
          {data.bio && (
            <p className="text-zinc-400 text-[10px] leading-relaxed mt-4 font-sans font-light bg-[#0b0b0e]/30 px-3 py-2.5 rounded-xl border border-zinc-900/40">
              {data.bio}
            </p>
          )}

          {/* Large Action Buttons Row */}
          <div className="flex items-center gap-2 mt-4 w-full">
            <button 
              onClick={handleSaveContact}
              className="flex-grow py-3 px-4 bg-gradient-to-r from-white via-zinc-100 to-zinc-200 text-black hover:from-[#dfba49] hover:to-[#c49215] font-sans font-bold text-[10.5px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5 text-black" />
              Save Contact
            </button>
            <button
              onClick={handleShareProfile}
              className="px-3.5 py-3 bg-[#0d0d12] border border-zinc-800 text-zinc-300 hover:text-white rounded-xl flex items-center justify-center hover:bg-[#121218] transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
              title="Share Card"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* divider bar */}
          <div className="h-[1px] w-full bg-zinc-900/80 my-4" />

          {/* Contact Link Rows list */}
          <div className="space-y-2 pb-6">
            {activeLinks.map((link, idx) => (
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
                  className="w-full p-3 bg-gradient-to-b from-[#0a0a0d] to-[#040405] hover:bg-[#0d0d12] hover:border-zinc-800/80 border border-zinc-900 rounded-xl flex items-center justify-between group transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8.5 h-8.5 rounded-full bg-[#121217] border border-zinc-800/80 flex items-center justify-center shrink-0 ${getColor(link.type)} group-hover:scale-105 duration-300`}>
                      {getIcon(link.type)}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-[11px] font-bold text-white tracking-wide shrink-0">
                        {link.label || getLinkLabel(link.type)}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5 truncate max-w-[170px]">
                        {link.value}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors duration-200 shrink-0" />
                </a>
              </motion.div>
            ))}

            {activeLinks.length === 0 && (
              <div className="text-center py-6 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20">
                <p className="text-zinc-650 text-[8.5px] uppercase font-bold tracking-wider">No active links</p>
                <p className="text-zinc-700 text-[8px] mt-0.5">Customize links in your dashboard editor</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verified Footer Badge */}
      <div className="pt-2 pb-1 text-center text-zinc-600 font-mono tracking-[0.16em] text-[7.5px] uppercase font-bold flex items-center justify-center gap-1.5 opacity-60 shrink-0 select-none">
        <span className="w-1 h-1 bg-[#c49215] rounded-full shadow-[0_0_6px_#c49215] animate-pulse" />
        <span>Verified Aura NFC Member</span>
      </div>
    </div>
  );
}
