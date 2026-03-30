import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Footerdemo } from "@/components/ui/footer-section";
import CartDrawer from "@/components/CartDrawer";
import SmoothScroll from "@/components/SmoothScroll";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TRENDY GLITTERZ | Editorial Collection",
  description: "Curated luxury accessories for the modern woman.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${cormorant.variable} font-sans antialiased bg-alabaster text-obsidian min-h-screen flex flex-col relative transition-colors duration-500`}
      >
        <SmoothScroll />
        <div className="noise-bg pointer-events-none fixed inset-0 z-[-1] opacity-[0.03]"></div>
        <Navbar />
        <CartDrawer />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
        <Footerdemo />
      </body>
    </html>
  );
}
