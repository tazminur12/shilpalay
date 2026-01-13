"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, X, Slider, ChevronDown, Grid, List } from 'lucide-react';
import { ProductListSkeleton } from '@/app/components/ui/Skeleton';
import Loading from '@/app/components/ui/Loading';
import ProductCard from '@/app/components/ProductCard';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'relevance');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery || selectedCategory !== 'all') {
      performSearch();
    }
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy, inStockOnly, searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?status=Active');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const performSearch = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sortBy', sortBy);
      if (inStockOnly) params.append('inStock', 'true');
      params.append('page', page.toString());
      params.append('limit', '24');

      const res = await fetch(`/api/products/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setPagination(data.pagination);
        
        // Update URL without reload
        const newParams = new URLSearchParams(params);
        newParams.delete('page');
        router.replace(`/search?${newParams.toString()}`, { scroll: false });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(1);
  };

  const handleFilterChange = () => {
    performSearch(1);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('relevance');
    setInStockOnly(false);
    setTimeout(() => performSearch(1), 100);
  };

  const hasActiveFilters = selectedCategory !== 'all' || minPrice || maxPrice || inStockOnly;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-4">
            {searchQuery ? `Search: "${searchQuery}"` : 'Search Products'}
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, categories..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filters Toggle & Sort */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  handleFilterChange();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </select>

              <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-600'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-600'}`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="w-64 shrink-0 hidden lg:block">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
                <h2 className="font-bold text-lg mb-4">Filters</h2>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (Tk)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      onBlur={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      onBlur={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* In Stock Only */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => {
                        setInStockOnly(e.target.checked);
                        handleFilterChange();
                      }}
                      className="w-4 h-4 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Filters Modal */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)}>
              <div className="bg-white w-80 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-lg">Filters</h2>
                    <button onClick={() => setShowFilters(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Same filter content as sidebar */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        handleFilterChange();
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (Tk)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        onBlur={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        onBlur={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => {
                          setInStockOnly(e.target.checked);
                          handleFilterChange();
                        }}
                        className="w-4 h-4 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">In Stock Only</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <ProductListSkeleton count={12} />
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `No products match "${searchQuery}". Try different keywords.`
                    : 'Start searching to find products'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-black underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6 text-sm text-gray-600">
                  Showing {products.length} of {pagination?.total || 0} products
                </div>

                {/* Products Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product._id} className="flex gap-4 border border-gray-200 rounded-lg p-4 hover:border-black transition-colors">
                        <Link href={`/product/${product.slug}`} className="shrink-0">
                          <div className="relative w-24 h-32 bg-gray-100 rounded overflow-hidden">
                            {product.images?.thumbnail ? (
                              <Image
                                src={product.images.thumbnail}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="flex-1">
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-black transition-colors mb-2">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                          <div className="flex items-center gap-4 mb-2">
                            {product.price.salePrice ? (
                              <>
                                <span className="text-lg font-bold text-red-600">
                                  Tk {product.price.salePrice.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  Tk {product.price.regularPrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold">
                                Tk {product.price.regularPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {product.inventory?.availability === 'in_stock' 
                              ? `In Stock (${product.inventory?.totalStock || 0} available)`
                              : 'Out of Stock'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => performSearch(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => performSearch(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading text="Loading search..." />}>
      <SearchPageContent />
    </Suspense>
  );
}
