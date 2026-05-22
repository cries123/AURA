import { Smartphone, Instagram, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-aura-black pt-12 md:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-zinc-900/10 border border-zinc-800 p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Smartphone className="text-aura-gold w-6 h-6" />
              <span className="text-xl font-display font-bold tracking-tight text-white uppercase">Aura Tap</span>
            </div>
            <p className="text-zinc-500 text-xs mb-6 leading-relaxed max-w-[200px]">
              Premium NFC hardware and dashboard solutions for high-performance teams.
            </p>
            <div className="flex gap-4">
              <Instagram className="w-5 h-5 text-zinc-600 hover:text-aura-gold cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-zinc-600 hover:text-aura-gold cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-zinc-600 hover:text-aura-gold cursor-pointer transition-colors" />
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 underline decoration-aura-gold/30 underline-offset-8">Experience</h4>
            <ul className="space-y-4">
              <li><a href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/affiliate" className="text-sm text-aura-gold hover:text-white transition-colors font-medium">Partners</a></li>
              <li><a href="/portal" className="text-sm text-zinc-400 hover:text-white transition-colors">Portal</a></li>
              <li><a href="/faq" className="text-sm text-zinc-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/warranty" className="text-sm text-zinc-400 hover:text-white transition-colors">Warranty</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 underline decoration-aura-gold/30 underline-offset-8">Support</h4>
            <ul className="space-y-4">
              <li><a href="mailto:support@aurataps.net" className="text-sm text-zinc-400 hover:text-white transition-colors">Email Support</a></li>
              <li><a href="tel:+18059033231" className="text-sm text-zinc-400 hover:text-white transition-colors">Call Sales</a></li>
              <li><a href="/#contact" className="text-sm text-zinc-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 underline decoration-aura-gold/30 underline-offset-8">Legal</h4>
            <ul className="space-y-4 grid grid-cols-2 lg:grid-cols-1 gap-x-4">
              <li><a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-zinc-700 uppercase tracking-widest font-bold text-center">
           <p>© 2024 Aura Tap. All Rights Reserved.</p>
           <p className="hidden md:block">Modern Networking for Modern Professionals.</p>
        </div>
      </div>
    </footer>
  );
}
