import { motion } from 'motion/react';

export default function Warranty() {
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
    <section id="warranty" className="py-24 bg-aura-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-20">
           <div className="lg:w-1/2">
             <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Warranty</div>
             <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 italic">Coverage Built for Confidence</h2>
             <p className="text-zinc-400 text-lg mb-8 max-w-xl">
               Every Aura Tap device includes a 12-month limited warranty for manufacturing faults.
             </p>
             <div className="flex flex-wrap gap-3">
               {['12 months coverage', 'Fast claim review', 'Replacement support'].map((tag) => (
                 <span key={tag} className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{tag}</span>
               ))}
             </div>
           </div>
           <div className="lg:w-1/2">
              <div className="aspect-video relative rounded-3xl overflow-hidden border border-zinc-800">
                 <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1200" alt="Products" className="w-full h-full object-cover grayscale opacity-40" />
                 <div className="absolute inset-0 bg-gradient-to-t from-aura-black/60 to-transparent" />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
           {[
             { title: "Coverage Window", desc: "12 months from purchase date for manufacturing faults and hardware issues." },
             { title: "Response Time", desc: "Most valid claims are reviewed within 2 business days after submission." },
             { title: "Claim Outcome", desc: "Approved claims receive an equivalent replacement product at no charge." }
           ].map((item, i) => (
             <div key={i} className="p-10 rounded-2xl bg-zinc-900/20 border border-zinc-800/80">
               <h4 className="text-white font-display font-bold mb-3">{item.title}</h4>
               <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>

        <div className="max-w-5xl mx-auto p-12 md:p-20 rounded-[3rem] bg-zinc-900/40 border border-zinc-800/50 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-aura-gold/5 rounded-full blur-3xl opacity-20" />
           <div className="relative z-10 text-center mb-16">
             <div className="inline-block px-4 py-2 rounded-full border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6">12-Month Warranty</div>
             <h3 className="text-4xl md:text-6xl font-display font-medium italic tracking-tight">Simple, Clear <span className="text-white">Warranty Process.</span></h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                 <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">What's Covered</div>
                 <ul className="space-y-6">
                    <li className="text-zinc-400 text-sm flex items-start gap-4 ring-1 ring-white/0 hover:ring-aura-gold/20 p-2 rounded-lg transition-all">
                       <div className="w-1.5 h-1.5 rounded-full bg-aura-gold mt-1.5" />
                       <span>Defective NFC chip or hardware failure</span>
                    </li>
                    <li className="text-zinc-400 text-sm flex items-start gap-4 ring-1 ring-white/0 hover:ring-aura-gold/20 p-2 rounded-lg transition-all">
                       <div className="w-1.5 h-1.5 rounded-full bg-aura-gold mt-1.5" />
                       <span>Delamination or print defects present on arrival</span>
                    </li>
                    <li className="text-zinc-400 text-sm flex items-start gap-4 ring-1 ring-white/0 hover:ring-aura-gold/20 p-2 rounded-lg transition-all">
                       <div className="w-1.5 h-1.5 rounded-full bg-aura-gold mt-1.5" />
                       <span>Non-responsive device under normal use conditions</span>
                    </li>
                 </ul>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                 <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">What's Not Covered</div>
                 <ul className="space-y-5 font-sans italic opacity-60">
                    <li className="text-zinc-500 text-sm">Loss or theft</li>
                    <li className="text-zinc-500 text-sm leading-relaxed">Physical damage, punctures, cracks, or bending</li>
                    <li className="text-zinc-500 text-sm">Water damage beyond normal use</li>
                    <li className="text-zinc-500 text-sm leading-relaxed">Unauthorized modifications or normal wear and tear</li>
                 </ul>
              </motion.div>
           </div>

           <div className="border-t border-zinc-800/50 pt-16">
              <p className="text-zinc-400 font-bold text-sm mb-8 uppercase tracking-widest">How to file a claim</p>
              <p className="text-zinc-500 text-base mb-10">Email <a href="mailto:support@aurataps.net" className="text-aura-gold hover:text-white transition-colors font-bold border-b border-aura-gold/30">support@aurataps.net</a> with the following details:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {steps.map(step => (
                  <div key={step.id} className="p-8 rounded-2xl bg-aura-black/40 border border-zinc-800/50 hover:border-aura-gold/20 transition-all">
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
