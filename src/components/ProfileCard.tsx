import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Instagram, Twitter, Linkedin, Globe, Phone, Mail, ExternalLink, ChevronRight, Link as LinkIcon } from 'lucide-react';

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
      case 'instagram': return 'text-pink-500';
      case 'twitter': return 'text-blue-400';
      case 'linkedin': return 'text-blue-600';
      case 'phone': return 'text-green-500';
      case 'email': return 'text-purple-400';
      default: return 'text-emerald-400';
    }
  };

  const handleSaveContact = () => {
    // Generate simple vCard data
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

  if (isMockup) {
    return (
      <div className="max-w-[325px] mx-auto relative aspect-[9/18.5] bg-[#070707] rounded-[3rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden shadow-aura-gold/5">
        {/* Dynamic Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-zinc-900 rounded-b-2xl z-20" />
        
        {/* Content wrapper */}
        <div className="h-full w-full overflow-y-auto no-scrollbar bg-[#070707] text-white p-6 pt-12">
          <ProfileContent data={data} handleSaveContact={handleSaveContact} getIcon={getIcon} getColor={getColor} />
        </div>
      </div>
    );
  }

  // Live screen landing preview (full screen adapted container)
  return (
    <div className="w-full max-w-lg mx-auto bg-zinc-950/40 backdrop-blur-md rounded-3xl border border-zinc-800/80 p-8 shadow-2xl shadow-aura-gold/5">
      <ProfileContent data={data} handleSaveContact={handleSaveContact} getIcon={getIcon} getColor={getColor} />
    </div>
  );
}

function ProfileContent({ 
  data, 
  handleSaveContact, 
  getIcon, 
  getColor 
}: { 
  data: ProfileData; 
  handleSaveContact: () => void; 
  getIcon: (type: string) => ReactNode; 
  getColor: (type: string) => string; 
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      
      {/* Avatar Area */}
      <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center overflow-hidden shadow-lg shadow-black/40">
        {data.avatarUrl ? (
          <img 
            src={data.avatarUrl} 
            alt={data.displayName} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-aura-gold/20 to-zinc-900 flex items-center justify-center bg-zinc-950">
            <span className="text-2xl font-bold text-aura-gold">
              {(data.displayName || 'A').charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      {/* User Meta */}
      <div className="text-center w-full">
        <h2 className="text-xl font-display font-medium italic text-white truncate px-2">
          {data.displayName || 'Aura User'}
        </h2>
        <p className="text-aura-gold text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5">
          @{data.username || 'handle'}
        </p>
        <p className="text-zinc-500 text-xs mt-4 line-clamp-3 leading-relaxed px-4">
          {data.bio || 'Your bio will appear here once you type something...'}
        </p>
      </div>

      {/* Actions & Links */}
      <div className="w-full space-y-3 mt-2 pb-2">
        <button 
          onClick={handleSaveContact}
          className="w-full py-3 bg-white text-black hover:bg-aura-gold hover:text-black transition-colors rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-md shadow-white/5 active:scale-95 duration-150"
        >
          Save Contact
        </button>
        
        {data.links.filter(l => l.value).map((link, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <a 
              href={link.type === 'phone' ? `tel:${link.value}` : link.type === 'email' ? `mailto:${link.value}` : link.value}
              target={link.type !== 'phone' && link.type !== 'email' ? "_blank" : undefined}
              rel="noreferrer"
              className="w-full p-4 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-aura-gold/30 border border-zinc-800/80 rounded-2xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-center shrink-0 ${getColor(link.type)}`}>
                  {getIcon(link.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white truncate">
                    {link.label || link.type}
                  </p>
                  <p className="text-[9px] text-zinc-500 mt-0.5 truncate max-w-[130px] whitespace-nowrap overflow-hidden">
                    {link.value}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-aura-gold transition-colors shrink-0" />
            </a>
          </motion.div>
        ))}

        {data.links.filter(l => l.value).length === 0 && (
          <div className="text-center py-8 border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">No Links Added Yet</p>
          </div>
        )}
      </div>

    </div>
  );
}

