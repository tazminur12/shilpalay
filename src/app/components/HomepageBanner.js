"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const HomepageBanner = () => {
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
        // Filter only active Homepage Banner banners and sort by sortOrder
        const homepageBanners = data
          .filter(banner => banner.status === 'Active' && banner.position === 'Homepage Banner')
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
    return (
      <section className="relative w-full h-[60vh] md:h-screen overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  // Display the first banner
  const banner = banners[0];

  return (
    <section className="relative w-full h-[60vh] md:h-screen overflow-hidden group">
      {banner.image ? (
        <Image 
          src={banner.image}
          alt={banner.title || 'Homepage Banner'}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-200"></div>
      )}
      <div className="absolute inset-0 bg-black/10"></div>
      {banner.title && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            {banner.title}
          </h2>
          {banner.link ? (
            <Link 
              href={banner.link}
              className="bg-white text-black px-10 py-3 text-sm uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors inline-block mt-4"
            >
              Shop Now
            </Link>
          ) : (
            null
          )}
        </div>
      )}
    </section>
  );
};

export default HomepageBanner;

