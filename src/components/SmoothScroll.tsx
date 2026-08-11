"use client";

import { useEffect } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip Lenis on any touch-primary device: iOS, Android, iPads, Windows Tablets
    // These devices already have excellent native momentum scrolling built into the OS.
    // Lenis on touch devices adds unnecessary JS overhead and can cause jank on mobile data.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const isAndroid = /Android/.test(navigator.userAgent);

    // coarse pointer + no hover = touch-only device (phones, tablets, iPads)
    const isTouchPrimary = window.matchMedia('(pointer: coarse)').matches;

    if (isIOS) {
      document.documentElement.classList.add('is-ios');
    }

    // On any touch-primary device (phones, tablets, iPads, Android), skip Lenis
    // and let the OS handle scrolling natively for maximum smoothness.
    if (isIOS || isAndroid || isTouchPrimary) return;

    // Desktop (Windows / Mac): Use Lenis for buttery smooth scrolling
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Ensure we start at top on fresh mount
    if (pathname === '/') {
      lenis.scrollTo(0, { immediate: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
