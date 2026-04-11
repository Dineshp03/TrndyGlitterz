import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { Cormorant_Garamond, Outfit, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Footerdemo } from "@/components/ui/footer-section";
import CartDrawer from "@/components/CartDrawer";
import SmoothScroll from "@/components/SmoothScroll";
import { Toaster } from "sonner";

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

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
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
        className={`${outfit.variable} ${cormorant.variable} ${bebas.variable} font-sans antialiased bg-alabaster text-obsidian min-h-screen flex flex-col relative transition-colors duration-500`}
      >
        <ClerkProvider>
          <div className="noise-bg pointer-events-none fixed inset-0 z-[-1] opacity-[0.03]"></div>
          
          <SmoothScroll />
          <Navbar />
          <CartDrawer />
          <Toaster richColors position="bottom-right" />
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
          <Footerdemo />
        </ClerkProvider>
      </body>
    </html>
  );
}
