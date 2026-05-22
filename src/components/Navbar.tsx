import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Smartphone, ShoppingBag, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const location = useLocation();
  const { items, totalItems, totalPrice, removeFromCart } = useCart();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll and close menus when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
    setCartOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Platform', href: '/platform' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Warranty', href: '/warranty' },
    { name: 'Affiliate', href: '/affiliate' },
    { name: 'Portal', href: '/portal' },
    { name: 'Contact', href: '#contact', primary: true },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-aura-black/90 backdrop-blur-md py-3 md:py-4 border-b border-zinc-800' 
          : 'bg-aura-black/60 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none py-3 md:py-6 border-b border-zinc-900 md:border-none'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-aura-gold flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Smartphone className="text-aura-black w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-lg md:text-xl font-display font-medium tracking-[0.1em] text-white uppercase">AURA <span className="text-aura-gold font-bold">TAP</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              <div className="flex items-center gap-8">
                {navLinks.slice(0, 6).map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.href} 
                    className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${location.pathname === link.href ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              
              <div className="h-4 w-px bg-zinc-800" />
              
              <div className="flex items-center gap-6">
                <Link 
                  to="/portal" 
                  className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${location.pathname === '/portal' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  Portal
                </Link>
                <button 
                  onClick={() => setCartOpen(true)}
                  className={`relative transition-all duration-300 p-2 rounded-lg flex items-center justify-center ${
                    cartOpen 
                      ? 'bg-aura-gold text-white shadow-lg shadow-aura-gold/20' 
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className={`absolute -top-1 -right-1 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      cartOpen ? 'bg-white text-aura-gold' : 'bg-aura-gold text-aura-black'
                    }`}>
                      {totalItems}
                    </span>
                  )}
                </button>
                <a 
                  href="#contact" 
                  className="px-6 py-2.5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-aura-gold transition-all"
                >
                  Contact Us
                </a>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-4 md:hidden">
              <button 
                onClick={() => setCartOpen(true)}
                className={`relative transition-all duration-300 p-2 rounded-lg flex items-center justify-center ${
                  cartOpen 
                    ? 'bg-aura-gold text-white shadow-lg shadow-aura-gold/20' 
                    : 'text-white'
                }`}
              >
                <ShoppingBag className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className={`absolute -top-1 -right-1 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    cartOpen ? 'bg-white text-aura-gold' : 'bg-aura-gold text-aura-black'
                  }`}>
                    {totalItems}
                  </span>
                )}
              </button>
              
              <button 
                className="text-white p-1 hover:text-aura-gold transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 w-full bg-aura-black/95 backdrop-blur-xl border-b border-zinc-800 overflow-hidden"
            >
              <div className="px-6 py-12 flex flex-col items-center gap-8">
                {navLinks.map((link) => (
                  link.href.startsWith('#') ? (
                    <a 
                      key={link.name} 
                      href={link.href} 
                      className={`text-[14px] font-bold uppercase tracking-[0.3em] ${link.primary ? 'px-8 py-3 bg-white text-black rounded-full w-full text-center' : 'text-zinc-400'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link 
                      key={link.name} 
                      to={link.href} 
                      className={`text-[14px] font-bold uppercase tracking-[0.3em] ${location.pathname === link.href ? 'text-white' : 'text-zinc-400'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-aura-black border-l border-zinc-800 z-[70] flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="text-aura-gold w-6 h-6" />
                  <h2 className="text-xl font-display font-bold">Your Cart</h2>
                  <span className="text-xs bg-zinc-900 text-zinc-500 px-2 py-1 rounded-md font-mono">{totalItems}</span>
                </div>
                <button onClick={() => setCartOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                      <ShoppingBag className="text-zinc-700 w-8 h-8" />
                    </div>
                    <p className="text-zinc-500 text-sm">Your cart is empty.</p>
                    <button 
                      onClick={() => setCartOpen(false)}
                      className="mt-6 text-aura-gold text-[10px] font-bold uppercase tracking-widest hover:underline"
                    >
                      Browse Units
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {items.map((item) => (
                      <div key={item.name} className="flex gap-6 group">
                        <div className="w-20 h-20 rounded-xl bg-zinc-900 overflow-hidden shrink-0 border border-zinc-800">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-60" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between mb-1">
                            <h3 className="text-sm font-bold">{item.name}</h3>
                            <button 
                              onClick={() => removeFromCart(item.name)}
                              className="text-zinc-600 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[10px] text-zinc-500 mb-3 uppercase tracking-widest">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-white">${item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="p-8 border-t border-zinc-800 bg-zinc-900/10">
                  <div className="mb-6">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-1">Setup Email Required</label>
                    <input 
                      type="email" 
                      value={checkoutEmail}
                      onChange={(e) => {
                        setCheckoutEmail(e.target.value);
                        if (emailError) setEmailError(false);
                      }}
                      placeholder="Enter your email for setup instructions"
                      className={`w-full bg-zinc-900/50 border ${emailError ? 'border-red-500/50' : 'border-zinc-800'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-aura-gold transition-colors`}
                    />
                    <p className="mt-2 text-[9px] text-zinc-600 italic">Instructions will be sent here immediately after payment.</p>
                  </div>

                  <div className="flex justify-between mb-6">
                    <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Subtotal</span>
                    <span className="text-white font-bold text-xl">${totalPrice}</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (!checkoutEmail.includes('@')) {
                        setEmailError(true);
                        return;
                      }
                      // Handle checkout
                    }}
                    className="w-full py-4 bg-white text-aura-black rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-aura-gold transition-all"
                  >
                    Checkout Now
                  </button>
                  <p className="mt-4 text-center text-[10px] text-zinc-600 italic">Always secure checkout. Setup included.</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
