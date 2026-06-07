import { AnimatePresence, motion } from 'motion/react';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from './Products';

export default function FloatingCartControl() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const { items, totalItems, totalPrice, removeFromCart, addToCart } = useCart();
  const cartItemNames = items.map((item) => item.name);
  const upsellProduct =
    products.find((product) => product.name === 'Duo Bundle' && !cartItemNames.includes(product.name)) ??
    products.find((product) => !cartItemNames.includes(product.name));

  return (
    <>
      <button
        onClick={() => setCartOpen(true)}
        className="fixed right-6 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white backdrop-blur transition hover:border-aura-lime/70 hover:text-aura-lime md:right-10"
        aria-label="Open cart"
      >
        <ShoppingBag className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-aura-lime text-[10px] font-black text-aura-black shadow-[0_0_18px_rgba(184,255,44,0.75)]">
            {totalItems}
          </span>
        )}
      </button>

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-aura-black shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 p-8">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-6 w-6 text-aura-lime" />
                  <h2 className="font-display text-xl font-bold">Your Cart</h2>
                  <span className="rounded-md bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-500">
                    {totalItems}
                  </span>
                </div>
                <button onClick={() => setCartOpen(false)} className="text-zinc-500 transition-colors hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900">
                      <ShoppingBag className="h-8 w-8 text-zinc-700" />
                    </div>
                    <p className="text-sm text-zinc-500">Your cart is empty.</p>
                    <Link
                      to="/pricing#products"
                      onClick={() => setCartOpen(false)}
                      className="mt-6 text-[10px] font-bold uppercase tracking-widest text-aura-lime hover:underline"
                    >
                      Browse Units
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {items.map((item) => (
                      <div key={item.name} className="group flex gap-6">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover opacity-60" />
                        </div>
                        <div className="flex-grow">
                          <div className="mb-1 flex justify-between">
                            <h3 className="text-sm font-bold">{item.name}</h3>
                            <button
                              onClick={() => removeFromCart(item.name)}
                              className="text-zinc-600 transition-colors hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mb-3 text-[10px] uppercase tracking-widest text-zinc-500">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-bold text-white">${item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {upsellProduct && (
                      <div className="rounded-2xl border border-aura-lime/30 bg-aura-lime/5 p-5">
                        <div className="mb-2 text-[9px] font-black uppercase tracking-[0.28em] text-aura-lime">
                          Quick add upgrade
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                            <img src={upsellProduct.image} alt={upsellProduct.name} className="h-full w-full object-cover opacity-70" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-white">{upsellProduct.name}</h4>
                            <p className="text-[10px] text-zinc-500">
                              {upsellProduct.name === 'Duo Bundle'
                                ? 'Upgrade to the bundle and save $10.'
                                : 'Complete the kit before checkout.'}
                            </p>
                          </div>
                          <button
                            onClick={() => addToCart(upsellProduct, 1)}
                            className="rounded-xl bg-aura-lime px-4 py-3 text-[10px] font-black uppercase tracking-widest text-aura-black transition hover:bg-white"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-zinc-800 bg-zinc-900/10 p-8">
                  <div className="mb-6">
                    <label className="mb-3 ml-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Setup Email Required
                    </label>
                    <input
                      type="email"
                      value={checkoutEmail}
                      onChange={(e) => {
                        setCheckoutEmail(e.target.value);
                        if (emailError) setEmailError(false);
                      }}
                      placeholder="Enter your email for setup instructions"
                      className={`w-full rounded-xl border ${emailError ? 'border-red-500/50' : 'border-zinc-800'} bg-zinc-900/50 px-4 py-3 text-sm text-white transition-colors focus:border-aura-lime focus:outline-none`}
                    />
                    <p className="mt-2 text-[9px] italic text-zinc-600">
                      Setup link is sent instantly. Hardware ships in 3-5 days.
                    </p>
                  </div>

                  <div className="mb-6 flex justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Subtotal</span>
                    <span className="text-xl font-bold text-white">${totalPrice}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (!checkoutEmail.includes('@')) {
                        setEmailError(true);
                      }
                    }}
                    className="w-full rounded-xl bg-aura-lime py-4 text-[11px] font-black uppercase tracking-widest text-aura-black transition-all hover:bg-white shadow-lg shadow-aura-lime/20"
                  >
                    Checkout Now
                  </button>
                  <p className="mt-4 text-center text-[10px] italic text-zinc-600">
                    Secure checkout. 12-month warranty. No monthly fees.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
