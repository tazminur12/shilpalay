"use client";

import { useState, useEffect } from 'react';
import SimpleProductCard from './SimpleProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const WhatsNewProducts = ({ categoryId = null, products: initialProducts = null }) => {
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const productsPerPage = 4;

  useEffect(() => {
    if (initialProducts && !categoryId) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }
    fetchProducts();
  }, [categoryId, initialProducts]);

  const fetchProducts = async () => {
    try {
      let url = '/api/admin/products?status=published&whatsNew=true';
      if (categoryId) {
        url += `&category=${categoryId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching what's new products:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (products.length <= productsPerPage) return;
    setCurrentIndex((prev) =>
      prev + productsPerPage >= products.length ? 0 : prev + productsPerPage
    );
  };

  const prevSlide = () => {
    if (products.length <= productsPerPage) return;
    setCurrentIndex((prev) =>
      prev - productsPerPage < 0
        ? Math.floor((products.length - 1) / productsPerPage) * productsPerPage
        : prev - productsPerPage
    );
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const displayedProducts = products.slice(currentIndex, currentIndex + productsPerPage);
  const hasMore = products.length > productsPerPage;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-10 uppercase tracking-wide">
          WHAT&apos;S NEW
        </h2>
        <div className="relative px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayedProducts.map((product) => (
              <SimpleProductCard key={product._id} product={product} />
            ))}
          </div>
          {hasMore && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-1 hover:text-black text-gray-400 transition-colors"
                aria-label="Previous products"
              >
                <ChevronLeft className="w-8 h-8 stroke-[1.5]" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:text-black text-gray-400 transition-colors"
                aria-label="Next products"
              >
                <ChevronRight className="w-8 h-8 stroke-[1.5]" />
              </button>
            </>
          )}
        </div>
        <div className="flex justify-center mt-10">
          <Link
            href="/whats-new"
            className="bg-black text-white px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition-colors"
          >
            View More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhatsNewProducts;
