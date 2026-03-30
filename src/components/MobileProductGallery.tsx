"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { Product } from '@/data/products';
import { motion } from 'framer-motion';

export default function MobileProductGallery({ product }: { product: Product }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Use the images array if available, otherwise just use the single image
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full h-[55vh] md:h-[80vh] min-h-[450px] bg-alabaster overflow-hidden group flex items-center">
      <div className="overflow-visible w-full h-full" ref={emblaRef}>
        <div className="flex w-full h-full touch-pan-y">
          {images.map((src, index) => (
            <div 
              className="relative flex-[0_0_100%] min-w-0 h-full flex items-center justify-center px-6 sm:px-12 perspective-[1500px]" 
              key={index}
            >
              <motion.div
                 initial={{ opacity: 0, rotateY: 25, rotateX: 10, scale: 0.85 }}
                 animate={{ 
                    opacity: selectedIndex === index ? 1 : 0.3, 
                    rotateY: selectedIndex === index ? 0 : (index > selectedIndex ? 25 : -25),
                    rotateX: selectedIndex === index ? 0 : 5,
                    scale: selectedIndex === index ? 1 : 0.85,
                    z: selectedIndex === index ? 0 : -200
                 }}
                 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                 className="relative w-[70vw] max-w-[320px] aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] bg-sand/30 transform-gpu animate-glow-pink"
              >
                 {/* Internal Gloss/Light effect */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none z-10" />
                 <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-10 overflow-hidden rounded-[2.5rem]" />
                 
                 <Image
                    src={src}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    priority={index === 0}
                    quality={95}
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                 />

                 {/* Inner border for depth */}
                 <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/30 pointer-events-none z-20" />
              </motion.div>
            </div>
          ))}
        </div>
      </div>

       {images.length > 1 && (
        <>
            {/* Navigation Arrows */}
            <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-alabaster/80 backdrop-blur-md flex items-center justify-center text-obsidian shadow-lg opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
            onClick={scrollPrev}
            >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-alabaster/80 backdrop-blur-md flex items-center justify-center text-obsidian shadow-lg opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
            onClick={scrollNext}
            >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
            {images.map((_, index) => (
                <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === selectedIndex ? 'bg-dustyrose w-6' : 'bg-obsidian/40'
                }`}
                onClick={() => emblaApi?.scrollTo(index)}
                />
            ))}
            </div>
        </>
      )}
    </div>
  );
}
