import { motion } from 'motion/react';
import { ShoppingBag, Minus, Plus, Check, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

export const products = [
  {
    name: "Aura Card",
    price: "$25",
    image: "https://images.unsplash.com/photo-1635350736475-c8cef4b21906?auto=format&fit=crop&q=80&w=600",
    description: "Minimal matte-black NFC card for executives, sales reps, and consultants.",
    bestFor: "INDIVIDUAL UNIT",
    features: ["Premium matte-black finish", "Instant contact sharing", "Durable PVC construction"],
    priceValue: 25,
    inStock: 500,
    urgency: "Only 24 ready-to-ship today",
    savings: "Ships in 3-5 days"
  },
  {
    name: "Aura Wristband",
    price: "$25",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
    description: "Hands-free NFC sharing for events, field teams, and trade show environments.",
    bestFor: "INDIVIDUAL UNIT",
    features: ["Adjustable silicone strap", "Water-resistant chip", "Perfect for events"],
    priceValue: 25,
    inStock: 300,
    urgency: "Only 18 event bands ready today",
    savings: "Ships in 3-5 days"
  },
  {
    name: "Duo Bundle",
    price: "$40",
    image: "https://images.unsplash.com/photo-1606857521015-7f9f94a83959?auto=format&fit=crop&q=80&w=600",
    description: "One Card + One Wristband. The complete personal toolkit for any networking scenario.",
    bestFor: "PERSONAL BUNDLE - SAVE $10",
    features: ["1x Aura Card", "1x Aura Wristband", "Unified profile management"],
    highlight: true,
    priceValue: 40,
    inStock: 300,
    urgency: "Most buyers choose this",
    savings: "Save $10"
  }
];

function ProductCard({ product, index }: { product: any, index: number }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const { addToCart } = useCart();

  const increment = () => setQuantity(prev => Math.min(prev + 1, product.inStock));
  const decrement = () => setQuantity(prev => Math.max(prev - 1, 1));

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Aura Tap - ${product.name}`,
      text: product.description,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (err) {
      // Re-throw if it wasn't a user cancellation
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`bg-aura-black rounded-3xl border ${product.highlight ? 'border-aura-lime/60 shadow-xl shadow-aura-lime/10' : 'border-zinc-800'} p-8 hover:border-aura-lime/60 transition-all group flex flex-col relative`}
    >
      <div className="absolute top-12 right-12 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/80 backdrop-blur-md border border-aura-lime/30 rounded-full shadow-[0_0_22px_rgba(184,255,44,0.08)]">
          <div className="w-1.5 h-1.5 rounded-full bg-aura-lime animate-pulse" />
          <span className="text-[9px] font-bold text-aura-lime uppercase tracking-widest">{product.urgency}</span>
        </div>
      </div>

      <div className="aspect-video rounded-xl overflow-hidden bg-zinc-900 mb-8 items-center justify-center flex">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
        />
      </div>
      
      <div className="mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${product.highlight ? 'text-aura-lime' : 'text-zinc-500'}`}>{product.bestFor}</span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-bold">{product.name}</h3>
        <div className="text-right">
          <span className="text-white font-bold text-2xl">{product.price}</span>
          <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-aura-lime">{product.savings}</div>
        </div>
      </div>
      
      <p className="text-zinc-500 text-xs mb-8 leading-relaxed h-12 line-clamp-2">{product.description}</p>
      
      <ul className="space-y-3 mb-10 flex-grow">
        {product.features.map((f: string) => (
          <li key={f} className="flex items-center gap-3 text-[11px] text-zinc-400">
            <div className="w-1 h-1 rounded-full bg-aura-gold" />
            {f}
          </li>
        ))}
      </ul>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 shrink-0">
          <button 
            onClick={decrement}
            className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center text-sm font-bold text-white tabular-nums">{quantity}</span>
          <button 
            onClick={increment}
            className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <button 
          onClick={handleAddToCart}
          className="flex-grow py-4 rounded-xl transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-aura-lime text-aura-black hover:bg-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-aura-lime/20"
        >
           {isAdded ? (
             <>
               <Check className="w-4 h-4" />
               Added
             </>
           ) : (
             <>
               <ShoppingBag className="w-4 h-4" />
               Add to Cart
             </>
           )}
        </button>

        <button 
          onClick={handleShare}
          className="w-[56px] h-[56px] shrink-0 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 hover:border-aura-lime hover:text-aura-lime transition-all"
          title="Share Product"
        >
          {isShared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-500">
        <span className="rounded-lg border border-zinc-800 py-2">Warranty</span>
        <span className="rounded-lg border border-zinc-800 py-2">Setup inc.</span>
        <span className="rounded-lg border border-zinc-800 py-2">No fees</span>
      </div>
    </motion.div>
  );
}

export default function Products() {
  const { addToCart } = useCart();
  const duoBundle = products.find((product) => product.name === 'Duo Bundle')!;

  return (
    <section id="products" className="py-24 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <div className="text-aura-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Solo Hardware</div>
          <h2 className="text-3xl md:text-5xl font-display font-bold">Standard <span className="text-aura-gold italic">Units.</span></h2>
          <div className="mt-8 mx-auto grid max-w-3xl grid-cols-1 gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400 sm:grid-cols-3">
            <div className="rounded-full border border-aura-lime/25 bg-aura-lime/5 px-4 py-3 text-aura-lime">1,200+ pros upgraded</div>
            <div className="rounded-full border border-zinc-800 px-4 py-3">Ships in 3-5 days</div>
            <div className="rounded-full border border-zinc-800 px-4 py-3">12-month warranty</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            // @ts-ignore - key prop is handled by React
            <ProductCard key={product.name} product={product} index={index} />
          ))}
        </div>
      </div>
      <div className="fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-aura-lime/30 bg-black/85 p-3 shadow-2xl shadow-aura-lime/10 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.22em] text-aura-lime">Most buyers choose Duo</div>
            <div className="text-sm font-bold text-white">$40 bundle <span className="text-zinc-500">/ save $10</span></div>
          </div>
          <button
            onClick={() => addToCart(duoBundle, 1)}
            className="rounded-xl bg-aura-lime px-4 py-3 text-[10px] font-black uppercase tracking-widest text-aura-black"
          >
            Add now
          </button>
        </div>
      </div>
    </section>
  );
}
