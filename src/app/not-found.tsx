import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-alabaster flex flex-col items-center justify-center text-center p-6 pt-32">
      <div className="w-16 h-16 rounded-full bg-dustyrose/10 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-dustyrose animate-pulse" />
      </div>
      <h1 className="text-4xl md:text-6xl font-serif text-obsidian mb-4">Page Not Found</h1>
      <p className="text-obsidian/60 max-w-md font-sans text-sm mb-8 leading-relaxed">
        The item or page you are looking for might have been moved or is currently unavailable.
      </p>
      <Link
        href="/catalog"
        className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-[#111] font-bold py-4 px-8 rounded-xl font-sans uppercase text-[11px] tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all"
      >
        <ArrowLeft size={16} />
        Back to Catalog
      </Link>
    </div>
  );
}
