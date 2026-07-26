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
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setBanners(featuredBanners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mobile stays editorial/tall; desktop uses a wider ratio so dual banners sit shorter on laptops.
  const tileClass =
    'relative aspect-[4/5] md:aspect-[4/3] lg:aspect-[3/2] xl:aspect-[16/10] group overflow-hidden w-full bg-gray-100';

  if (loading) {
    return (
      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 px-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${tileClass} animate-pulse`} />
        ))}
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
      {banners.map((banner, index) => (
        <div key={banner._id || index} className={tileClass}>
          {banner.image ? (
            <OptimizedImage
              src={banner.image}
              alt={banner.title || `Featured Banner ${index + 1}`}
              fill
              sizePreset="half"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              quality={75}
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
          {banner.title && (
            <div className="absolute bottom-5 sm:bottom-7 md:bottom-8 left-0 right-0 text-center text-white px-4">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] font-serif mb-1.5 drop-shadow-md">
                {banner.title}
              </h3>
              {banner.link ? (
                <Link
                  href={banner.link}
                  className="inline-flex min-h-10 md:min-h-11 items-center bg-black text-white px-5 md:px-6 py-2 text-[11px] sm:text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors mt-3"
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
