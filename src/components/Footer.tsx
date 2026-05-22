import { Smartphone, Instagram, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-aura-black pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-zinc-900/10 border border-zinc-800 p-12 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Smartphone className="text-aura-gold w-6 h-6" />
              <span className="text-xl font-display font-bold tracking-tight text-white uppercase">Aura Tap</span>
            </div>
            <p className="text-zinc-500 text-xs mb-6 leading-relaxed max-w-[200px]">
              Premium NFC hardware and dashboard solutions for high-performance teams.
            </p>
            <div className="flex gap-4">
              <Instagram className="w-4 h-4 text-zinc-500 hover:text-aura-gold cursor-pointer transition-colors" />
              <Twitter className="w-4 h-4 text-zinc-500 hover:text-aura-gold cursor-pointer transition-colors" />
              <Linkedin className="w-4 h-4 text-zinc-500 hover:text-aura-gold cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">General</h4>
            <ul className="space-y-4">
              <li><a href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/affiliate" className="text-sm text-aura-gold hover:text-white transition-colors font-medium">Affiliate Program</a></li>
              <li><a href="/portal" className="text-sm text-zinc-400 hover:text-white transition-colors">Portal</a></li>
              <li><a href="/faq" className="text-sm text-zinc-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/warranty" className="text-sm text-zinc-400 hover:text-white transition-colors">Warranty</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-4">
              <li><a href="mailto:support@aurataps.net" className="text-sm text-zinc-400 hover:text-white transition-colors">Email Support</a></li>
              <li><a href="tel:+18059033231" className="text-sm text-zinc-400 hover:text-white transition-colors">Call Sales</a></li>
              <li><a href="/#contact" className="text-sm text-zinc-400 hover:text-white transition-colors">Contact Form</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-zinc-700 uppercase tracking-widest font-bold">
           <p>© 2024 Aura Tap. All Rights Reserved.</p>
           <p>Modern Networking for Modern Professionals.</p>
        </div>
      </div>
    </footer>
  );
}
