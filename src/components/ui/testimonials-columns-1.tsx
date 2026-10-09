"use client";
import React from "react";
import { motion } from "motion/react";

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: { text: string; image?: string; name: string; role: string }[];
  duration?: number;
}) => {
  const list = props.testimonials;
  const loopArray = [0, 1];
  const colors = ["#D4AF37", "#B8860B", "#C5A028", "#E8C547", "#A08020"];

  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent"
      >
        {loopArray.map((_, index) => (
          <React.Fragment key={index}>
            {list.map(({ text, name, role }, i) => {
              const initials = name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const bg = colors[i % colors.length];
              return (
                <div
                  key={i}
                  className="p-8 rounded-3xl border border-obsidian/10 shadow-lg shadow-obsidian/5 bg-card max-w-xs w-full"
                >
                  <div className="text-sm font-sans font-light leading-relaxed text-obsidian/80">
                    &ldquo;{text}&rdquo;
                  </div>
                  <div className="flex items-center gap-3 mt-6">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-[#0A0A0A] font-bold text-sm shrink-0 border border-obsidian/10"
                      style={{ background: bg }}
                    >
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <div className="font-sans font-medium text-obsidian tracking-tight leading-5">
                        {name}
                      </div>
                      <div className="font-sans font-normal text-xs leading-5 text-obsidian/60 tracking-tight uppercase">
                        {role}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
