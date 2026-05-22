import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Twitter, Linkedin, Globe, Phone, Mail, Link as LinkIcon, Share2, Download, ExternalLink, ChevronRight, AlertCircle } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface AuraLink {
  type: string;
  label: string;
  value: string;
}

interface UserProfileData {
  uid: string;
  username: string;
  displayName?: string;
  bio?: string;
  profileImage?: string;
  links?: AuraLink[];
}

const LINK_ICONS: Record<string, any> = {
  instagram: <Instagram className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  website: <Globe className="w-5 h-5" />,
  phone: <Phone className="w-5 h-5" />,
  email: <Mail className="w-5 h-5" />,
  other: <LinkIcon className="w-5 h-5" />,
};

const LINK_COLORS: Record<string, string> = {
  instagram: 'bg-gradient-to-br from-purple-600 to-pink-500',
  twitter: 'bg-blue-400',
  linkedin: 'bg-blue-600',
  website: 'bg-emerald-500',
  phone: 'bg-green-500',
  email: 'bg-amber-500',
  other: 'bg-zinc-700',
};

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      if (!username) return;
      setLoading(true);
      setError(null);

      try {
        // 1. Lookup UID from usernames collection
        const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
        
        if (!usernameDoc.exists()) {
          // Fallback: try direct query on users collection (slower but safer if sync failed)
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('username', '==', username.toLowerCase()));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            setError('Aura Profile not found');
            setLoading(false);
            return;
          }
          setProfile(querySnapshot.docs[0].data() as UserProfileData);
        } else {
          const { uid } = usernameDoc.data();
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfileData);
          } else {
            setError('Aura Profile disconnected');
          }
        }
      } catch (err: any) {
        console.error('Fetch profile error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-aura-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-aura-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-aura-black flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-display font-medium italic mb-2">Profile Lost.</h1>
        <p className="text-zinc-500 text-sm max-w-xs mb-8">The handle "{username}" doesn't exist or is currently inactive.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-white text-aura-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-aura-gold transition-all"
        >
          Return to Aura
        </button>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${profile.displayName}'s Aura Tap Profile`,
        url: window.location.href
      });
    } catch (err) {
      // Fallback for desktop: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const getProfileLink = (link: AuraLink) => {
    if (link.type === 'phone') return `tel:${link.value}`;
    if (link.type === 'email') return `mailto:${link.value}`;
    if (link.value.startsWith('http')) return link.value;
    return `https://${link.value}`;
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white relative flex flex-col items-center">
      {/* Background Ambience */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg aspect-square bg-aura-gold/10 rounded-full blur-[140px] -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-aura-gold/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md px-6 pt-16 pb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          {/* Main Identity Card */}
          <section className="relative p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-2xl overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-aura-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-zinc-900 border-2 border-zinc-800 p-1.5 ring-4 ring-white/5 transition-all duration-500">
                  <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden bg-gradient-to-br from-aura-gold/20 via-zinc-900 to-zinc-950">
                    <span className="text-3xl font-display italic font-medium text-aura-gold-light">
                      {(profile.displayName || profile.username).charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-black border-[3px] border-[#070707] shadow-xl">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <h1 className="text-3xl font-display font-medium italic tracking-tight mb-1 text-white">{profile.displayName || profile.username}</h1>
              <p className="text-aura-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 opacity-80">@{profile.username}</p>
              
              {profile.bio ? (
                <p className="text-zinc-400 text-xs leading-relaxed max-w-[240px] mx-auto">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-zinc-600 text-xs italic">Aura Member</p>
              )}
            </div>
          </section>

          {/* Primary Action */}
          <div className="flex gap-3">
            <button className="flex-1 h-14 bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2.5 hover:bg-aura-gold transition-all shadow-xl shadow-white/5 active:scale-95">
              <Download className="w-4 h-4" /> Save Contact
            </button>
            <button 
              onClick={handleShare}
              className="w-14 h-14 bg-zinc-900/50 border border-white/5 text-zinc-400 rounded-2xl flex items-center justify-center hover:text-white hover:border-zinc-700 transition-all active:scale-95"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Links Grid */}
          <div className="space-y-3.5">
            {profile.links?.map((link, idx) => (
              <motion.a
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                href={getProfileLink(link)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-4 bg-zinc-900/40 border border-white/5 rounded-[1.25rem] hover:bg-zinc-800/60 hover:border-white/10 transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white/90 shadow-lg shrink-0 ${LINK_COLORS[link.type] || 'bg-zinc-800'}`}>
                      {LINK_ICONS[link.type] || <LinkIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-white/90 tracking-wide group-hover:text-aura-gold transition-colors">{link.label || link.type}</h3>
                      <p className="text-[10px] text-zinc-500 lowercase mt-0.5 max-w-[160px] truncate">{link.value}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <ExternalLink className="w-3 h-3 text-aura-gold" />
                  </div>
                </div>
              </motion.a>
            ))}

            {(!profile.links || profile.links.length === 0) && (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
                <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium">Digital Presence Pending</p>
              </div>
            )}
          </div>

          {/* Footer Branding */}
          <div className="pt-12 text-center pb-8">
            <a href="/" className="inline-flex flex-col items-center gap-3 opacity-20 hover:opacity-100 transition-all">
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500">Issued by</span>
              <img src="/logo.svg" alt="Aura Tap" className="h-4 brightness-0 invert" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}
