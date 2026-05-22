import { motion } from 'motion/react';
import { useState } from 'react';
import LeadFormModal from './LeadFormModal';

export default function PricingDetails() {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const bundles = [
    {
      name: "Starter Team",
      originalPrice: "$299",
      price: "$225",
      units: "/ 10 cards",
      description: "Includes onboarding and dashboard setup for your full team rollout.",
      badge: "STARTER ROLLOUT"
    },
    {
      name: "Growth Team",
      originalPrice: "$599",
      price: "$349",
      units: "/ 25 mixed units",
      description: "Mix cards and wristbands for office staff and field reps.",
      badge: "MOST POPULAR",
      highlight: true
    },
    {
      name: "Enterprise Rollout",
      originalPrice: "$1,099",
      price: "$499",
      units: "/ 50 mixed units",
      description: "Includes onboarding call, activation support, and priority platform service.",
      badge: "SCALE PACKAGE"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-aura-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
           {['Platform Access Included', 'No Monthly Fees', 'Built to Scale'].map((title, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1, duration: 0.5 }}
               className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/50"
             >
               <h4 className="text-white font-display font-bold mb-2">{title}</h4>
               <p className="text-zinc-500 text-xs">
                 {i === 0 && "Every unit includes Aura dashboard access for profile management."}
                 {i === 1 && "Pay once for hardware and keep your profile live."}
                 {i === 2 && "From solo pros to multi-location teams on one platform."}
               </p>
             </motion.div>
           ))}
        </div>

        <div className="mb-16 text-center">
          <div className="text-aura-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Bundle Packages</div>
          <h2 className="text-3xl md:text-5xl font-display font-bold">Enterprise <span className="text-aura-gold italic">Units.</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {bundles.map((bundle, i) => (
             <motion.div
               key={bundle.name}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1, duration: 0.6 }}
               whileHover={{ y: -5 }}
               className={`p-8 rounded-3xl border transition-all ${bundle.highlight ? 'bg-aura-gold/5 border-aura-gold/30' : 'bg-zinc-900/20 border-zinc-800/50'}`}
             >
                <div className="text-[9px] font-bold text-zinc-500 mb-6 uppercase tracking-[0.2em]">{bundle.badge}</div>
                <h4 className="text-xl font-display font-bold mb-2">{bundle.name}</h4>
                <div className="flex items-baseline gap-2 mb-6">
                   <span className="text-zinc-600 line-through text-sm">{bundle.originalPrice}</span>
                   <span className="text-3xl text-white font-bold">{bundle.price}</span>
                   <span className="text-zinc-500 text-sm">{bundle.units}</span>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed mb-8">{bundle.description}</p>
                <button 
                  onClick={() => setSelectedBundle(bundle.name)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${bundle.highlight ? 'bg-aura-gold text-aura-black hover:bg-white' : 'border border-zinc-800 hover:border-white'}`}
                >
                   Get Started
                </button>
             </motion.div>
           ))}
        </div>
        
        {/* Implementation & Setup Section */}
        <div className="mt-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">The Implementation Process</div>
            <h2 className="text-3xl md:text-5xl font-display font-medium text-white italic">How we get your team <span className="text-aura-gold italic">live.</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Onboarding Call",
                desc: "We host a 15-minute sync with your team lead to gather branding assets and team details for the dashboard setup."
              },
              {
                step: "02",
                title: "Hardware Prep",
                desc: "Our technicians program your NFC chips and verify encryption before shipping your units Nationwide."
              },
              {
                step: "03",
                title: "Live Activation",
                desc: "Once received, each member performs a single tap to link their physical unit to their pre-built Aura profile."
              }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2rem] bg-zinc-900/10 border border-zinc-800/50 hover:border-aura-gold/30 transition-all group"
              >
                <div className="text-4xl font-display font-bold text-zinc-800 group-hover:text-aura-gold/20 mb-6 transition-colors">{item.step}</div>
                <h4 className="text-xl font-display font-bold text-white mb-4">{item.title}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-10 rounded-3xl bg-zinc-900/30 border border-aura-gold/10 flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-aura-gold/10 flex items-center justify-center text-aura-gold font-bold font-mono">
                  $99
                </div>
                <div>
                  <h5 className="text-white font-bold mb-1 font-display">One-Time Setup Fee</h5>
                  <p className="text-zinc-500 text-xs">Included in all bundle prices. Covers platform config & team onboarding.</p>
                </div>
             </div>
             <button 
               onClick={() => setSelectedBundle("Custom Enterprise Rollout")}
               className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-sm transition-all"
             >
                Tailor an Enterprise Quote
             </button>
          </div>

          <div className="mt-20 p-12 rounded-[2.5rem] bg-aura-gold/5 border border-aura-gold/20 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="max-w-xl">
                <h3 className="text-2xl font-display font-medium text-white mb-4">Want to resell Aura products?</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">Join our Affiliate Program to access exclusive reseller discounts up to 40% based on your purchase volume.</p>
             </div>
             <a href="/affiliate" className="px-8 py-4 bg-white text-aura-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-aura-gold transition-all whitespace-nowrap">
                Join Affiliate Program
             </a>
          </div>

          <LeadFormModal 
            isOpen={!!selectedBundle} 
            onClose={() => setSelectedBundle(null)} 
            bundleName={selectedBundle || ''} 
          />
        </div>
      </div>
    </section>
  );
}
