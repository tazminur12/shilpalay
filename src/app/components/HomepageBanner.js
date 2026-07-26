"use client";

import OptimizedImage from './ui/OptimizedImage';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const HomepageBanner = ({ banners: initialBanners = null }) => {
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
        const homepageBanners = data
          .filter((banner) => banner.status === 'Active' && banner.position === 'Homepage Banner')
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setBanners(homepageBanners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-100 animate-pulse" />;
  }

  if (banners.length === 0) {
    return null;
  }

  const banner = banners[0];

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-100 overflow-hidden">
      <div className="absolute inset-0">
        {banner.image ? (
          <OptimizedImage
            src={banner.image}
            alt={banner.title || 'Homepage Banner'}
            fill
            sizePreset="banner"
            className="object-cover object-center"
            quality={75}
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {banner.title && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-10">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 drop-shadow-md">
            {banner.title}
          </h2>
          {banner.link && (
            <Link
              href={banner.link}
              className="bg-white text-black px-10 py-3 text-sm uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors inline-block mt-4"
            >
              Shop Now
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default HomepageBanner;
