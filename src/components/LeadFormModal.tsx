import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundleName: string;
}

export default function LeadFormModal({ isOpen, onClose, bundleName }: LeadFormModalProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      if (!db) {
        throw new Error('Database not initialized. Please configure Firebase.');
      }
      await addDoc(collection(db, 'leads'), {
        ...formData,
        bundleName,
        status: 'new',
        createdAt: new Date().toISOString()
      });
      setStatus('success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'leads');
      setStatus('idle');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-[#030303]/90 backdrop-blur-md"
          />
          <div className="pointer-events-none fixed inset-0 z-[101] bg-[radial-gradient(circle_at_50%_35%,rgba(232,215,162,0.16),transparent_26%),radial-gradient(circle_at_74%_72%,rgba(184,255,44,0.08),transparent_26%)]" />
          <div className="cinematic-noise pointer-events-none fixed inset-0 z-[102] opacity-25" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 z-[110] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2.25rem] border border-aura-gold/15 bg-[#070706]/80 p-8 shadow-[0_40px_140px_rgba(0,0,0,0.75)] backdrop-blur-2xl md:p-12"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(232,215,162,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_38%)]" />
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-aura-gold/50 to-transparent" />
            <button onClick={onClose} className="absolute right-6 top-6 z-10 text-zinc-500 transition-colors hover:text-aura-gold">
              <X className="w-6 h-6" />
            </button>

            {status === 'success' ? (
              <div className="relative z-10 py-8 text-center">
                <div className="w-20 h-20 bg-aura-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-aura-gold border border-aura-gold/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white mb-4">Request Sent</h2>
                <p className="text-zinc-500 mb-8">An Aura Tap specialist will contact you within 24 hours to finalize your {bundleName}.</p>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-aura-lime text-aura-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg shadow-aura-lime/20"
                >
                  Return to Pricing
                </button>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="mb-8">
                  <div className="mb-4 text-[10px] font-black uppercase tracking-[0.42em] text-aura-gold">Enterprise Inquiry</div>
                  <h2 className="font-display text-3xl font-semibold italic leading-tight text-white">Customize your <span className="text-aura-gold">{bundleName}.</span></h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white placeholder:text-zinc-600 transition-colors focus:border-aura-lime focus:outline-none" 
                        placeholder="John Doe" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 ml-1">Company</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white placeholder:text-zinc-600 transition-colors focus:border-aura-lime focus:outline-none" 
                        placeholder="Acme Inc." 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white placeholder:text-zinc-600 transition-colors focus:border-aura-lime focus:outline-none" 
                      placeholder="john@acme.com" 
                    />
                  </div>
                  <button 
                    disabled={status === 'submitting'}
                    type="submit"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-aura-lime py-5 text-xs font-black uppercase tracking-widest text-aura-black shadow-[0_0_28px_rgba(184,255,44,0.25)] transition-all hover:bg-white disabled:opacity-50"
                  >
                    {status === 'submitting' ? 'Sending...' : (
                      <>
                        <Send className="w-4 h-4" />
                        Get Customized Quote
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-zinc-600 mt-4 italic">No obligation. Detailed quote provided via email.</p>
                </form>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
