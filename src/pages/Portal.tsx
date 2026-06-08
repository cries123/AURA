import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Shield, Users, Briefcase, LogIn, UserPlus, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import AffiliateDashboard from '../components/dashboard/AffiliateDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ProfileDashboard from '../components/dashboard/ProfileDashboard';
import { isAdminEmail } from '../lib/adminAccess';

type PortalView = 'selection' | 'login' | 'enroll' | 'dashboard';
type UserRole = 'user' | 'affiliate' | 'admin';
type DashboardTab = 'admin' | 'affiliate' | 'profile' | 'selection';

export default function Portal() {
  const { user, userProfile, loading, isAdmin, isAffiliate, logout } = useAuth();
  const [view, setView] = useState<PortalView>('selection');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab | null>(null);
  const [pendingApp, setPendingApp] = useState(false);

  // Initialize active tab when user logs in
  useEffect(() => {
    if (userProfile && !activeTab) {
      if (userProfile.role === 'admin') setActiveTab('admin');
      else if (userProfile.role === 'affiliate') setActiveTab('affiliate');
      else setActiveTab('selection');
    }
  }, [userProfile, activeTab]);

  function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.uid,
        email: user?.email,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }

  useEffect(() => {
    async function checkApp() {
      if (!user || !db) return;
      try {
        console.log('Checking application for UID:', user.uid);
        const q = query(collection(db, 'affiliate_applications'), where('uid', '==', user.uid), where('status', '==', 'pending'));
        const snap = await getDocs(q);
        setPendingApp(!snap.empty);
      } catch (err) {
        handleFirestoreError(err, 'list', 'affiliate_applications');
      }
    }
    if (userProfile && (userProfile.role === 'user' || userProfile.role === 'admin')) checkApp();
  }, [user, userProfile]);

  const handleGoogleLogin = async () => {
    if (!auth) {
      setError('Firebase not configured. Please add API keys.');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) {
      setError('Firebase not configured. Please add API keys.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      if (view === 'enroll') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const profilePath = `users/${userCredential.user.uid}`;
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: email,
            role: isAdminEmail(email) ? 'admin' : selectedRole,
            createdAt: new Date().toISOString()
          });
        } catch (err) {
          handleFirestoreError(err, 'write', profilePath);
          throw err;
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-aura-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && userProfile) {
    const handleJoinProgram = async () => {
      if (!user || !db) return;
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, 'affiliate_applications'), {
          uid: user.uid,
          email: user.email,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        setPendingApp(true);
      } catch (err) {
        handleFirestoreError(err, 'write', 'affiliate_applications');
        setError('Failed to submit application. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const currentTab = activeTab || (isAdmin ? 'admin' : isAffiliate ? 'affiliate' : 'selection');

    return (
      <div id="portal-top" className="min-h-screen bg-transparent pt-28 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
            <div>
              <div className="text-aura-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Workspace</div>
              <h1 className="text-4xl font-display font-bold italic">
                Aura <span className="text-aura-gold-light">
                  {currentTab === 'admin' ? 'Terminal.' : 
                   currentTab === 'affiliate' ? 'Reseller Portal.' : 
                   'Member Portal.'}
                </span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all rounded-xl text-xs font-bold uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* Dashboard Navigation */}
          <div className="flex items-center gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-2xl mb-12 w-fit">
            {isAdmin && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${currentTab === 'admin' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Terminal
              </button>
            )}
            {(isAdmin || isAffiliate) && (
              <button 
                onClick={() => setActiveTab('affiliate')}
                className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${currentTab === 'affiliate' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Reseller
              </button>
            )}
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${currentTab === 'profile' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              Aura Card
            </button>
            <button 
              onClick={() => setActiveTab('selection')}
              className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${currentTab === 'selection' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              Overview
            </button>
          </div>

          {/* Conditional Dashboard Views */}
          <div className="animate-in fade-in duration-500">
            {currentTab === 'admin' && <AdminDashboard />}
            {currentTab === 'affiliate' && <AffiliateDashboard />}
            {currentTab === 'profile' && <ProfileDashboard />}
            {currentTab === 'selection' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-12 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 text-left">
                  <Users className="w-12 h-12 text-aura-gold mb-6" />
                  <h2 className="text-2xl font-bold mb-4">Aura Profile</h2>
                  <p className="text-zinc-500 mb-8 max-w-sm">Setup your digital business card and claim your public aurataps.net handle.</p>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-aura-lime text-aura-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-aura-lime/20"
                  >
                    Configure Profile <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-12 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 text-left">
                  <Briefcase className="w-12 h-12 text-aura-gold mb-6" />
                  <h2 className="text-2xl font-bold mb-4">Affiliate Program</h2>
                  <p className="text-zinc-500 mb-8 max-w-sm">
                    {isAffiliate ? "Track your sales and commissions in real-time." : "Earn commissions by referring new members to the Aura ecosystem."}
                  </p>
                  <button 
                    disabled={pendingApp || isSubmitting}
                    onClick={() => isAffiliate ? setActiveTab('affiliate') : handleJoinProgram()}
                    className={`inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl text-xs uppercase tracking-widest transition-all ${pendingApp || isSubmitting ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-zinc-900 border border-zinc-800 text-white hover:border-aura-gold'}`}
                  >
                    {isAffiliate ? "View Sales" : isSubmitting ? "Processing..." : pendingApp ? "Enrolled Request" : "Request Enrollment"} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="portal-top" className="min-h-screen bg-transparent pt-40 px-6 pb-24 relative overflow-y-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-square bg-aura-gold/5 rounded-full blur-[120px] -translate-y-1/2" />
      
      <div className="max-w-lg mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {view === 'selection' ? (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-12">
                <div className="text-aura-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Aura Gateway</div>
                <h1 className="text-5xl font-display font-medium italic mb-4">Portal Access.</h1>
                <p className="text-zinc-500 text-sm">Select your journey to continue.</p>
              </div>

              {[
                { id: 'user', icon: <Users />, title: 'Customer Portal', desc: 'Manage your profile and orders.' },
                { id: 'affiliate', icon: <Briefcase />, title: 'Affiliate Portal', desc: 'Access your reseller dashboard.' },
                { id: 'admin', icon: <Shield />, title: 'Admin Terminal', desc: 'Secure management for Aura Team.' }
              ].map((role) => (
                <button 
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id as UserRole);
                    setView('login');
                  }}
                  className="w-full p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-6 group hover:border-aura-gold/50 hover:bg-zinc-900 transition-all text-left"
                >
                  <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-aura-gold transition-colors">
                    {role.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-aura-gold transition-colors">{role.title}</h3>
                    <p className="text-xs text-zinc-500">{role.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto text-zinc-700 group-hover:text-aura-gold transition-all group-hover:translate-x-1" />
                </button>
              ))}

              <div className="pt-8 text-center">
                <button 
                  onClick={() => {
                    setSelectedRole('user');
                    setView('enroll');
                  }}
                  className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Don't have an account? <span className="text-aura-gold">Enroll Now</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 md:p-12 shadow-2xl backdrop-blur-xl"
            >
              <button 
                onClick={() => setView('selection')}
                className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8 hover:text-white transition-colors flex items-center gap-2"
              >
                ← Back to selection
              </button>

              <div className="mb-10">
                <div className="text-aura-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                  {view === 'login' ? 'Authentication' : 'Registration'}
                </div>
                <h2 className="text-3xl font-display font-medium italic text-white">
                  {selectedRole === 'admin' ? 'Terminal' : selectedRole === 'affiliate' ? 'Reseller' : 'Portal'} <span className="text-aura-gold">{view === 'login' ? 'Login' : 'Enroll'}</span>
                </h2>
              </div>

              {view === 'enroll' && (
                <div className="flex p-1 bg-zinc-950 border border-zinc-800 rounded-2xl mb-8">
                  <button 
                    onClick={() => setSelectedRole('user')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${selectedRole === 'user' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                  >
                    Customer
                  </button>
                  <button 
                    onClick={() => setSelectedRole('affiliate')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${selectedRole === 'affiliate' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                  >
                    Affiliate
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-aura-gold transition-colors" 
                    placeholder="name@aura.tap" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 ml-1">Password</label>
                  <input 
                    required 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-aura-gold transition-colors" 
                    placeholder="••••••••" 
                  />
                </div>
                
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-5 bg-aura-lime text-aura-black rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white transition-all mt-4 disabled:opacity-50 shadow-lg shadow-aura-lime/20"
                >
                  {isSubmitting ? 'Processing...' : (
                    <>
                      {view === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      {view === 'login' ? 'Access Portal' : 'Create Account'}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-zinc-800">
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full py-4 bg-zinc-950 border border-zinc-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-3 hover:border-aura-gold transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setView(view === 'login' ? 'enroll' : 'login')}
                  className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-white transition-colors"
                >
                  {view === 'login' ? "New to Aura? " : "Already have an account? "}
                  <span className="text-aura-gold">{view === 'login' ? 'Enroll Now' : 'Sign In'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
