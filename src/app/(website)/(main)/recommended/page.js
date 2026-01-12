"use client";

import { useState, useEffect } from 'react';
import ProductCard from '@/app/components/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function RecommendedPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const productsPerPage = 12;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products?status=published&recommended=true');
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching recommended products:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => {
    if (products.length <= productsPerPage) return;
    setCurrentIndex((prev) => 
      prev + productsPerPage >= products.length ? 0 : prev + productsPerPage
    );
  };

  const prevPage = () => {
    if (products.length <= productsPerPage) return;
    setCurrentIndex((prev) => 
      prev - productsPerPage < 0 ? Math.floor((products.length - 1) / productsPerPage) * productsPerPage : prev - productsPerPage
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="text-center text-gray-400">Loading recommended products...</div>
        </div>
      </div>
    );
  }

  const displayedProducts = products.slice(currentIndex, currentIndex + productsPerPage);
  const hasMore = products.length > productsPerPage;
  const totalPages = Math.ceil(products.length / productsPerPage);
  const currentPage = Math.floor(currentIndex / productsPerPage) + 1;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center uppercase tracking-wide mb-2">
            RECOMMENDED FOR YOU
          </h1>
          <p className="text-center text-gray-600 text-sm">
            Handpicked products just for you
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No recommended products found</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                {hasMore && (
                  <>
                    <button
                      onClick={prevPage}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 hover:text-black text-gray-400 transition-colors bg-white rounded-full shadow-md"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
                    </button>
                    <button
                      onClick={nextPage}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 hover:text-black text-gray-400 transition-colors bg-white rounded-full shadow-md"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-6 h-6 stroke-[1.5]" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Pagination Info */}
              {hasMore && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
