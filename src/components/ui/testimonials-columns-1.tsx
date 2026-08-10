"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: { text: string; image: string; name: string; role: string }[];
  duration?: number;
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isIOS || isSmallScreen);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const list = isMobile ? props.testimonials.slice(0, 3) : props.testimonials;
  const loopArray = isMobile ? [0] : [0, 1];

  return (
    <div className={props.className}>
      <motion.div
        animate={!isMobile ? {
          translateY: "-50%",
        } : {}}
        transition={!isMobile ? {
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        } : undefined}
        className="flex flex-col gap-6 pb-6 bg-transparent"
      >
        {loopArray.map((_, index) => (
          <React.Fragment key={index}>
            {list.map(({ text, image, name, role }, i) => (
              <div className="p-10 rounded-3xl border border-obsidian/10 shadow-lg shadow-obsidian/5 bg-card max-w-xs w-full" key={i}>
                <div className="text-sm font-sans font-light leading-relaxed text-obsidian/80">&ldquo;{text}&rdquo;</div>
                <div className="flex items-center gap-3 mt-6">
                  <Image
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    className="h-10 w-10 rounded-full object-cover border border-obsidian/10"
                  />
                  <div className="flex flex-col">
                    <div className="font-sans font-medium text-obsidian tracking-tight leading-5">{name}</div>
                    <div className="font-sans font-normal text-xs leading-5 text-obsidian/60 tracking-tight uppercase">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
