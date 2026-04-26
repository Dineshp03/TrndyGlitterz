"use client";

import { usePathname } from "next/navigation";
import { Footerdemo } from "@/components/ui/footer-section";

export default function FooterWrapper() {
  const pathname = usePathname();
  
  // Hide footer on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <Footerdemo />;
}
