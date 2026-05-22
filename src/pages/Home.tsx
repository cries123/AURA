import Hero from '@/src/components/Hero';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Testimonials from '@/src/components/Testimonials';

export default function Home() {
  return (
    <>
      <Hero />
      
      {/* Value Prop Banner */}
      <section className="py-6 border-y border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16">
          {['12-Month Warranty', 'Setup Included', 'No Monthly Fees', 'Nationwide Support'].map((text, i) => (
            <motion.div 
              key={text} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-aura-gold" />
              {text}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Short Value Cards */}
      <section className="py-24 px-6 bg-aura-black">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Zero Recurring Costs", desc: "Stop re-ordering paper cards every time someone gets promoted. Update profiles in seconds, anytime." },
              { step: "02", title: "Instant Lead Capture", desc: "Clients can save you or your team directly to their phone contacts, not lose a card in a stack later." },
              { step: "03", title: "Brand Authority", desc: "A matte black Aura Card or custom NFC wristband signals modern, tech-forward confidence." }
            ].map((card, i) => (
              <motion.div 
                key={card.step} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="p-10 rounded-2xl bg-zinc-900/10 border border-zinc-800 flex flex-col group relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-24 h-24 bg-aura-gold/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="text-[10px] font-bold text-zinc-600 mb-6 font-mono relative z-10">{card.step}</div>
                 <h3 className="text-xl font-display font-bold mb-4 relative z-10 group-hover:text-aura-gold transition-colors">{card.title}</h3>
                 <p className="text-zinc-500 text-sm leading-relaxed relative z-10">{card.desc}</p>
              </motion.div>
            ))}
         </div>
      </section>

      <Testimonials />

      {/* Refined Minimalist CTA */}
      <section id="contact" className="py-32 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="inline-block px-4 py-2 rounded-full border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8">
              Experience Aura
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-medium tracking-tight mb-8">
              Ready to share your <br /><span className="text-aura-gold italic">true</span> potential?
            </h2>
            <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals in the 805 and beyond who have moved past paper. 
              Let's set up your team dashboard today.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <a href="mailto:sales@auratap.net" className="w-full sm:w-auto px-10 py-5 bg-white text-aura-black font-bold rounded-2xl hover:bg-aura-gold transition-all shadow-xl shadow-aura-gold/5">
              Contact Sales
            </a>
            <Link to="/pricing" className="w-full sm:w-auto px-10 py-5 border border-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-900 transition-all">
              View Pricing
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
