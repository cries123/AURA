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
          try {
            // Attempt 1: Direct fast query on 'users' collection (1 network roundtrip instead of 2)
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', lowerUsername));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              return { data: querySnapshot.docs[0].data() };
            }
          } catch (queryErr) {
            console.warn('Direct users query failed, trying sequential path:', queryErr);
          }

          // Attempt 2: Fallback to sequential path check
          const usernameDoc = await getDoc(doc(db, 'usernames', lowerUsername));
          
          if (!usernameDoc.exists()) {
            return { error: 'Aura Profile not found' };
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

  // Minimal subtle loading spinner
  if (loading && !profile) {
    return (
      <div id="loading-spinner-container" className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div id="subtle-spinner" className="w-6 h-6 border-2 border-aura-gold/20 border-t-aura-gold rounded-full animate-spin" />
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

        <div className="mt-8 text-center text-zinc-600 font-sans tracking-wide text-[8.5px] uppercase font-bold flex flex-col items-center gap-2">
          <div className="w-1 h-1 bg-aura-gold rounded-full shadow-[0_0_8px_#d4af37] animate-pulse" />
          <span>Verified Aura Member</span>
        </div>
      </motion.div>
    </div>
  );
}
