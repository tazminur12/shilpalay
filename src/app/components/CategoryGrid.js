"use client";

import OptimizedImage from './ui/OptimizedImage';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const CategoryGrid = ({ categories: initialCategories = null }) => {
  const [categories, setCategories] = useState(initialCategories || []);
  const [loading, setLoading] = useState(!initialCategories);

  useEffect(() => {
    if (initialCategories) {
      setCategories(initialCategories);
      setLoading(false);
      return;
    }
    fetchCategories();
  }, [initialCategories]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        const activeCategories = data
          .filter((cat) => cat.status === 'Active' && cat.sortOrder >= 1 && cat.sortOrder <= 8)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-6 md:py-12 bg-white">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-12 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-6 sm:gap-4">
          {categories.map((cat) => (
            <Link key={cat._id} href={`/${cat.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden mb-2.5 sm:mb-3 bg-gray-100">
                {cat.image ? (
                  <OptimizedImage
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizePreset="category"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    quality={70}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>
              <h3 className="text-center text-[11px] sm:text-xs md:text-sm font-medium uppercase tracking-wide text-gray-800 group-hover:text-black line-clamp-2">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
