import { motion } from 'motion/react';
import { Layout, RefreshCw, Smartphone, Zap } from 'lucide-react';

export default function AuraPlatform() {
  const steps = [
    {
      id: "01",
      title: "Activate your Aura profile",
      description: "Every card gives you access to the Aura dashboard, where you control the profile people see after they tap or scan."
    },
    {
      id: "02",
      title: "Launch a polished digital page",
      description: "Share contact info, social links, listings, booking links, portfolio pages, and more from one clean mobile profile."
    },
    {
      id: "03",
      title: "Update from your dashboard",
      description: "Change your links, headline, photo, and contact details later without reprinting cards every time something changes."
    }
  ];

  return (
    <section id="platform" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(232,215,162,0.12),transparent_24%),radial-gradient(circle_at_20%_58%,rgba(184,255,44,0.06),transparent_20%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid min-h-[66vh] items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-aura-gold text-[10px] font-black uppercase tracking-[0.42em] mb-5">The Aura Platform</div>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-black uppercase text-white tracking-[-0.065em] mb-8 leading-[0.86]">
              Your tap has a control center.
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-xl">
              Aura Tap combines NFC hardware with a profile dashboard, so every tap leads to a page you can manage, update, and refine over time.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Dashboard access included', 'Manage your profile anytime', 'No reprinting needed'].map((tag, i) => (
                <motion.span 
                  key={tag} 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest backdrop-blur ${i === 0 ? 'border-aura-lime/30 bg-aura-lime/5 text-aura-lime' : 'border-white/10 bg-white/[0.035] text-zinc-300'}`}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative mx-auto flex aspect-square w-full max-w-lg items-center justify-center"
          >
             <div className="absolute inset-8 rounded-full border border-aura-gold/20 aura-spin-slow" />
             <div className="absolute inset-20 rounded-full border border-dashed border-aura-lime/30 aura-spin-slow-reverse" />
             <div className="absolute inset-0 rounded-full bg-aura-gold/10 blur-[90px]" />
             <div className="relative w-80 rounded-[2rem] border border-white/10 bg-black/45 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur">
               <div className="mb-8 flex items-center justify-between">
                 <div className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-aura-gold">Live Profile</div>
                 <div className="rounded-full border border-aura-lime/30 bg-aura-lime/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-aura-lime">Online</div>
               </div>
               <div className="mb-6 flex items-center gap-4">
                 <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-aura-gold/20 bg-aura-gold/10">
                   <Smartphone className="h-7 w-7 text-aura-gold" />
                 </div>
                 <div>
                   <div className="font-display text-2xl font-black text-white">Aura Profile</div>
                   <div className="text-xs text-zinc-500">aurataps.net/handle</div>
                 </div>
               </div>
               <div className="space-y-3">
                 {[
                   { icon: <Layout className="h-4 w-4" />, label: 'Links and contact info' },
                   { icon: <RefreshCw className="h-4 w-4" />, label: 'Update anytime' },
                   { icon: <Zap className="h-4 w-4" />, label: 'Instant tap handoff' },
                 ].map((item) => (
                   <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-xs text-zinc-400">
                     <span className="text-aura-lime">{item.icon}</span>
                     {item.label}
                   </div>
                 ))}
               </div>
             </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div 
              key={step.id} 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                delay: i * 0.15, 
                duration: 0.8,
                ease: [0.21, 0.47, 0.32, 0.98] 
              }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="p-10 rounded-[2rem] bg-white/[0.035] border border-white/10 hover:border-aura-gold/40 transition-all group backdrop-blur"
            >
              <div className="text-aura-gold text-xs font-bold mb-8 font-mono tracking-widest">{step.id}</div>
              <h3 className="text-2xl font-display font-medium text-white mb-6 group-hover:text-aura-gold transition-colors">{step.title}</h3>
              <p className="text-zinc-500 text-[15px] leading-relaxed group-hover:text-zinc-400 transition-colors">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
