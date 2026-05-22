import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Link as LinkIcon, Instagram, Twitter, Linkedin, ExternalLink, Save, CheckCircle2, AlertCircle, Trash2, Plus, Globe, Phone, Mail, Eye, X, Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import ProfileCard from '../ProfileCard';

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
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.username !== undefined) setUsername(userProfile.username || '');
      if (userProfile.bio !== undefined) setBio(userProfile.bio || '');
      if (userProfile.displayName !== undefined) setDisplayName(userProfile.displayName || '');
      if (userProfile.links !== undefined) setLinks(userProfile.links || []);
      if (userProfile.avatarUrl !== undefined) setAvatarUrl(userProfile.avatarUrl || '');
    }
  }, [userProfile]);

  const currentProfileData = {
    displayName,
    bio,
    links,
    avatarUrl: avatarUrl,
    username: username || 'handle'
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image fits under 8MB please.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        const width = img.width;
        const height = img.height;

        // Force an elegant square crop
        const minSize = Math.min(width, height);
        canvas.width = MAX_WIDTH;
        canvas.height = MAX_HEIGHT;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          const sourceX = (width - minSize) / 2;
          const sourceY = (height - minSize) / 2;
          ctx.drawImage(
            img, 
            sourceX, sourceY, minSize, minSize,
            0, 0, MAX_WIDTH, MAX_HEIGHT
          );
          // High-grade Jpeg compression saves on Firestore space and loads instantly!
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressedBase64);
          setMessage({ type: 'success', text: 'Custom photo applied! Tap Save Profile to publish.' });
          setTimeout(() => setMessage(null), 3500);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
      const lowerUsername = username.toLowerCase();
      
      // If username changed, handle uniqueness and release old handle
      if (lowerUsername !== (userProfile?.username || '')) {
        // If they had an old username, release it first
        if (userProfile?.username) {
          try {
            await deleteDoc(doc(db, 'usernames', userProfile.username.toLowerCase()));
          } catch (err) {
            console.warn('Could not release old handle:', err);
          }
        }

        // If setting a NEW username, verify uniqueness and claim it
        if (lowerUsername) {
          const usernameDoc = await getDoc(doc(db, 'usernames', lowerUsername));
          if (usernameDoc.exists()) {
            const existingUid = usernameDoc.data().uid;
            if (existingUid !== user.uid) {
              const isUserAdmin = user.email?.toLowerCase() === 'jaryn.b.healey@gmail.com';
              if (isUserAdmin) {
                // Admin override! Delete the conflicting handle mapping first, releasing the handle
                try {
                  await deleteDoc(doc(db, 'usernames', lowerUsername));
                  console.log('Admin override: freed handle', lowerUsername);
                } catch (err) {
                  console.warn('Could not force release handle:', err);
                }
              } else {
                // Check if that user still exists (handle stale handles)
                const existingUserDoc = await getDoc(doc(db, 'users', existingUid));
                if (existingUserDoc.exists()) {
                  throw new Error('This handle is already taken');
                }
                // If user record doesn't exist, delete the stale mapping to allow setDoc to succeed
                try {
                  await deleteDoc(doc(db, 'usernames', lowerUsername));
                } catch (err) {
                  console.warn('Could not clear stale username doc to allow setDoc:', err);
                }
              }
            }
          }
          
          await setDoc(doc(db, 'usernames', lowerUsername), { 
            uid: user.uid,
            claimedAt: new Date().toISOString()
          });
        }
      }

      await updateDoc(doc(db, 'users', user.uid), {
        username: lowerUsername,
        displayName,
        bio,
        links,
        avatarUrl,
        updatedAt: new Date().toISOString()
      });

      setMessage({ type: 'success', text: 'Profile published successfully!' });
    } catch (err: any) {
      console.error('Update error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const copyProfileLink = () => {
    if (!username) return;
    const link = `https://aurataps.net/${username}`;
    navigator.clipboard.writeText(link);
    setMessage({ type: 'success', text: 'Link copied to clipboard!' });
    setTimeout(() => setMessage(null), 3000);
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
            {/* Elegant Profile Avatar Uploader */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-2">
              <div className="relative group w-24 h-24 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 shadow-lg cursor-pointer">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-aura-gold/20 to-zinc-900 flex items-center justify-center">
                    <span className="text-2xl font-bold text-aura-gold">{(displayName || 'A').charAt(0)}</span>
                  </div>
                )}
                
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 cursor-pointer text-white">
                  <Camera className="w-4 h-4 text-aura-gold" />
                  <span className="text-[8px] font-bold uppercase tracking-wider">Change</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Tap Profile Photo</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Make your tap profile distinct. Upload a custom photo. Supports dragging and standard uploading. Max: 8MB.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                  <label className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-aura-gold/30 rounded-lg text-[9px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer transition-all flex items-center gap-1.5">
                    <Upload className="w-3 h-3 text-aura-gold" /> Upload Custom Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>

                  {avatarUrl && (
                    <button 
                      type="button"
                      onClick={() => {
                        setAvatarUrl('');
                        setMessage({ type: 'success', text: 'Photo cleared! Tap Save Profile to apply.' });
                        setTimeout(() => setMessage(null), 3000);
                      }}
                      className="px-3 py-1.5 bg-zinc-900/30 hover:bg-red-950/20 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-400 transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3 h-3" /> Clear Image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Custom Handle (aurataps.net/handle)</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">@</span>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase())}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-4 text-white focus:outline-none focus:border-aura-gold transition-colors text-sm" 
                    placeholder="yourname" 
                  />
                </div>
                {userProfile?.username && (
                  <button 
                    onClick={copyProfileLink}
                    className="px-4 bg-zinc-800 text-aura-gold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                  >
                    <LinkIcon className="w-3 h-3" /> Copy Link
                  </button>
                )}
              </div>
              {username && (
                <p className="mt-2 ml-1 text-[9.5px] text-zinc-600 font-medium">
                  Your live link: <span className="text-aura-gold/90 hover:text-aura-gold transition-colors hover:underline cursor-pointer font-semibold" onClick={copyProfileLink}>aurataps.net/{username}</span>
                </p>
              )}
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
            onClick={() => setIsPreviewOpen(true)}
            className="px-6 py-5 bg-zinc-900 text-white rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          
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
          
          <div className="max-w-[340px] mx-auto scale-90 origin-top">
            <ProfileCard data={currentProfileData} isMockup={true} />
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm flex flex-col items-center"
            >
              <div className="absolute -top-12 right-0">
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white"
                >
                  <X />
                </button>
              </div>
              <div className="scale-95 origin-top">
                <ProfileCard data={currentProfileData} isMockup={true} />
              </div>
              <p className="text-center mt-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Preview Mode
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
