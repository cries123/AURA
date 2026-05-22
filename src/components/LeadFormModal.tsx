import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { db, OperationType, handleFirestoreError } from '@/src/lib/firebase';
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 z-[110] shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-aura-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-aura-gold">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white mb-4">Request Sent</h2>
                <p className="text-zinc-500 mb-8">An Aura Tap specialist will contact you within 24 hours to finalize your {bundleName}.</p>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-white text-aura-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-aura-gold transition-all"
                >
                  Return to Pricing
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <div className="text-aura-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Enterprise Inquiry</div>
                  <h2 className="text-3xl font-display font-medium text-white italic">Customize your <span className="text-aura-gold">{bundleName}.</span></h2>
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
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-aura-gold transition-colors" 
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
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-aura-gold transition-colors" 
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
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-aura-gold transition-colors" 
                      placeholder="john@acme.com" 
                    />
                  </div>
                  <button 
                    disabled={status === 'submitting'}
                    type="submit"
                    className="w-full py-5 bg-aura-gold text-aura-black rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white transition-all mt-4 disabled:opacity-50"
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
