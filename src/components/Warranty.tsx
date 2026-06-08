import { motion } from 'motion/react';

export default function Warranty() {
  const coverage = [
    'Defective NFC chip or hardware failure',
    'Delamination or print defects present on arrival',
    'Non-responsive device under normal use conditions',
  ];
  const exclusions = [
    'Loss or theft',
    'Physical damage, punctures, cracks, or bending',
    'Water damage beyond normal use',
    'Unauthorized modifications or normal wear and tear',
  ];
  const steps = [
    {
      title: "Submit Claim",
      desc: "Email order number and issue details.",
      id: "STEP 1"
    },
    {
      title: "Review",
      desc: "We validate the fault and confirm eligibility.",
      id: "STEP 2"
    },
    {
      title: "Replacement",
      desc: "Approved claims receive an equivalent device.",
      id: "STEP 3"
    }
  ];

  return (
    <section id="warranty" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(232,215,162,0.12),transparent_24%),radial-gradient(circle_at_20%_58%,rgba(184,255,44,0.06),transparent_20%)]" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative grid min-h-[68vh] items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
           <motion.div
             initial={{ opacity: 0, y: 24 }}
             animate={{ opacity: 1, y: 0 }}
             className="relative z-10"
           >
             <div className="mb-5 font-mono text-[10px] font-black uppercase tracking-[0.42em] text-aura-gold">Warranty Policy</div>
             <h1 className="font-display text-5xl font-black uppercase leading-[0.86] tracking-[-0.065em] text-white md:text-7xl lg:text-8xl">
               Coverage built for confidence.
             </h1>
             <p className="mt-8 max-w-2xl text-base leading-8 text-zinc-400 md:text-xl">
               Every Aura Tap device includes a 12-month limited warranty for manufacturing faults, NFC failures, and eligible hardware issues.
             </p>
             <div className="mt-8 flex flex-wrap gap-3">
               {['12-month warranty', '2-day claim review', 'replacement support', 'ships in 3-5 days'].map((tag, index) => (
                 <span
                   key={tag}
                   className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${index === 0 ? 'border-aura-lime/30 bg-aura-lime/5 text-aura-lime' : 'border-white/10 bg-white/[0.035] text-zinc-300'}`}
                 >
                   {tag}
                 </span>
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
             <div className="relative w-72 rounded-[2rem] border border-white/10 bg-black/45 p-8 text-center shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur">
               <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-aura-lime/30 bg-aura-lime/5 text-3xl font-black text-aura-lime">
                 12
               </div>
               <div className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-aura-gold">Months Protected</div>
               <p className="mt-5 text-sm leading-7 text-zinc-500">
                 Manufacturing defects and NFC hardware failures are reviewed fast and replaced when eligible.
               </p>
             </div>
           </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-20">
           {[
             { title: "Coverage Window", desc: "12 months from purchase date for manufacturing faults and hardware issues." },
             { title: "Response Time", desc: "Most valid claims are reviewed within 2 business days after submission." },
             { title: "Claim Outcome", desc: "Approved claims receive an equivalent replacement product at no charge." }
           ].map((item, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.08 }}
               className="p-10 rounded-[2rem] bg-white/[0.035] border border-white/10 backdrop-blur"
             >
               <div className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-aura-gold">0{i + 1}</div>
               <h4 className="text-white font-display font-bold mb-3">{item.title}</h4>
               <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
             </motion.div>
           ))}
        </div>

        <div className="max-w-6xl mx-auto p-8 md:p-14 rounded-[3rem] bg-black/35 border border-white/10 relative overflow-hidden backdrop-blur">
           <div className="absolute top-0 right-0 w-64 h-64 bg-aura-gold/10 rounded-full blur-3xl opacity-40" />
           <div className="relative z-10 text-center mb-16">
             <div className="inline-block px-4 py-2 rounded-full border border-aura-gold/20 text-[10px] font-bold text-aura-gold uppercase tracking-[0.3em] mb-6">12-Month Warranty</div>
             <h3 className="text-4xl md:text-6xl font-display font-black uppercase tracking-[-0.055em]">Simple, clear <span className="text-aura-gold">warranty process.</span></h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                 <div className="text-[11px] font-bold text-aura-lime uppercase tracking-[0.2em]">What's Covered</div>
                 <ul className="space-y-6">
                    {coverage.map((item) => (
                      <li key={item} className="text-zinc-400 text-sm flex items-start gap-4 ring-1 ring-white/0 hover:ring-aura-lime/20 p-3 rounded-xl transition-all">
                         <div className="w-1.5 h-1.5 rounded-full bg-aura-lime mt-1.5 shadow-[0_0_14px_rgba(184,255,44,0.75)]" />
                         <span>{item}</span>
                      </li>
                    ))}
                 </ul>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                 <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">What's Not Covered</div>
                 <ul className="space-y-5 font-sans italic opacity-70">
                    {exclusions.map((item) => (
                      <li key={item} className="text-zinc-500 text-sm leading-relaxed">{item}</li>
                    ))}
                 </ul>
              </motion.div>
           </div>

           <div className="border-t border-zinc-800/50 pt-16">
              <p className="text-zinc-400 font-bold text-sm mb-8 uppercase tracking-widest">How to file a claim</p>
              <p className="text-zinc-500 text-base mb-10">Email <a href="mailto:support@aurataps.net" className="text-aura-gold hover:text-white transition-colors font-bold border-b border-aura-gold/30">support@aurataps.net</a> with the following details:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {steps.map(step => (
                  <div key={step.id} className="p-8 rounded-2xl bg-white/[0.025] border border-white/10 hover:border-aura-gold/30 transition-all">
                    <div className="text-[10px] font-bold text-zinc-600 mb-4 uppercase tracking-widest">{step.id}</div>
                    <div className="text-white font-display font-bold text-lg mb-3">{step.title}</div>
                    <div className="text-zinc-500 text-sm leading-relaxed">{step.desc}</div>
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-zinc-950/50 p-8 rounded-3xl border border-zinc-800/50">
              <p className="text-zinc-500 text-xs italic text-center leading-relaxed">Approved claims are replaced with an equivalent product at no charge. Refunds are not issued under warranty. Aura Tap reserves the right to request the original hardware for inspection.</p>
           </div>
        </div>
      </div>
    </section>
  );
}
