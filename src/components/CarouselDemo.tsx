import React from 'react';
import { HeroSection } from '@/components/ui/feature-carousel';

const CarouselDemo: React.FC = () => {
  const images = [
    {
      src: 'https://images.unsplash.com/photo-1504051771394-dd2e66b2e08f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjJ8fGdpcmx8ZW58MHx8MHx8fDA%3D',
      alt: 'Professional portrait of a woman',
    },
    {
      src: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fGdpcmx8ZW58MHx8MHx8fDA%3D',
      alt: 'Scenic landscape with mountains and a lake',
    },
    {
      src: 'https://plus.unsplash.com/premium_photo-1670282392820-e3590c1c5c54?w=900&auto=format&fit=crop&q=60',
      alt: 'Artistic photo of a girl with flowers',
    },
    {
      src: 'https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fGdpcmx8ZW58MHx8MHx8fDA%3D',
      alt: 'A dog wearing sunglasses',
    },
    {
      src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fGdpcmx8ZW58MHx8MHx8fDA%3D',
      alt: 'Creative shot of a person from behind',
    },
  ];

  const title = (
    <>
      Edit Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Photos </span> on the Go
    </>
  );

  return (
    <div className="w-full">
      <HeroSection
        title={title}
        subtitle="Use all our AI-powered photo editing tools on your phone, available for all iOS and Android."
        images={images}
      />
    </div>
  );
};

export default CarouselDemo;
