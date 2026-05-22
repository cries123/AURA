import { motion } from 'motion/react';
import { ShoppingBag, Minus, Plus, Check, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const products = [
  {
    name: "Aura Card",
    price: "$25",
    image: "https://images.unsplash.com/photo-1635350736475-c8cef4b21906?auto=format&fit=crop&q=80&w=600",
    description: "Minimal matte-black NFC card for executives, sales reps, and consultants.",
    bestFor: "INDIVIDUAL UNIT",
    features: ["Premium matte-black finish", "Instant contact sharing", "Durable PVC construction"],
    priceValue: 25,
    inStock: 500
  },
  {
    name: "Aura Wristband",
    price: "$25",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
    description: "Hands-free NFC sharing for events, field teams, and trade show environments.",
    bestFor: "INDIVIDUAL UNIT",
    features: ["Adjustable silicone strap", "Water-resistant chip", "Perfect for events"],
    priceValue: 25,
    inStock: 300
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
    inStock: 300
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
      className={`bg-aura-black rounded-3xl border ${product.highlight ? 'border-aura-gold/50 shadow-xl shadow-aura-gold/5' : 'border-zinc-800'} p-8 hover:border-aura-gold/50 transition-all group flex flex-col relative`}
    >
      <div className="absolute top-12 right-12 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{product.inStock} in stock</span>
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
        <span className={`text-[10px] font-bold uppercase tracking-widest ${product.highlight ? 'text-aura-gold' : 'text-zinc-500'}`}>{product.bestFor}</span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-bold">{product.name}</h3>
        <span className="text-white font-bold text-2xl">{product.price}</span>
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
          className="flex-grow py-4 rounded-xl transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-aura-gold text-aura-black hover:bg-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-aura-gold/10"
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
          className="w-[56px] h-[56px] shrink-0 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 hover:border-aura-gold hover:text-aura-gold transition-all"
          title="Share Product"
        >
          {isShared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}

export default function Products() {
  return (
    <section id="products" className="py-24 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <div className="text-aura-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Solo Hardware</div>
          <h2 className="text-3xl md:text-5xl font-display font-bold">Standard <span className="text-aura-gold italic">Units.</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            // @ts-ignore - key prop is handled by React
            <ProductCard key={product.name} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
