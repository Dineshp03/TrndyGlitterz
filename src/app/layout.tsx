import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { Cormorant_Garamond, Outfit } from "next/font/google";
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
        <ClerkProvider>
          <div className="noise-bg pointer-events-none fixed inset-0 z-[-1] opacity-[0.03]"></div>
          
          <header className="fixed top-0 left-0 right-0 z-[60] px-6 py-2 flex justify-end gap-4 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-4 bg-obsidian backdrop-blur-md px-4 py-1.5 rounded-full border border-obsidian/20 text-[10px] font-sans uppercase tracking-widest text-alabaster shadow-sm hover:shadow-md transition-all">
              <Show when="signed-out">
                <SignInButton />
                <SignUpButton />
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </header>

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
