import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, ExternalLink, AlertCircle, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ProfileCard from '../components/ProfileCard';

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      if (!username) return;
      setLoading(true);
      setError(null);

      try {
        const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
        
        if (!usernameDoc.exists()) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('username', '==', username.toLowerCase()));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            setError('Aura Profile not found');
            setLoading(false);
            return;
          }
          setProfile(querySnapshot.docs[0].data());
        } else {
          const { uid } = usernameDoc.data();
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data());
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-aura-gold border-t-transparent rounded-full"
        />
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
                  title: `${profile.displayName}'s Aura Card`,
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
