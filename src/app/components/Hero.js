"use client";

import { useEffect, useState } from 'react';
import ResponsiveBannerSlider from './ResponsiveBannerSlider';

const Hero = ({ banners: initialBanners = null }) => {
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

  return (
    <ResponsiveBannerSlider
      banners={banners}
      loading={loading}
      // Looklify-style: show the full banner creative without cropping
      imageFit="contain"
      sizePreset="hero"
      backgroundClassName="bg-white"
      overlayClassName=""
      ariaLabel="Homepage hero banners"
    />
  );
};

export default Hero;
