import { motion } from 'motion/react';

export default function PricingHeader() {
  return (
    <section className="pt-32 pb-16 bg-aura-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2">
            <div className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">Pricing</div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-display font-medium text-white tracking-tight mb-8 leading-[0.9]"
            >
              Clear Pricing. <br />
              <span className="text-aura-gold italic">Strong Return on Investment.</span>
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
                  className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300 uppercase tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 relative">
              <img 
                src="https://images.unsplash.com/photo-1606857521015-7f9f94a83959?auto=format&fit=crop&q=80&w=1200" 
                alt="Hardware" 
                className="w-full h-full object-cover grayscale opacity-40" 
              />
              <div className="absolute top-8 left-8 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-aura-gold animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Hardware</span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-600 mt-6 md:text-right font-medium italic">
              Professional-grade NFC cards and wristbands prepared for scalable team deployment.
            </p>
          </div>
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-aura-gold/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
}
