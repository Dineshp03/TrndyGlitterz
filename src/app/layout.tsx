import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";


import { Cormorant_Garamond, Outfit, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FooterWrapper from "@/components/FooterWrapper";
import CartDrawer from "@/components/CartDrawer";
import SmoothScroll from "@/components/SmoothScroll";
import { Toaster } from "sonner";
import CartInitializer from "@/components/CartInitializer";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap",
});

import { siteConfig } from "@/lib/metadata-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.defaultTitle,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "Trendy Glitterz",
      url: siteConfig.url,
    },
  ],
  creator: "Trendy Glitterz",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@trendyglitterz",
  },
  icons: {
    icon: "/favicon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Preconnect to image domains for faster loading on mobile data */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://qkfsfxgbhswtihthyctk.supabase.co" />
        <link rel="dns-prefetch" href="https://qkfsfxgbhswtihthyctk.supabase.co" />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress browser extension errors (e.g. MetaMask, password managers, adblockers) 
              // from triggering Next.js runtime error overlays in development mode.
              if (typeof window !== 'undefined') {
                window.addEventListener('error', (event) => {
                  if (event.filename && (event.filename.includes('chrome-extension') || event.filename.includes('moz-extension'))) {
                    event.stopImmediatePropagation();
                  }
                }, true);
                window.addEventListener('unhandledrejection', (event) => {
                  const reason = event.reason;
                  const stack = reason && typeof reason === 'object' && 'stack' in reason ? reason.stack : '';
                  const message = reason && typeof reason === 'object' && 'message' in reason ? reason.message : '';
                  if (
                    (typeof stack === 'string' && (stack.includes('chrome-extension') || stack.includes('moz-extension'))) ||
                    (typeof message === 'string' && (message.includes('MetaMask') || message.includes('metamask')))
                  ) {
                    event.stopImmediatePropagation();
                  }
                }, true);
              }
            `
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${cormorant.variable} ${bebas.variable} font-sans antialiased bg-alabaster text-obsidian min-h-screen flex flex-col relative transition-colors duration-500`}
      >
        <ClerkProvider>
          <div className="noise-bg pointer-events-none fixed inset-0 z-[-1] opacity-[0.03]"></div>
          
          <SmoothScroll />
          <Navbar />
          <CartInitializer />
          <CartDrawer />
          <Toaster richColors position="bottom-right" />
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
          <FooterWrapper />
        </ClerkProvider>
      </body>
    </html>
  );
}
