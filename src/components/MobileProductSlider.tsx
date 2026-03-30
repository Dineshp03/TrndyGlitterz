"use client";

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

import ProductCard from './ProductCard';
import { Product } from '@/data/products';

interface MobileProductSliderProps {
  products: Product[];
}

export default function MobileProductSlider({ products }: MobileProductSliderProps) {
  return (
    <div className="md:hidden w-full pb-6 pt-4 overflow-hidden">
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        coverflowEffect={{
          rotate: 30,
          stretch: 0,
          depth: 150,
          modifier: 1,
          slideShadows: false,
        }}
        pagination={{ clickable: true }}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="w-full"
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        loop={true}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="w-[260px] sm:w-[300px]">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: #0b0c10;
        }
        .swiper-pagination-bullet-active {
          background-color: #0b0c10;
        }
      `}</style>
    </div>
  );
}
