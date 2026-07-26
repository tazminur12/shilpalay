"use client";

import { useState, useEffect } from 'react';
import ResponsiveBannerSlider from './ResponsiveBannerSlider';

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
      const res = await fetch('/api/banners', { cache: 'no-store' });
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

  return (
    <ResponsiveBannerSlider
      banners={banners}
      loading={loading}
      imageFit="contain"
      sizePreset="banner"
      backgroundClassName="bg-white"
      overlayClassName=""
      titleClassName="text-2xl sm:text-4xl lg:text-5xl"
      ariaLabel="Homepage promotional banners"
    />
  );
};

export default HomepageBanner;
