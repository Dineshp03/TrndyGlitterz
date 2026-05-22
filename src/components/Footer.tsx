"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <footer className="bg-alabaster text-obsidian pt-32 pb-12 border-t border-obsidian/10 relative overflow-hidden">
      
      {/* Huge background text */}
      <div className="absolute top-10 left-0 w-full overflow-hidden opacity-[0.03] select-none pointer-events-none flex justify-center whitespace-nowrap">
        <span className="text-[15rem] md:text-[20rem] font-serif font-bold tracking-tighter leading-none">GLITTERZ</span>
      </div>

      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-16 relative z-10">
        
        {/* Brand & Newsletter (Span 5) */}
        <div className="col-span-1 md:col-span-5 space-y-12">
          <h3 className="text-3xl md:text-4xl font-serif tracking-tight text-obsidian">
            TRENDY<br/><span className="italic pl-8 text-dustyrose">Glitterz</span>
          </h3>
          
          <div className="space-y-6">
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/60">
              Interested for more collections
            </p>
            <form className="flex border-b border-obsidian/30 group">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-transparent text-obsidian py-3 w-full focus:outline-none text-sm placeholder:text-obsidian/30"
              />
              <button 
                type="submit" 
                className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian group-hover:text-burgundy transition-colors px-4"
              >
                Submit
              </button>
            </form>
          </div>
        </div>

        {/* Space */}
        <div className="hidden md:block col-span-1 md:col-span-1"></div>

        {/* Links (Span 6) */}
        <div className="col-span-1 md:col-span-6 grid grid-cols-2 lg:grid-cols-3 gap-12">
          
          <div className="space-y-8">
            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40">Explore</h4>
            <ul className="space-y-4 text-sm font-sans font-light">
              <li><Link href="/#shop" className="hover:text-burgundy transition-colors">Collections</Link></li>
              <li><Link href="/#shop" className="hover:text-burgundy transition-colors">New Arrivals</Link></li>
              <li><Link href="#" className="hover:text-burgundy transition-colors">Journal</Link></li>
              <li><Link href="/#about" className="hover:text-burgundy transition-colors">Our Ethos</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40">Support</h4>
            <ul className="space-y-4 text-sm font-sans font-light">
              <li><Link href="#" className="hover:text-burgundy transition-colors">Concierge</Link></li>
              <li><Link href="#" className="hover:text-burgundy transition-colors">Shipping Returns</Link></li>
              <li><Link href="#" className="hover:text-burgundy transition-colors">Care Guide</Link></li>
              <li><Link href="#" className="hover:text-burgundy transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-8 col-span-2 lg:col-span-1">
            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40">Social</h4>
            <ul className="space-y-4 text-sm font-sans font-light">
              <li><a href="#" className="hover:text-burgundy transition-colors block">Instagram</a></li>
              <li><a href="#" className="hover:text-burgundy transition-colors block">Pinterest</a></li>
              <li><a href="#" className="hover:text-burgundy transition-colors block">TikTok</a></li>
            </ul>
          </div>
            {/* Important Links */}
            <div className="space-y-8">
              <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40">Important Links</h4>
              <ul className="space-y-4 text-sm font-sans font-light">
                <li><Link href="/privacy-policy" className="hover:text-burgundy transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-burgundy transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-burgundy transition-colors">Contact Us</Link></li>
                <li><Link href="/about" className="hover:text-burgundy transition-colors">About Us</Link></li>
              </ul>
            </div>

        </div>
      </div>
      
      <div className="container mx-auto px-6 md:px-12 mt-24 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-sans uppercase tracking-[0.1em] text-obsidian/40 relative z-10">
        <p>&copy; {new Date().getFullYear()} TRENDY GLITTERZ.</p>
        <p className="mt-4 md:mt-0">DESIGNED IN THE VOID</p>
      </div>
    </footer>
  );
}
