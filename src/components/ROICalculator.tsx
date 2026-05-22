import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calculator, TrendingDown, DollarSign } from 'lucide-react';

interface ROICalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ROICalculator({ isOpen, onClose }: ROICalculatorProps) {
  const [teamSize, setTeamSize] = useState(10);
  const [reorderFreq, setReorderFreq] = useState(2); // times per year
  const paperCostPerHead = 50; // $50 per reorder
  const auraCost = 20;

  const annualPaperCost = teamSize * reorderFreq * paperCostPerHead;
  const auraOneTimeCost = teamSize * auraCost;
  
  const threeYearSavings = (annualPaperCost * 3) - auraOneTimeCost;
  const fiveYearSavings = (annualPaperCost * 5) - auraOneTimeCost;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-aura-black/90 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          <div className="p-8 md:p-12">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-aura-gold/10 text-aura-gold">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">ROI Calculator</h2>
                <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Paper vs. Aura Tap</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-3 flex justify-between">
                    Team Size <span>{teamSize} people</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={teamSize} 
                    onChange={(e) => setTeamSize(parseInt(e.target.value))}
                    className="w-full accent-aura-gold h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-3 flex justify-between">
                    Reorders / Year <span>{reorderFreq} times</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="4" 
                    value={reorderFreq} 
                    onChange={(e) => setReorderFreq(parseInt(e.target.value))}
                    className="w-full accent-aura-gold h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-600 mt-2 italic">Based on title changes, new hires, or running out of stock.</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-950/50 border border-zinc-800 flex flex-col justify-center">
                 <div className="text-center">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Annual Paper Cost</p>
                    <p className="text-4xl font-display font-bold text-white">${annualPaperCost.toLocaleString()}</p>
                 </div>
                 <div className="h-px bg-zinc-800 my-6" />
                 <div className="text-center">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Aura One-Time Cost</p>
                    <p className="text-2xl font-display font-bold text-aura-gold">${auraOneTimeCost.toLocaleString()}</p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-aura-gold/5 border border-aura-gold/20 relative overflow-hidden">
                <TrendingDown className="absolute -bottom-2 -right-2 w-16 h-16 text-aura-gold/10" />
                <p className="text-zinc-400 text-xs font-bold uppercase mb-2">3-Year Savings</p>
                <p className="text-3xl font-display font-bold text-white">${threeYearSavings.toLocaleString()}</p>
              </div>
              <div className="p-6 rounded-2xl bg-aura-gold/10 border border-aura-gold/30">
                <p className="text-zinc-400 text-xs font-bold uppercase mb-2">5-Year Savings</p>
                <p className="text-3xl font-display font-bold text-aura-gold">${fiveYearSavings.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-4 p-4 rounded-xl bg-zinc-950/50 text-[10px] text-zinc-500 italic">
               <DollarSign className="w-4 h-4 text-aura-gold flex-shrink-0" />
               Aura Tap eliminates the $50+ reordering fee per employee that occurs every time details change or stock runs low.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
