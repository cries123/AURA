import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Real Estate Director",
    quote: "Aura Tap changed how our team presence looks at networking events. No more fumbling with cards—just a seamless tap and we're connected.",
    rating: 5
  },
  {
    name: "Marcus Thorne",
    role: "Sales Executive",
    quote: "The ability to update my profile instantly without reprinting is a game-changer. It's clean, professional, and always works.",
    rating: 5
  },
  {
    name: "Elena Rodriguez",
    role: "Tech Consultant",
    quote: "I get comments on my matte black Aura card every single time I use it. It's the ultimate conversation starter for high-end meetings.",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-aura-black relative overflow-hidden">
      {/* Subtle Background Accents */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 bg-aura-gold/5 rounded-full blur-[60px] -mr-48 -mt-48" 
        style={{ willChange: 'filter' }}
      />
      <div 
        className="absolute bottom-0 left-0 w-96 h-96 bg-aura-gold/5 rounded-full blur-[60px] -ml-48 -mb-48" 
        style={{ willChange: 'filter' }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4"
          >
            Success Stories
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-medium text-white italic"
          >
            What the <span className="text-aura-gold italic">pros</span> are saying.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2rem] bg-zinc-900/10 border border-zinc-800/50 hover:border-aura-gold/20 transition-all flex flex-col"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-aura-gold text-aura-gold" />
                ))}
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-grow">"{t.quote}"</p>
              <div>
                <h4 className="text-white font-display font-bold text-sm tracking-tight">{t.name}</h4>
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-1">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
