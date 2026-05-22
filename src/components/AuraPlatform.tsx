import { motion } from 'motion/react';
import { Smartphone, Layout, RefreshCw, Zap } from 'lucide-react';

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
    <section id="platform" className="py-24 bg-aura-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 mb-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">The Aura Platform</div>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
              More Than a Card. <br />
              It Is Your <span className="text-aura-gold italic">Digital Dashboard.</span>
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
                  className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300 uppercase tracking-widest"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
            style={{ willChange: 'transform, opacity' }}
          >
             <div className="relative rounded-3xl overflow-hidden border border-zinc-800 group bg-zinc-900">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200" 
                  alt="Dashboard" 
                  className="w-full h-full object-cover opacity-30 group-hover:opacity-100 transition-opacity duration-700" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-aura-black/90 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white group-hover:translate-x-2 transition-transform duration-500">
                   <p className="font-display font-medium text-lg">Professional-grade profiles</p>
                   <p className="text-zinc-400 text-sm italic">Configured for maximum conversion</p>
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
              className="p-10 rounded-[2rem] bg-zinc-900/40 border border-zinc-800/80 hover:border-aura-gold/40 hover:bg-zinc-900/60 transition-all group"
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
