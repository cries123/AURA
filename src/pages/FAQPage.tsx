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
    <div id="faq-top" className="min-h-screen pt-24">
      <main className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">Help Center</div>
            <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tight mb-6">Frequently Asked <span className="text-aura-gold italic">Questions.</span></h1>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              Everything you need to know about the future of networking. Can't find what you're looking for? Contact our support team.
            </p>
          </motion.div>

          <div className="space-y-12 mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800">
                 <h3 className="text-xl font-display font-bold mb-4 text-white italic">"We already have paper cards."</h3>
                 <p className="text-zinc-500 text-sm leading-relaxed">Most teams do, until they realize they spend $50+ per employee every time details change. Aura Tap is a one-time $20 investment per person that lasts years.</p>
              </div>
              <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800">
                 <h3 className="text-xl font-display font-bold mb-4 text-white italic">"Is it hard for field teams?"</h3>
                 <p className="text-zinc-500 text-sm leading-relaxed">No. It takes around 60 seconds to connect each card. Team bundles include onboarding support so every field rep is ready to network immediately.</p>
              </div>
            </div>
          </div>

          <div id="questions" className="space-y-4">
             {decisionMakerFaqs.map((faq, index) => (
               <motion.div 
                 key={index} 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.1 }}
                 className="rounded-2xl border border-zinc-800 bg-zinc-900/10 overflow-hidden"
               >
                 <button 
                   onClick={() => setOpenIndex(openIndex === index ? null : index)}
                   className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-zinc-900/50 transition-colors"
                 >
                    <span className="text-sm font-medium text-white">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                 </button>
                 {openIndex === index && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     className="px-8 pb-6 text-zinc-500 text-sm leading-relaxed"
                   >
                     {faq.a}
                   </motion.div>
                 )}
               </motion.div>
             ))}
          </div>

          <div className="mt-24 p-12 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-aura-black border border-zinc-800 text-center">
            <MessageCircle className="w-12 h-12 text-aura-gold mx-auto mb-6 opacity-50" />
            <h2 className="text-3xl font-display font-bold mb-4">Still have questions?</h2>
            <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Our specialist team is available 9am-5pm EST to help with team onboarding and custom orders.</p>
            <button className="px-8 py-4 bg-aura-lime text-aura-black font-bold rounded-xl hover:bg-white transition-all shadow-lg shadow-aura-lime/20">
              Contact Sales Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
