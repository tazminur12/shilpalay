"use client";

import OptimizedImage from './ui/OptimizedImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { getOptimizedImageUrl } from '@/lib/cdn';

const Hero = ({ banners: initialBanners = null }) => {
  const [banners, setBanners] = useState(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!initialBanners);

  useEffect(() => {
    if (initialBanners) {
      setBanners(initialBanners);
      setLoading(false);
      return;
    }
    fetchBanners();
  }, [initialBanners]);

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners');
      if (res.ok) {
        const data = await res.json();
        const heroBanners = data
          .filter((banner) => banner.status === 'Active' && banner.position === 'Homepage Hero')
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

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  // Prefetch adjacent slides so carousel feels instant
  useEffect(() => {
    if (banners.length <= 1 || typeof window === 'undefined') return;
    const next = banners[(currentIndex + 1) % banners.length];
    if (next?.image) {
      const img = new window.Image();
      img.src = getOptimizedImageUrl(next.image, {
        width: 1920,
        quality: 'auto',
        format: 'auto',
      });
    }
  }, [banners, currentIndex]);

  if (loading) {
    return (
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-100 animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-100 overflow-hidden">
      <div className="absolute inset-0">
        {currentBanner.image ? (
          <OptimizedImage
            src={currentBanner.image}
            alt={currentBanner.title || 'Hero banner'}
            fill
            sizePreset="hero"
            className="object-cover object-center"
            priority
            quality={80}
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {currentBanner.title && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-10">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 drop-shadow-md">
            {currentBanner.title}
          </h2>
        </div>
      )}

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
