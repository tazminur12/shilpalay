"use client";

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners');
      if (res.ok) {
        const data = await res.json();
        // Filter only active Homepage Hero banners and sort by sortOrder
        const heroBanners = data
          .filter(banner => banner.status === 'Active' && banner.position === 'Homepage Hero')
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setBanners(heroBanners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Auto slide (optional)
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  // If no banners, show placeholder or nothing
  if (loading) {
    return (
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Don't show hero if no banners
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-100 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {currentBanner.image ? (
          <Image 
            src={currentBanner.image}
            alt={currentBanner.title || 'Hero banner'}
            fill
            className="object-cover object-center"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200"></div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      {currentBanner.title && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-10">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 drop-shadow-md">
            {currentBanner.title}
          </h2>
        </div>
      )}

      {/* Navigation Arrows - only show if more than one banner */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors text-white z-20"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-8 h-8 stroke-1" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors text-white z-20"
            aria-label="Next banner"
          >
            <ChevronRight className="w-8 h-8 stroke-1" />
          </button>
        </>
      )}

      {/* Dots indicator - only show if more than one banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;
