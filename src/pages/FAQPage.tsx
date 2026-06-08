import { motion } from 'motion/react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const decisionMakerFaqs = [
    {
      q: "Does it work with iPhone and Android?",
      a: "Yes, Aura Tap uses universal NFC technology compatible with most modern smartphones. For older devices, the included QR code on your digital profile serves as a perfect backup."
    },
    {
      q: "Can I update my info later?",
      a: "Absolutely. Log into your dashboard anytime to change links, contact details, or your profile picture. Your physical card stays the same while the digital content updates instantly."
    },
    {
      q: "Do I need an app to use Aura Tap?",
      a: "No apps are required. The person receiving your info just taps your card to open your profile in their default browser. You manage your profile via our web dashboard."
    },
    {
      q: "How long does setup take?",
      a: "Initial setup usually takes less than 60 seconds. Once you receive your card, follow the included 'Tap to Activate' prompt to link your product to your digital profile."
    },
    {
      q: "What happens if my card stops working?",
      a: "Every product is covered by our 12-month limited warranty. If the NFC chip fails under normal use conditions, we send a replacement at no cost."
    },
    {
      q: "How secure is my data?",
      a: "We only store what you choose to share. Your profile is essentially a public-facing digital business card. You can toggle your profile to 'Private' at any time via the dashboard to disable taps."
    },
    {
      q: "Can I use Aura Tap with my company branding?",
      a: "Yes, for enterprise orders (50+ units), we offer full custom back-of-card printing with your corporate logo and brand colors."
    }
  ];

  return (
    <div id="faq-top" className="min-h-screen px-6 pb-24 pt-36">
      <main className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(232,215,162,0.12),transparent_24%),radial-gradient(circle_at_18%_54%,rgba(184,255,44,0.06),transparent_20%)]" />
        <div className="relative grid min-h-[60vh] items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-5 font-mono text-[10px] font-black uppercase tracking-[0.42em] text-aura-gold">Help Center</div>
            <h1 className="font-display text-5xl font-black uppercase leading-[0.86] tracking-[-0.065em] text-white md:text-7xl lg:text-8xl">
              Answers before you tap.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-zinc-400 md:text-xl">
              Everything decision-makers ask before switching from paper cards to Aura Tap hardware and dashboard profiles.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['No app required', 'Setup in 60 seconds', 'Ships in 3-5 days', '12-month warranty'].map((tag, index) => (
                <span
                  key={tag}
                  className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${index === 1 ? 'border-aura-lime/30 bg-aura-lime/5 text-aura-lime' : 'border-white/10 bg-white/[0.035] text-zinc-300'}`}
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
              <MessageCircle className="mx-auto mb-6 h-14 w-14 text-aura-lime" />
              <div className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-aura-gold">FAQ Terminal</div>
              <p className="mt-5 text-sm leading-7 text-zinc-500">
                Fast answers about compatibility, setup, security, warranty, and team orders.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="my-20 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            {
              title: '"We already have paper cards."',
              body: 'Most teams do, until they realize they spend $50+ per employee every time details change. Aura Tap is a reusable one-time hardware upgrade.',
            },
            {
              title: '"Is it hard for field teams?"',
              body: 'No. It takes around 60 seconds to connect each card. Team bundles include onboarding support so every field rep is ready to network immediately.',
            },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 backdrop-blur"
            >
              <div className="mb-4 font-display text-2xl font-bold italic text-white">{card.title}</div>
              <p className="text-sm leading-7 text-zinc-500">{card.body}</p>
            </motion.div>
          ))}
        </div>

        <div id="questions" className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <div className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.42em] text-aura-gold">Question Library</div>
            <h2 className="font-display text-4xl font-black uppercase tracking-[-0.055em] md:text-6xl">
              Common questions.
            </h2>
          </div>

          <div className="space-y-4">
             {decisionMakerFaqs.map((faq, index) => (
               <motion.div 
                 key={index} 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.1 }}
                 className="overflow-hidden rounded-2xl border border-white/10 bg-black/35 backdrop-blur transition-colors hover:border-aura-gold/30"
               >
                 <button 
                   onClick={() => setOpenIndex(openIndex === index ? null : index)}
                   className="w-full px-8 py-6 text-left flex items-center justify-between gap-8 hover:bg-white/[0.025] transition-colors"
                 >
                    <span className="text-sm font-bold text-white md:text-base">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-aura-gold transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                 </button>
                 {openIndex === index && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     className="px-8 pb-7 text-zinc-500 text-sm leading-7"
                   >
                     {faq.a}
                   </motion.div>
                 )}
               </motion.div>
             ))}
          </div>

          <div className="mt-20 rounded-[2.5rem] border border-aura-lime/20 bg-aura-lime/5 p-10 text-center md:p-14">
            <MessageCircle className="w-12 h-12 text-aura-lime mx-auto mb-6" />
            <h2 className="text-3xl font-display font-black uppercase tracking-[-0.04em] mb-4">Still have questions?</h2>
            <p className="text-zinc-500 mb-8 max-w-sm mx-auto text-sm leading-7">Our specialist team can help with team onboarding, bundles, custom orders, and setup questions.</p>
            <a href="mailto:sales@auratap.net" className="inline-flex px-8 py-4 bg-aura-lime text-aura-black font-black rounded-xl hover:bg-white transition-all shadow-lg shadow-aura-lime/20 text-xs uppercase tracking-widest">
              Contact Sales Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
