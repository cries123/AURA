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
      <section className="relative overflow-hidden px-6 pb-24 pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_12%,rgba(184,255,44,0.08),transparent_22%),radial-gradient(circle_at_18%_48%,rgba(232,215,162,0.12),transparent_24%)]" />
        
        <div className="relative z-10 mx-auto grid min-h-[64vh] max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-5 text-[10px] font-black uppercase tracking-[0.42em] text-aura-gold">Aura Affiliate Program</div>
            <h1 className="font-display text-5xl font-black uppercase leading-[0.86] tracking-[-0.065em] text-white md:text-7xl lg:text-8xl">
              Build revenue with every tap.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
              Join the Aura reseller network. Buy hardware at partner discounts, sell locally, and onboard clients into a premium NFC platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['Up to 40% off', 'Reseller dashboard', 'Bulk hardware', 'Portal tracking'].map((tag, index) => (
                <span
                  key={tag}
                  className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${index === 0 ? 'border-aura-lime/30 bg-aura-lime/5 text-aura-lime' : 'border-white/10 bg-white/[0.035] text-zinc-300'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-10">
              {isAffiliate ? (
                <Link 
                  to="/portal"
                  className="inline-flex items-center gap-3 rounded-2xl bg-aura-lime px-10 py-5 font-bold text-aura-black shadow-xl shadow-aura-lime/20 transition-all hover:scale-105 hover:bg-white"
                >
                  Access Affiliate Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-2xl bg-aura-lime px-10 py-5 font-bold text-aura-black shadow-xl shadow-aura-lime/20 transition-all hover:scale-105 hover:bg-white"
                >
                  Apply for Reseller Access
                </button>
              )}
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
            <div className="relative w-80 rounded-[2rem] border border-white/10 bg-black/45 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur">
              <div className="mb-8 flex items-center justify-between">
                <div className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-aura-gold">Partner Console</div>
                <div className="rounded-full border border-aura-lime/30 bg-aura-lime/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-aura-lime">Open</div>
              </div>
              <BarChart3 className="mb-6 h-12 w-12 text-aura-lime" />
              <div className="mb-2 font-display text-3xl font-black text-white">Reseller Margin</div>
              <p className="mb-8 text-sm leading-7 text-zinc-500">Track tiers, codes, applications, and local client rollouts from one dashboard.</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {['15%', '25%', '40%'].map((value) => (
                  <div key={value} className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
                    <div className="text-lg font-black text-white">{value}</div>
                    <div className="text-[8px] uppercase tracking-widest text-zinc-600">Tier</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tiers Section */}
      <section id="tiers" className="py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="mb-4 text-[10px] font-black uppercase tracking-[0.42em] text-aura-gold">Partner Tiers</div>
            <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-[-0.055em] mb-4">Volume <span className="text-aura-gold">Discount</span> Tiers</h2>
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
                className={`p-10 rounded-[2.5rem] border relative group transition-all backdrop-blur ${tier.highlight ? 'bg-aura-lime/5 border-aura-lime/40 shadow-xl shadow-aura-lime/5' : 'bg-black/35 border-white/10'}`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-aura-lime text-aura-black text-[10px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_18px_rgba(184,255,44,0.45)]">
                    Most Popular
                  </div>
                )}
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-6 ${tier.highlight ? 'text-aura-lime' : tier.color}`}>{tier.name}</div>
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
              <div className="text-aura-gold text-[10px] font-black uppercase tracking-[0.42em] mb-8">The Workflow</div>
              <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-[-0.055em] mb-12">How it <span className="text-aura-gold">works.</span></h2>
              
              <div className="space-y-12">
                {[
                  { icon: <ShieldCheck />, title: "Get Approved", desc: "Apply and receive your unique reseller discount code." },
                  { icon: <Package />, title: "Purchase in Bulk", desc: "Order NFC cards or wristbands using your code to lock in margins." },
                  { icon: <DollarSign />, title: "Sell & Onboard", desc: "Reprice and sell to your clients. We handle the platform; you handle the sale." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.035] border border-white/10 flex items-center justify-center shrink-0 text-aura-lime">
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
              <div className="aspect-square rounded-[3rem] bg-black/35 border border-white/10 overflow-hidden p-12 flex flex-col justify-center backdrop-blur">
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
