import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Link as LinkIcon, Instagram, Twitter, Linkedin, ExternalLink, Save, CheckCircle2, AlertCircle, Trash2, Plus, Globe, Phone, Mail } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

interface AuraLink {
  type: string;
  label: string;
  value: string;
}

const LINK_TYPES = [
  { id: 'instagram', icon: <Instagram className="w-4 h-4" />, color: 'text-pink-500' },
  { id: 'twitter', icon: <Twitter className="w-4 h-4" />, color: 'text-blue-400' },
  { id: 'linkedin', icon: <Linkedin className="w-4 h-4" />, color: 'text-blue-600' },
  { id: 'website', icon: <Globe className="w-4 h-4" />, color: 'text-emerald-400' },
  { id: 'phone', icon: <Phone className="w-4 h-4" />, color: 'text-green-500' },
  { id: 'email', icon: <Mail className="w-4 h-4" />, color: 'text-purple-400' },
  { id: 'other', icon: <LinkIcon className="w-4 h-4" />, color: 'text-zinc-400' },
];

export default function ProfileDashboard() {
  const { user, userProfile } = useAuth();
  const [username, setUsername] = useState(userProfile?.username || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [links, setLinks] = useState<AuraLink[]>(userProfile?.links || []);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

  const handleUpdateProfile = async () => {
    if (!user || !db) {
      setMessage({ type: 'error', text: 'Firebase not configured. Please add API keys.' });
      return;
    }
    setIsSaving(true);
    setMessage(null);

    try {
      // If username changed, handle uniqueness
      if (username !== userProfile?.username) {
        if (username) {
          let usernameDoc;
          try {
            usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
          } catch (err) {
            handleFirestoreError(err, 'get', `usernames/${username.toLowerCase()}`);
            throw err;
          }

          if (usernameDoc.exists() && usernameDoc.data().uid !== user.uid) {
            throw new Error('This handle is already taken');
          }
          
          // Delete old one if exists
          if (userProfile?.username) {
            try {
              await deleteDoc(doc(db, 'usernames', userProfile.username.toLowerCase()));
            } catch (err) {
              handleFirestoreError(err, 'delete', `usernames/${userProfile.username.toLowerCase()}`);
            }
          }
          
          // Set new one
          try {
            await setDoc(doc(db, 'usernames', username.toLowerCase()), { uid: user.uid });
          } catch (err) {
            handleFirestoreError(err, 'write', `usernames/${username.toLowerCase()}`);
            throw err;
          }
        }
      }

      await updateDoc(doc(db, 'users', user.uid), {
        username: username.toLowerCase(),
        displayName,
        bio,
        links,
        updatedAt: new Date().toISOString()
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      if (err.message.includes('permission-denied') || err.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, 'write', `users/${user.uid}`);
      }
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const addLink = () => {
    setLinks([...links, { type: 'website', label: '', value: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof AuraLink, val: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: val };
    setLinks(newLinks);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Editor Side */}
      <div className="space-y-8">
        <section className="p-8 rounded-[2rem] bg-zinc-900/40 border border-zinc-800">
          <h3 className="text-sm font-bold uppercase tracking-widest text-aura-gold mb-6 flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Identity & Bio
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Custom Handle (aurataps.net/handle)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">@</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-4 text-white focus:outline-none focus:border-aura-gold transition-colors text-sm" 
                  placeholder="yourname" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Display Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-aura-gold transition-colors text-sm" 
                placeholder="John Doe" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Short Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-aura-gold transition-colors text-sm min-h-[100px] resize-none" 
                placeholder="Tell the world who you are..." 
              />
            </div>
          </div>
        </section>

        <section className="p-8 rounded-[2rem] bg-zinc-900/40 border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-aura-gold flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Social & Contact Links
            </h3>
            <button 
              onClick={addLink}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {links.map((link, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-3">
                  <select 
                    value={link.type}
                    onChange={(e) => updateLink(idx, 'type', e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400"
                  >
                    {LINK_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.id}</option>
                    ))}
                  </select>
                  <input 
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(idx, 'label', e.target.value)}
                    placeholder="Label (e.g. Instagram)"
                    className="flex-1 bg-transparent border-none text-xs text-white focus:ring-0 p-0"
                  />
                  <button 
                    onClick={() => removeLink(idx)}
                    className="text-zinc-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input 
                  type="text"
                  value={link.value}
                  onChange={(e) => updateLink(idx, 'value', e.target.value)}
                  placeholder="URL or @handle"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-zinc-400 focus:outline-none focus:border-zinc-700"
                />
              </div>
            ))}
            {links.length === 0 && (
              <div className="text-center py-12 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-2xl">
                <p className="text-xs">No links added yet. Tap (+) to start building your card.</p>
              </div>
            )}
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button 
            disabled={isSaving}
            onClick={handleUpdateProfile}
            className="flex-1 py-5 bg-white text-aura-black rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-aura-gold transition-all shadow-xl shadow-white/5"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Publishing...' : 'Publish Card'}
          </button>
          
          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-center gap-2 px-6 py-5 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preview Side */}
      <div className="hidden lg:block">
        <div className="sticky top-32">
          <div className="text-center mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">Aura Live Preview</h3>
          </div>
          
          {/* Mock Phone */}
          <div className="max-w-[320px] mx-auto relative aspect-[9/18.5] bg-zinc-950 rounded-[3rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden shadow-aura-gold/5">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-zinc-900 rounded-b-2xl z-20" />
            
            <div className="h-full w-full overflow-y-auto no-scrollbar bg-aura-black text-white p-8 pt-12">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-aura-gold/20 to-zinc-900 flex items-center justify-center">
                    <span className="text-2xl font-bold text-aura-gold">{(displayName || 'A').charAt(0)}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <h2 className="text-xl font-display font-medium italic">{displayName || 'Aura User'}</h2>
                  <p className="text-aura-gold text-[10px] font-bold uppercase tracking-widest mt-1">@{username || 'handle'}</p>
                  <p className="text-zinc-500 text-xs mt-4 line-clamp-3 leading-relaxed">
                    {bio || 'Your bio will appear here once you type something...'}
                  </p>
                </div>

                <div className="w-full space-y-3 mt-4">
                  <button className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em]">
                    Save Contact
                  </button>
                  
                  {links.map((link, idx) => (
                    <div 
                      key={idx}
                      className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center ${LINK_TYPES.find(t => t.id === link.type)?.color}`}>
                          {LINK_TYPES.find(t => t.id === link.type)?.icon}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white">{link.label || link.type}</p>
                          <p className="text-[9px] text-zinc-500 mt-0.5 truncate max-w-[140px]">{link.value || 'Add value...'}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-zinc-700" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
