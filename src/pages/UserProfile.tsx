import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, ExternalLink, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ProfileCard from '../components/ProfileCard';

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const lowerUsername = username?.toLowerCase() || '';
  const cacheKey = `aura_profile_cache_${lowerUsername}`;

  // State initialized with cached profile for instant (0ms) render if visited before
  const [profile, setProfile] = useState<any>(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }
    return null;
  });

  // If we have cached profile data, we can show it immediately (not loading) while refreshing in background
  const [loading, setLoading] = useState(!profile);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.displayName) {
      document.title = `${profile.displayName} (@${profile.username || username}) | Aura`;
    } else {
      document.title = `Aura Profile | @${username}`;
    }
  }, [profile, username]);

  useEffect(() => {
    let active = true;

    async function fetchProfile() {
      if (!username) return;
      
      // If we don't have cached profile, show loading skeleton
      if (!profile) {
        setLoading(true);
      }
      setError(null);

      try {
        // Promise timeout wrapper (4 seconds max before fallback or error)
        const fetchPromise = (async () => {
          const usernameDoc = await getDoc(doc(db, 'usernames', lowerUsername));
          
          if (!usernameDoc.exists()) {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', lowerUsername));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
              return { error: 'Aura Profile not found' };
            }
            return { data: querySnapshot.docs[0].data() };
          } else {
            const { uid } = usernameDoc.data();
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
              return { data: userDoc.data() };
            } else {
              return { error: 'Aura Profile disconnected' };
            }
          }
        })();

        const timeoutPromise = new Promise<{ error?: string; data?: any }>((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 4000)
        );

        const result = await Promise.race([fetchPromise, timeoutPromise]);

        if (!active) return;

        if (result.error) {
          // If we have cached profile, don't break the screen, just keep showing cached version
          if (!profile) {
            setError(result.error);
          }
        } else if (result.data) {
          setProfile(result.data);
          try {
            // Update cache silently
            localStorage.setItem(cacheKey, JSON.stringify(result.data));
          } catch (e) {
            console.warn('Cache write error:', e);
          }
        }
      } catch (err: any) {
        console.error('Fetch profile error:', err);
        if (!profile) {
          setError(err.message || 'Failed to fetch profile');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      active = false;
    };
  }, [username, lowerUsername, cacheKey]);

  // Premium Custom Brand Loader (Fulfilling image reference request)
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-black text-white relative flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center justify-center gap-10 text-center">
          {/* Logo */}
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-display font-black italic tracking-[0.12em] text-white"
          >
            AURA
          </motion.h1>

          {/* Golden Spinner Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative w-14 h-14 flex items-center justify-center"
          >
            <div className="absolute inset-0 border-2 border-zinc-900/60 rounded-full" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-t-aura-gold border-r-aura-gold/20 border-b-transparent border-l-transparent rounded-full"
            />
          </motion.div>

          {/* Loading Aura Status Title */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mt-2 font-sans"
          >
            LOADING AURA
          </motion.p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
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

  return (
    <div className="min-h-screen bg-[#070707] text-white relative flex flex-col items-center py-20 px-6">
      {/* Background Ambience */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg aspect-square bg-aura-gold/10 rounded-full blur-[140px] -translate-y-1/2 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <ProfileCard data={profile} isMockup={false} />

        <div className="mt-12 text-center text-zinc-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-8">
            Verified Aura Member
          </div>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => {
                navigator.share({
                  title: `${profile.displayName ?? 'Aura'}'s Aura Card`,
                  url: window.location.href
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.href);
                });
              }}
              className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:text-aura-gold transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <Link 
              to="/"
              className="px-8 h-14 bg-white text-aura-black font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-aura-gold transition-all flex items-center gap-3"
            >
              Get Your Card <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
