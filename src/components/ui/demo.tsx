"use client";
import React from "react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "Trendy Glitterz has completely elevated my everyday style. The sculptural gold bands are not just jewelry; they're wearable art that catches everyone's eye.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
    name: "Elena Rossi",
    role: "Fashion Editor",
  },
  {
    text: "I was looking for minimalist statement pieces and found exactly that. The craftsmanship is flawless, and the packaging makes it feel so luxurious.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=60",
    name: "Marcus Chen",
    role: "Art Director",
  },
  {
    text: "The delivery was quick, and the unboxing experience was incredibly premium. These are the modern classics I’ll wear forever.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60",
    name: "Sarah Jenkins",
    role: "Architect",
  },
  {
    text: "Absolutely stunning pieces! The ethereal opal ring has become my signature accessory. It layers perfectly with my other minimalist jewelry.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=60",
    name: "Amina Al-Fayed",
    role: "Stylist",
  },
  {
    text: "I've never received so many compliments on my earrings before. The vintage ruby solitaire feels incredibly unique and modern.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=60",
    name: "Claire Dubois",
    role: "Designer",
  },
  {
    text: "The perfect balance of dramatic and understated. I wear my stacked diamond row piece to meetings and gallery openings alike.",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=60",
    name: "Julian Rivera",
    role: "Curator",
  },
  {
    text: "Exceptional quality and thoughtful design. Every piece from Trendy Glitterz feels curated just for me. Highly recommended.",
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&auto=format&fit=crop&q=60",
    name: "Isabella Martinez",
    role: "Boutique Owner",
  },
  {
    text: "Finding modern, sculptural jewelry that doesn’t break the bank is impossible, until I found this brand. I am a customer for life.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60",
    name: "Olivia Zhang",
    role: "Creative Director",
  },
  {
    text: "These accessories transform any basic outfit into a styled look. The attention to detail in their imported editions is remarkable.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60",
    name: "Liam O'Connor",
    role: "Photographer",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const Testimonials = () => {
  return (
    <section className="bg-alabaster/50 my-20 relative overflow-hidden">
      <div className="container z-10 mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
           viewport={{ once: true }}
           className="flex flex-col items-center justify-center max-w-[540px] mx-auto text-obsidian"
        >
          <div className="flex justify-center mb-6">
            <div className="border border-obsidian/20 py-1.5 px-6 rounded-full text-[10px] font-mono tracking-[0.2em] uppercase text-obsidian/60 bg-white/50 backdrop-blur-sm shadow-sm">
              Voices of Elegance
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif tracking-tighter text-center">
            What our clients say
          </h2>
          <p className="text-center mt-6 text-sm md:text-base font-sans font-light text-obsidian/70">
            See how our curated pieces are transforming personal styles around the world.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-16 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] h-[650px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={20} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={25} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={22} />
        </div>
      </div>
    </section>
  );
};
