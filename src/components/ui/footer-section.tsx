"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Facebook, Instagram, Linkedin, Moon, Send, Sun, Twitter } from "lucide-react"
import { useState } from "react"

function Footerdemo() {
  const pathname = usePathname()
  const [isDarkMode, setDarkMode] = useState(true)

  // Hide footer on login/signup
  if (pathname === "/login" || pathname === "/signup") {
    return null
  }

  return (
    <footer className="relative overflow-hidden w-full h-full">
      {/* Container that switches background colors based on state */}
      <div 
        className={`border-t border-obsidian/10 transition-colors duration-500 overflow-hidden relative w-full h-full ${isDarkMode ? 'footer-dark' : 'footer-light'}`}
      >
      {/* Huge watermark text */}
      <div className="absolute top-6 left-0 w-full overflow-hidden select-none pointer-events-none flex justify-center whitespace-nowrap text-obsidian">
        <span className="text-[12rem] md:text-[18rem] font-serif font-bold tracking-tighter leading-none opacity-[0.04]">
          GLITTERZ
        </span>
      </div>

      <div className="container mx-auto px-6 py-16 md:px-12 lg:px-16 relative z-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* ── Newsletter ────────────────────────────────── */}
          <div className="relative">
            <h3 className="text-3xl md:text-4xl font-serif tracking-tight mb-2">
              TRENDY<br/>
              <span className="italic pl-8 text-dustyrose">Glitterz</span>
            </h3>
            <p className="mb-6 text-sm font-sans font-light text-obsidian/60 leading-relaxed">
              Join our newsletter for the latest collections and exclusive member offers.
            </p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Email Address"
                className="pr-12 bg-transparent border-obsidian/20 text-obsidian placeholder:text-obsidian/30 focus-visible:ring-dustyrose/40 rounded-xl"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-dustyrose text-alabaster transition-transform hover:scale-105 hover:bg-dustyrose/80"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-dustyrose/10 blur-2xl pointer-events-none" />
          </div>

          {/* ── Quick Links ───────────────────────────────── */}
          <div>
            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 mb-6">Explore</h4>
            <nav className="space-y-3 text-sm font-sans font-light">
              <Link href="/catalog" className="block transition-colors hover:text-dustyrose">Collections</Link>
              <Link href="/catalog?featured=true" className="block transition-colors hover:text-dustyrose">New Arrivals</Link>
              <Link href="/catalog" className="block transition-colors hover:text-dustyrose">Journal</Link>
              <Link href="/#about" className="block transition-colors hover:text-dustyrose">Our Ethos</Link>
              <Link href="/login" className="block transition-colors hover:text-dustyrose">Member Login</Link>
            </nav>
          </div>

          {/* ── Support ───────────────────────────────────── */}
          <div>
            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 mb-6">Support</h4>
            <address className="space-y-3 text-sm font-sans font-light not-italic text-obsidian/80">
              <p>Concierge Service</p>
              <p>Shipping &amp; Returns</p>
              <p>Care Guide</p>
              <p>FAQ</p>
              <div className="pt-2 space-y-1">
                <a 
                  href="https://wa.me/919884110778?text=Hi%20Trendy%20Glitterz!%20I'm%20reaching%20out%20from%20the%20website%20regarding%20some%20of%20your%20jewelry%20products." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-[#25D366] hover:text-[#128C7E] transition-colors font-medium"
                >
                  WhatsApp: +91 9884110778
                </a>
                <p className="text-obsidian/50 text-[11px]">trendyglitterzz@gmail.com</p>
              </div>
            </address>
          </div>

          {/* ── Social + Theme Toggle ─────────────────────── */}
          <div className="relative">
            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 mb-6">Follow Us</h4>
            <div className="mb-6 flex space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full border-obsidian/15 hover:bg-dustyrose/10 hover:text-dustyrose hover:border-dustyrose/30 transition-all">
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Follow us on Facebook</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full border-obsidian/15 hover:bg-dustyrose/10 hover:text-dustyrose hover:border-dustyrose/30 transition-all">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Follow us on Twitter</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full border-obsidian/15 hover:bg-dustyrose/10 hover:text-dustyrose hover:border-dustyrose/30 transition-all">
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Follow us on Instagram</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full border-obsidian/15 hover:bg-dustyrose/10 hover:text-dustyrose hover:border-dustyrose/30 transition-all">
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Connect with us on LinkedIn</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Dark / Light toggle — now drives site-wide theme */}
            <div className="flex items-center space-x-2 text-obsidian/50">
              <Sun className="h-4 w-4" />
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setDarkMode}
              />
              <Moon className="h-4 w-4" />
              <Label htmlFor="dark-mode" className="sr-only">
                Toggle dark mode
              </Label>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────── */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-obsidian/10 pt-8 text-center md:flex-row">
          <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-obsidian/40">
            &copy; {new Date().getFullYear()} TRENDY GLITTERZ. All rights reserved.
          </p>
          <nav className="flex gap-6 text-[10px] font-sans uppercase tracking-[0.1em] text-obsidian/40">
            <Link href="/privacy" className="transition-colors hover:text-dustyrose">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-dustyrose">Terms of Service</Link>
            <Link href="/cookies" className="transition-colors hover:text-dustyrose">Cookie Settings</Link>
          </nav>
        </div>
      </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
