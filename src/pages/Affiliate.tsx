import { motion } from 'motion/react';
import { DollarSign, BarChart3, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import LeadFormModal from '../components/LeadFormModal';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: "Silver Reseller",
    volume: "10 - 49 Units",
    discount: "15% OFF",
    benefit: "Perfect for local networking groups",
    color: "text-zinc-400",
    border: "border-zinc-800"
  },
  {
    name: "Gold Partner",
    volume: "50 - 199 Units",
    discount: "25% OFF",
    benefit: "Ideal for small agencies and consultants",
    color: "text-aura-gold",
    border: "border-aura-gold/30",
    highlight: true
  },
  {
    name: "Platinum Distributor",
    volume: "200+ Units",
    discount: "40% OFF",
    benefit: "Maximized margins for enterprise vendors",
    color: "text-white",
    border: "border-white/20"
  }
];

export default function Affiliate() {
  const { isAffiliate } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div id="affiliate-top" className="min-h-screen bg-transparent text-white selection:bg-aura-gold selection:text-aura-black">
      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-square bg-aura-gold/5 rounded-full blur-[120px] -translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] uppercase tracking-[0.2em] font-bold text-aura-gold mb-8"
          >
            Aura Affiliate Program
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-display font-medium tracking-tight mb-8 leading-[0.9]">
            Scale your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aura-gold to-[#f2e6b8] italic">revenue</span> with Aura.
          </h1>
          
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Join our exclusive reseller network. Purchase Aura hardware at deep discounts and sell to your local market with managed margins.
          </p>

          {isAffiliate ? (
            <Link 
              to="/portal"
              className="px-10 py-5 bg-aura-lime text-aura-black font-bold rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-xl shadow-aura-lime/20 inline-flex items-center gap-3"
            >
              Access Affiliate Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-10 py-5 bg-aura-lime text-aura-black font-bold rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-xl shadow-aura-lime/20"
            >
              Apply for Reseller Access
            </button>
          )}
        </div>
      </section>

      {/* Tiers Section */}
      <section id="tiers" className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-display font-bold italic mb-4">Volume <span className="text-aura-gold">Discount</span> Tiers</h2>
            <p className="text-zinc-500 text-sm">The more you buy, the higher your profit margin per unit.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, i) => (
              <motion.div 
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-10 rounded-[2.5rem] bg-zinc-900/20 border ${tier.border} relative group hover:bg-zinc-900/40 transition-all`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-aura-lime text-aura-black text-[10px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_18px_rgba(184,255,44,0.45)]">
                    Most Popular
                  </div>
                )}
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-6 ${tier.color}`}>{tier.name}</div>
                <div className="text-4xl font-display font-bold mb-2">{tier.discount}</div>
                <div className="text-sm text-zinc-500 mb-8">{tier.volume}</div>
                
                <div className="h-px w-full bg-zinc-800 mb-8" />
                
                <p className="text-sm text-zinc-400 group-hover:text-white transition-colors">{tier.benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="workflow" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <div className="text-aura-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-8">The Workflow</div>
              <h2 className="text-4xl font-display font-bold mb-12">How it <span className="italic">works.</span></h2>
              
              <div className="space-y-12">
                {[
                  { icon: <ShieldCheck />, title: "Get Approved", desc: "Apply and receive your unique reseller discount code." },
                  { icon: <Package />, title: "Purchase in Bulk", desc: "Order NFC cards or wristbands using your code to lock in margins." },
                  { icon: <DollarSign />, title: "Sell & Onboard", desc: "Reprice and sell to your clients. We handle the platform; you handle the sale." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-aura-gold">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                      <p className="text-zinc-500 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-[3rem] bg-zinc-900/50 border border-zinc-800 overflow-hidden p-12 flex flex-col justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-aura-gold mx-auto mb-8" />
                  <h3 className="text-2xl font-display font-bold mb-4">Unlimited Earning Potential</h3>
                  <p className="text-zinc-500 text-sm mb-8">Set your own pricing models for your clients while managing their team dashboards through the Aura Portal.</p>
                  <div className="inline-flex items-center gap-2 text-aura-gold text-xs font-bold uppercase tracking-widest cursor-pointer hover:gap-4 transition-all">
                    Review Reseller Agreement <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-aura-gold/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      <LeadFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bundleName="Reseller Partnership"
      />
    </div>
  );
}
