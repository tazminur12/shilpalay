import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-100 overflow-hidden">
      {/* Background Image - Using a placeholder that matches the vibe */}
      <div className="absolute inset-0">
        <Image 
            src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop"
            alt="Cool monochrome collection"
            fill
            className="object-cover object-top"
            priority
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 drop-shadow-md">
          Cool monochrome
        </h2>
        <p className="text-sm md:text-base tracking-widest uppercase mb-8 drop-shadow-md">
          Kids winter 25 collection
        </p>
        <button className="bg-black text-white px-8 py-3 text-xs md:text-sm tracking-widest uppercase font-medium hover:bg-gray-900 transition-colors">
          Shop Now
        </button>
      </div>

      {/* Navigation Arrows */}
      <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors text-white">
        <ChevronLeft className="w-8 h-8 stroke-1" />
      </button>
      <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors text-white">
        <ChevronRight className="w-8 h-8 stroke-1" />
      </button>
    </div>
  );
};

export default Hero;
