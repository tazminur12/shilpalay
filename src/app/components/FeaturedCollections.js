"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const FeaturedCollections = () => {
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
        // Filter only active Featured Collection banners and sort by sortOrder
        // Take first 2 banners for the two-column grid
        const featuredCollections = data
          .filter(banner => banner.status === 'Active' && banner.position === 'Featured Collection')
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .slice(0, 2); // Take first 2 banners
        setBanners(featuredCollections);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <div className="relative aspect-square md:h-[70vh] bg-gray-100 flex items-center justify-center w-full">
            <div className="text-gray-400">Loading...</div>
          </div>
          <div className="relative aspect-square md:h-[70vh] bg-gray-100 flex items-center justify-center w-full">
            <div className="text-gray-400">Loading...</div>
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        {banners.map((banner, index) => (
          <div key={banner._id || index} className="relative aspect-square md:h-[70vh] group overflow-hidden w-full">
            {banner.image ? (
              <Image
                src={banner.image}
                alt={banner.title || `Featured Collection ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-200"></div>
            )}
            <div className="absolute inset-0 bg-black/10"></div>
            {banner.title && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
                <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-md">{banner.title}</h3>
                {banner.link ? (
                  <Link
                    href={banner.link}
                    className="bg-transparent border border-white text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors inline-block mt-6"
                  >
                    Shop Now
                  </Link>
                ) : (
                  null
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollections;
