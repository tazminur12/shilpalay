"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const OfferBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners');
      if (res.ok) {
        const data = await res.json();
        // Filter only active Offer Banner banners and sort by sortOrder
        const offerBanners = data
          .filter(banner => banner.status === 'Active' && banner.position === 'Offer Banner')
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setBanners(offerBanners);
      }
    } catch (error) {
      console.error('Error fetching offer banners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  // Display the first banner
  const banner = banners[0];

  return (
    <div className="relative w-full h-[40vh] md:h-[50vh] bg-gray-100 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {banner.image ? (
          <Image 
            src={banner.image}
            alt={banner.title || 'Offer Banner'}
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-200"></div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      {banner.title && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-10">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 drop-shadow-md">
            {banner.title}
          </h2>
          {banner.link && (
            <Link 
              href={banner.link}
              className="bg-white text-black px-8 py-2 md:px-10 md:py-3 text-xs md:text-sm uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors inline-block mt-4"
            >
              Shop Now
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default OfferBanner;
