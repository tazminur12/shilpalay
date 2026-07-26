"use client";

import OptimizedImage from './ui/OptimizedImage';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const FeaturedBanners = ({ banners: initialBanners = null }) => {
  const [banners, setBanners] = useState(initialBanners || []);
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
        const featuredBanners = data
          .filter((banner) => banner.status === 'Active' && banner.position === 'Featured Banner')
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .slice(0, 2);
        setBanners(featuredBanners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="w-screen relative left-1/2 -translate-x-1/2 flex flex-col md:flex-row">
        <div className="relative aspect-square md:h-[70vh] bg-gray-100 animate-pulse w-full md:flex-1 md:mr-2" />
        <div className="relative aspect-square md:h-[70vh] bg-gray-100 animate-pulse w-full md:flex-1" />
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="w-screen relative left-1/2 -translate-x-1/2 flex flex-col md:flex-row">
      {banners.map((banner, index) => (
        <div
          key={banner._id || index}
          className={`relative aspect-square md:h-[70vh] md:flex-1 group overflow-hidden w-full bg-gray-100 ${index === 0 ? 'md:mr-2' : ''}`}
        >
          {banner.image ? (
            <OptimizedImage
              src={banner.image}
              alt={banner.title || `Featured Banner ${index + 1}`}
              fill
              sizePreset="half"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              quality={75}
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          <div className="absolute inset-0 bg-black/20" />
          {banner.title && (
            <div className="absolute bottom-12 left-0 right-0 text-center text-white px-4">
              <h3 className="text-3xl font-serif mb-2">{banner.title}</h3>
              {banner.link ? (
                <Link
                  href={banner.link}
                  className="bg-black text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors inline-block mt-6"
                >
                  Shop Now
                </Link>
              ) : null}
            </div>
          )}
        </div>
      ))}
    </section>
  );
};

export default FeaturedBanners;
