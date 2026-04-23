"use client";
import React from "react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "Just now I received the order. It's beautiful! Nice quality, happy to shop with you. Everything is very nice mam. Thank you.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vanitha",
    name: "Ms. Vanitha",
    role: "Verified Customer",
  },
  {
    text: "It is beautiful as expected. Happy with quality mam. I am really happy with the purchase.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rizwan",
    name: "Mrs. Rizwan",
    role: "Verified Customer",
  },
  {
    text: "Bangle trial taken, finishing is very good. Mangalsutra is also very good. Hopefully will see more soon.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amey",
    name: "Amey",
    role: "Jewelry Enthusiast",
  },
  {
    text: "Really nice product. Loved it much. Very nice product. High quality finish and elegant design.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Client1",
    name: "Sowmya",
    role: "Verified Customer",
  },
  {
    text: "The sculptural gold bands are not just jewelry; they're wearable art that catches everyone's eye. So unique!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    name: "Priya Lakshmi",
    role: "Fashion Blogger",
  },
  {
    text: "I was looking for minimalist statement pieces and found exactly that. The craftsmanship is flawless.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    name: "Dr. Ananya",
    role: "Verified Customer",
  },
  {
    text: "The delivery was quick, and the unboxing experience was incredibly premium. These are modern classics.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavitha",
    name: "Kavitha",
    role: "Verified Customer",
  },
  {
    text: "Absolutely stunning pieces! The ethereal opal ring has become my signature accessory.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
    name: "Meera",
    role: "Stylist",
  },
  {
    text: "I've never received so many compliments on my earrings before. The vintage ruby solitaire is amazing.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepa",
    name: "Deepa",
    role: "Verified Customer",
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


          <h2 className="text-3xl md:text-5xl font-serif tracking-tighter text-center">
            What our clients say
          </h2>

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
