"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryBanner = ({ categoryId }) => {
  const [categoryBanners, setCategoryBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchBanners = async () => {
      if (!categoryId) {
        setTimeout(() => {
          if (isMounted) {
            setCategoryBanners([]);
            setLoading(false);
          }
        }, 0);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(`/api/banners?category=${categoryId}`);
        const data = await res.json();
        
        if (!isMounted) return;
        
        if (Array.isArray(data)) {
          const activeBanners = data.filter(banner => {
            const isActive = banner.status === 'Active';
            const hasImage = banner.image && banner.image.trim() !== '';
            return isActive && hasImage;
          });
          setCategoryBanners(activeBanners);
        } else {
          setCategoryBanners([]);
        }
      } catch {
        if (isMounted) {
          setCategoryBanners([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBanners();

    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  // Auto-rotate banners if multiple exist
  useEffect(() => {
    if (categoryBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev === categoryBanners.length - 1 ? 0 : prev + 1));
      }, 5000); // Change banner every 5 seconds

      return () => clearInterval(interval);
    }
  }, [categoryBanners.length]);

  if (loading) {
    return (
      <section className="relative w-full h-[70vh] md:h-[80vh] lg:h-[85vh] bg-gray-100 overflow-hidden flex items-center justify-center">
        <div className="text-gray-400">Loading banners...</div>
      </section>
    );
  }

  if (!categoryId || categoryBanners.length === 0) {
    return null;
  }

  const currentBanner = categoryBanners[currentBannerIndex];
  
  if (!currentBanner || !currentBanner.image) {
    return null;
  }

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] lg:h-[85vh] bg-gray-100 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={currentBanner.image}
          alt={currentBanner.title || 'Category Banner'}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      {currentBanner.link ? (
        <Link href={currentBanner.link} className="absolute inset-0 z-20">
          <span className="sr-only">View {currentBanner.title || 'Banner'}</span>
        </Link>
      ) : null}

      {categoryBanners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentBannerIndex((prev) => (prev === 0 ? categoryBanners.length - 1 : prev - 1));
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-30"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentBannerIndex((prev) => (prev === categoryBanners.length - 1 ? 0 : prev + 1));
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-30"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {categoryBanners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentBannerIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentBannerIndex ? 'bg-white w-8' : 'bg-white/50'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default CategoryBanner;
