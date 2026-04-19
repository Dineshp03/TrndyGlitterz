"use client";

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel, FreeMode, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import ProductCard from './ProductCard';
import { Product } from '@/data/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSliderProps {
  products: Product[];
  mobileSwipe?: boolean;
  autoPlay?: boolean;
}

export default function ProductSlider({ products, mobileSwipe = false, autoPlay = false }: ProductSliderProps) {
  return (
    <div className="relative group w-full px-0">
      {/* Mobile View: 2-Column Grid matching Image 3 (unless mobileSwipe is true) */}
      {!mobileSwipe && (
        <div className="block md:hidden">
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 px-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Desktop/Tablet View (or Mobile if mobileSwipe is true): Smooth Swiper Slider */}
      <div className={mobileSwipe ? "block" : "hidden md:block"}>
        <Swiper
          modules={[Navigation, Pagination, Mousewheel, FreeMode, Autoplay]}
          spaceBetween={16}
          slidesPerView={1.2}
          centeredSlides={false}
          grabCursor={true}
          freeMode={true}
          mousewheel={{
            forceToAxis: true,
          }}
          pagination={{ 
            clickable: true,
            dynamicBullets: true 
          }}
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          autoplay={autoPlay ? {
            delay: 3000,
            disableOnInteraction: false,
          } : false}
          breakpoints={{
            640: {
              slidesPerView: 2.2,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 3.2,
              spaceBetween: 32,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 32,
            },
          }}
          className="product-swiper !pb-8 !px-0.5"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="h-full">
                <ProductCard product={product} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Custom Navigation */}
      <div className="hidden md:flex items-center gap-3 absolute -top-16 right-0">
          <button className="swiper-button-prev-custom w-11 h-11 rounded-full flex items-center justify-center border border-obsidian/10 bg-white/50 backdrop-blur-sm hover:bg-obsidian hover:text-white transition-all disabled:opacity-20 shadow-sm active:scale-95">
            <ChevronLeft size={18} />
          </button>
          <button className="swiper-button-next-custom w-11 h-11 rounded-full flex items-center justify-center border border-obsidian/10 bg-white/50 backdrop-blur-sm hover:bg-obsidian hover:text-white transition-all disabled:opacity-20 shadow-sm active:scale-95">
            <ChevronRight size={18} />
          </button>
      </div>

      <style jsx global>{`
        .product-swiper .swiper-pagination-bullets {
          bottom: 0 !important;
        }
        .product-swiper .swiper-pagination-bullet {
          background: #2C2C2C;
          opacity: 0.15;
          width: 6px;
          height: 6px;
          margin: 0 4px !important;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .product-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          width: 32px;
          border-radius: 10px;
          background: #2C2C2C;
        }
      `}</style>
    </div>
  );
}
