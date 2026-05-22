import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';

export default function Comparison() {
  const paperCard = [
    "Gets lost in wallets or stacks",
    "Needs reprints when info changes",
    "Only shows one phone number and one email",
    "Feels forgettable after the meeting ends"
  ];

  const auraTap = [
    "Instant save-to-phone experience",
    "Update profile content from the Aura dashboard without replacing hardware",
    "Show socials, listings, calendar, and portfolio together",
    "Feels premium, modern, and memorable"
  ];

  return (
    <section className="py-24 bg-aura-black">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4"
        >
          Before and After
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-display font-bold mb-12"
        >
          A Clear Advantage Over <br /> Paper Cards and Static Profiles
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-3xl bg-zinc-900/20 border border-zinc-800/50 grayscale hover:grayscale-0 transition-all cursor-default"
          >
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6">Paper Card</div>
            <ul className="space-y-6">
              {paperCard.map((item, i) => (
                <li key={i} className="flex gap-4 text-zinc-500 text-sm">
                  <X className="w-5 h-5 text-red-900/50 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
 
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-3xl bg-aura-gold/5 border border-aura-gold/20 hover:bg-aura-gold/10 transition-all cursor-default"
          >
            <div className="text-[10px] font-bold text-aura-gold uppercase tracking-widest mb-6">Aura Tap</div>
            <ul className="space-y-6">
              {auraTap.map((item, i) => (
                <li key={i} className="flex gap-4 text-white text-sm">
                  <Check className="w-5 h-5 text-aura-gold flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
           >
              <h3 className="text-xl font-display font-bold mb-6">Trusted by Organizations Nationwide</h3>
              <div className="flex flex-wrap gap-3">
                 {['Central Coast Plumbing', 'SLO Real Estate Group', 'Pacific Event Pros', '805 Home Services'].map((org, i) => (
                    <motion.span 
                      key={org} 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="px-4 py-2 border border-zinc-800 rounded-full text-xs text-zinc-400 font-medium"
                    >
                       {org}
                    </motion.span>
                 ))}
              </div>
              <p className="mt-6 text-xs text-zinc-600 italic">Trusted by teams and professionals nationwide.</p>
           </motion.div>
           
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
           >
              <h3 className="text-xl font-display font-bold mb-6">Performance Metrics</h3>
              <div className="space-y-4">
                 {[
                   { val: "34%", desc: "higher follow-up rate after switching from paper cards." },
                   { val: "2.4x", desc: "faster contact exchange at events." },
                   { val: "600+", desc: "annual paper-card reorders eliminated for one 30-person team." }
                 ].map((metric, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, x: 20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: 0.3 + (i * 0.1) }}
                     className="flex items-baseline gap-2"
                   >
                      <span className="text-white font-bold">{metric.val}</span>
                      <span className="text-zinc-500 text-sm">{metric.desc}</span>
                   </motion.div>
                 ))}
              </div>
           </motion.div>
        </div>
      </div>
    </section>
  );
}
