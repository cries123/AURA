import { motion } from 'motion/react';

export default function PricingHeader() {
  return (
    <section className="relative overflow-hidden pb-16 pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_12%,rgba(184,255,44,0.08),transparent_22%),radial-gradient(circle_at_18%_48%,rgba(232,215,162,0.12),transparent_24%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center min-h-[62vh]">
          <div>
            <div className="text-aura-gold text-[10px] font-black uppercase tracking-[0.42em] mb-5">Pricing Command</div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl md:text-7xl lg:text-8xl font-black uppercase text-white tracking-[-0.065em] mb-8 leading-[0.86]"
            >
              Buy once. <br />
              <span className="text-aura-gold">Tap forever.</span>
            </motion.h1>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl leading-relaxed">
              One-time hardware pricing with Aura Platform dashboard access bundled into every card and wristband.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                'Dashboard Access Included', 
                '$99 Setup Included with Bundles', 
                'No Recurring Platform Fees'
              ].map((tag) => (
                <span 
                  key={tag} 
                  className="px-4 py-2 rounded-full bg-white/[0.035] border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-widest backdrop-blur"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
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
                <div className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-aura-gold">Best Value</div>
                <div className="rounded-full border border-aura-lime/30 bg-aura-lime/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-aura-lime">Save $10</div>
              </div>
              <div className="mb-3 font-display text-3xl font-black text-white">Duo Bundle</div>
              <div className="mb-8 flex items-end gap-3">
                <span className="text-6xl font-black text-white">$40</span>
                <span className="pb-2 text-xs uppercase tracking-widest text-zinc-500">Card + Band</span>
              </div>
              <div className="space-y-3 text-xs text-zinc-400">
                {['Setup included', 'Ships in 3-5 days', 'No monthly fees'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-aura-lime shadow-[0_0_12px_rgba(184,255,44,0.7)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
