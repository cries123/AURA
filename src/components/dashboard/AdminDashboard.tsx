import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Users, Mail, Clock, CheckCircle2, ChevronRight, Search, Filter, ShieldCheck, MailWarning, Calendar, XCircle, Package } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocs, limit, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

type AuthUserSummary = {
  uid: string;
  email: string;
  displayName: string;
  disabled: boolean;
  creationTime: string;
  lastSignInTime: string;
  providerIds: string[];
};

export default function AdminDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'leads' | 'requests' | 'users'>('users');

  function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }

  const mergedUsers = (() => {
    const usersByUid = new Map<string, any>();

    authUsers.forEach((authUser) => {
      usersByUid.set(authUser.uid, {
        id: authUser.uid,
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        role: 'auth user',
        username: '',
        authOnly: true,
        disabled: authUser.disabled,
        creationTime: authUser.creationTime,
        lastSignInTime: authUser.lastSignInTime,
      });
    });

    users.forEach((user) => {
      usersByUid.set(user.uid || user.id, {
        ...usersByUid.get(user.uid || user.id),
        ...user,
        authOnly: false,
      });
    });

    return Array.from(usersByUid.values()).sort((a, b) => {
      const aDate = new Date(a.createdAt || a.creationTime || 0).getTime();
      const bDate = new Date(b.createdAt || b.creationTime || 0).getTime();
      return bDate - aDate;
    });
  })();

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const qLeads = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'list', 'leads'));

    const qApps = query(collection(db, 'affiliate_applications'), orderBy('createdAt', 'desc'));
    const unsubscribeApps = onSnapshot(qApps, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'list', 'affiliate_applications'));

    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'list', 'users'));

    async function loadAuthUsers() {
      try {
        const token = await auth?.currentUser?.getIdToken();
        if (!token) return;

        const response = await fetch('/.netlify/functions/admin-auth-users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          console.warn('Admin auth user list unavailable:', await response.text());
          return;
        }

        const payload = await response.json();
        setAuthUsers(Array.isArray(payload.users) ? payload.users : []);
      } catch (err) {
        console.warn('Failed to load Firebase Auth users:', err);
      }
    }

    loadAuthUsers();
    setLoading(false);
    return () => {
      unsubscribeLeads();
      unsubscribeApps();
      unsubscribeUsers();
    };
  }, []);

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), { status });
    } catch (err) {
      handleFirestoreError(err, 'write', `leads/${leadId}`);
    }
  };

  const generateAffiliateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleApproveApp = async (app: any) => {
    try {
      const code = generateAffiliateCode();
      await updateDoc(doc(db, 'users', app.uid), { 
        role: 'affiliate',
        affiliateCode: code
      });
      
      // Initialize affiliate stats
      await setDoc(doc(db, 'affiliates', app.uid), {
        userId: app.uid,
        cumulativeSales: 0,
        totalUnits: 0,
        currentTier: 'Silver',
        discountCode: code,
        updatedAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'affiliate_applications', app.id), { status: 'approved' });
    } catch (err) {
      handleFirestoreError(err, 'write', 'multi-collection approval');
    }
  };

  const handleRejectApp = async (appId: string) => {
    try {
      await updateDoc(doc(db, 'affiliate_applications', appId), { status: 'rejected' });
    } catch (err) {
      handleFirestoreError(err, 'write', `affiliate_applications/${appId}`);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Leads', value: leads.length, icon: <Mail />, color: 'text-aura-gold' },
          { label: 'Pending Partners', value: applications.filter(a => a.status === 'pending').length, icon: <Clock />, color: 'text-amber-500' },
          { label: 'Total Users', value: mergedUsers.length, icon: <Users />, color: 'text-aura-lime' },
          { label: 'System Status', value: 'Live', icon: <ShieldCheck />, color: 'text-emerald-500' }
        ].map((stat, i) => (
          <div key={i} className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
                {stat.icon}
              </div>
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Admin Nav */}
      <div className="flex flex-wrap items-center gap-2 bg-zinc-950 border border-zinc-800 p-1.5 rounded-2xl w-fit max-w-full">
        <button 
          onClick={() => setActiveView('users')}
          className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeView === 'users' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Users & Handles ({mergedUsers.length})
        </button>
        <button 
          onClick={() => setActiveView('leads')}
          className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeView === 'leads' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Lead Terminal
        </button>
        <button 
          onClick={() => setActiveView('requests')}
          className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeView === 'requests' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Enrollment Requests ({applications.filter(a => a.status === 'pending').length})
        </button>
      </div>

      {/* Main Terminal Feed */}
      <div className="p-10 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 overflow-hidden">
        {activeView === 'leads' ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
              <div>
                <h3 className="text-2xl font-display font-bold italic mb-2">Lead <span className="text-aura-gold">Terminal.</span></h3>
                <p className="text-xs text-zinc-500">Managing enterprise inquiries and reseller applications.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type="text" 
                    placeholder="Search inquiries..." 
                    className="bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-aura-gold w-64"
                  />
                </div>
                <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                 <div className="w-8 h-8 border-2 border-aura-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                 <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Encrypting Feed...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-zinc-800 rounded-[2rem]">
                <MailWarning className="w-12 h-12 text-zinc-700 mx-auto mb-6" />
                <h4 className="text-xl font-bold text-zinc-500">No active leads in queue.</h4>
                <p className="text-xs text-zinc-600 mt-2">All incoming inquiries will appear here in real-time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <motion.div 
                    key={lead.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 rounded-3xl bg-zinc-950/50 border border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-aura-gold/30 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-aura-gold font-bold">
                        {lead.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-white italic">{lead.name}</span>
                          <span className="text-[10px] bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded uppercase tracking-widest">{lead.company}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-4">
                           <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {lead.email}</span>
                           <span className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3" /> {lead.bundleName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="text-right hidden md:block">
                          <div className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mb-1">Status</div>
                          <div className={`text-[10px] font-bold uppercase tracking-widest ${lead.status === 'new' ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {lead.status}
                          </div>
                       </div>
                       <button 
                         onClick={() => updateLeadStatus(lead.id, 'contacted')}
                         className="px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group/btn"
                       >
                         Mark Contacted
                         <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-all" />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : activeView === 'requests' ? (
          <>
            <div className="mb-10">
              <h3 className="text-2xl font-display font-bold italic mb-2">Enrollment <span className="text-aura-gold">Requests.</span></h3>
              <p className="text-xs text-zinc-500">Approve or reject member requests to join the reseller program.</p>
            </div>

            {applications.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-zinc-800 rounded-[2rem]">
                <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-6" />
                <h4 className="text-xl font-bold text-zinc-500">No requests pending.</h4>
                <p className="text-xs text-zinc-600 mt-2">Member applications for the affiliate program will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <motion.div 
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 rounded-3xl bg-zinc-950/50 border border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-aura-gold/30 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-aura-gold font-bold">
                        {app.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white italic mb-1">{app.email}</div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(app.createdAt).toLocaleDateString()}</span>
                          <span className={`px-2 py-0.5 rounded uppercase tracking-widest font-bold ${
                            app.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                            app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                            'bg-red-500/10 text-red-500'
                          }`}>{app.status}</span>
                        </div>
                      </div>
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleApproveApp(app)}
                          className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all rounded-lg text-[10px] font-bold uppercase tracking-widest"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleRejectApp(app.id)}
                          className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-lg text-[10px] font-bold uppercase tracking-widest"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
              <div>
                <h3 className="text-2xl font-display font-bold italic mb-2">User <span className="text-aura-lime">Handles.</span></h3>
                <p className="text-xs text-zinc-500">All registered users and their public Aura handles.</p>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                {mergedUsers.length} total accounts
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-aura-lime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Loading users...</p>
              </div>
            ) : mergedUsers.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-zinc-800 rounded-[2rem]">
                <Users className="w-12 h-12 text-zinc-700 mx-auto mb-6" />
                <h4 className="text-xl font-bold text-zinc-500">No users found.</h4>
                <p className="text-xs text-zinc-600 mt-2">Portal accounts and Firebase Auth users will appear here.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[2rem] border border-zinc-800">
                <div className="hidden md:grid grid-cols-[1.2fr_1fr_0.7fr_1.2fr] gap-4 bg-zinc-950/70 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-600">
                  <span>User</span>
                  <span>Handle</span>
                  <span>Role</span>
                  <span>UID</span>
                </div>
                <div className="divide-y divide-zinc-900">
                  {mergedUsers.map((user) => {
                    const handle = user.username ? `@${user.username}` : 'No handle set';

                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 gap-4 bg-zinc-950/35 px-6 py-5 text-sm transition-colors hover:bg-zinc-900/45 md:grid-cols-[1.2fr_1fr_0.7fr_1.2fr] md:items-center"
                      >
                        <div>
                          <div className="font-bold text-white">{user.displayName || user.email || 'Unnamed user'}</div>
                          <div className="mt-1 text-[11px] text-zinc-500">{user.email || 'No email'}</div>
                        </div>
                        <div className={`font-mono text-xs font-bold ${user.username ? 'text-aura-lime' : 'text-zinc-600'}`}>
                          {handle}
                        </div>
                        <div>
                          <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            {user.role || 'user'}
                          </span>
                          {user.authOnly && (
                            <span className="ml-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-500">
                              Auth only
                            </span>
                          )}
                        </div>
                        <div className="truncate font-mono text-[10px] text-zinc-600" title={user.uid || user.id}>
                          {user.uid || user.id}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
