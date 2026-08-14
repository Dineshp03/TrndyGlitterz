"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <footer className="bg-alabaster text-obsidian pt-24 md:pt-32 pb-12 border-t border-obsidian/10 relative overflow-hidden">
      
      {/* Huge background text — clipped to prevent mobile overflow */}
      <div className="absolute top-10 left-0 w-full overflow-hidden opacity-[0.03] select-none pointer-events-none flex justify-center">
        <span className="text-[8rem] sm:text-[12rem] md:text-[20rem] font-serif font-bold tracking-tighter leading-none whitespace-nowrap">GLITTERZ</span>
      </div>

      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 relative z-10">
        
        {/* Brand & Newsletter (Span 5) */}
        <div className="col-span-1 md:col-span-5 space-y-10 md:space-y-12">
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
                className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian group-hover:text-burgundy transition-colors px-4 shrink-0"
              >
                Submit
              </button>
            </form>
          </div>
        </div>

        {/* Space */}
        <div className="hidden md:block col-span-1 md:col-span-1"></div>

        {/* Links — 2 cols on mobile, 4 cols on tablet+ */}
        <div className="col-span-1 md:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-6">
          
          <div className="space-y-6 md:space-y-8">
            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40">Explore</h4>
            <ul className="space-y-3 md:space-y-4 text-sm font-sans font-light">
              <li><Link href="/#all-products" className="hover:text-burgundy transition-colors">Collections</Link></li>
              <li><Link href="/#new-arrivals" className="hover:text-burgundy transition-colors">New Arrivals</Link></li>
              <li><Link href="/#about" className="hover:text-burgundy transition-colors">Our Story</Link></li>
              <li><Link href="/#about" className="hover:text-burgundy transition-colors">Our Ethos</Link></li>
            </ul>
          </div>

          <div className="space-y-6 md:space-y-8">
            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40">Support</h4>
            <ul className="space-y-3 md:space-y-4 text-sm font-sans font-light">
              <li><Link href="/shipping-policy" className="hover:text-burgundy transition-colors">Shipping Policy</Link></li>
              <li><Link href="/return-and-refund" className="hover:text-burgundy transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-burgundy transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-burgundy transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="space-y-6 md:space-y-8">
            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40">Social</h4>
            <ul className="space-y-3 md:space-y-4 text-sm font-sans font-light">
              <li><a href="https://www.instagram.com/trendyglitterz?igsh=MmRpanBnZ3NpOHhw" target="_blank" rel="noopener noreferrer" className="hover:text-burgundy transition-colors block">Instagram</a></li>
              <li><a href="https://wa.me/919884110778" target="_blank" rel="noopener noreferrer" className="hover:text-burgundy transition-colors block">WhatsApp</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6 md:space-y-8">
            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40">Contact</h4>
            <ul className="space-y-3 md:space-y-4 text-sm font-sans font-light">
              <li>
                <a href="mailto:trendyglitterzz@gmail.com" className="hover:text-burgundy transition-colors break-all">
                  trendyglitterzz@gmail.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/919884110778" target="_blank" rel="noopener noreferrer" className="hover:text-burgundy transition-colors">
                  +91 98841 10778
                </a>
              </li>
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
