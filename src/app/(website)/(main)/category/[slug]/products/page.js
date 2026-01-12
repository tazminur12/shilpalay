"use client";

import { useState, useEffect, use, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/app/components/ProductCard';
import { ChevronDown, X, Filter } from 'lucide-react';
import Link from 'next/link';

export default function CategoryProductsPage({ params: routeParams }) {
  const params = use(routeParams);
  const slug = params.slug;
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [childCategory, setChildCategory] = useState(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [activeFilters, setActiveFilters] = useState([]);

  const fetchCategoryAndProducts = useCallback(async () => {
    setLoading(true);
    try {
      // First try to find as main category
      const categoryRes = await fetch('/api/categories');
      if (categoryRes.ok) {
        const categories = await categoryRes.json();
        const foundCategory = categories.find(cat => cat.slug === slug);
        
        if (foundCategory) {
          setCategory(foundCategory);
          
          // Fetch products by main category
          const productsRes = await fetch(`/api/admin/products?category=${foundCategory._id}&status=published`);
          if (productsRes.ok) {
            const data = await productsRes.json();
            setProducts(Array.isArray(data) ? data : []);
          }
        } else {
          // If not found as main category, try as subcategory
          const subCategoryRes = await fetch('/api/sub-categories');
          if (subCategoryRes.ok) {
            const subCategories = await subCategoryRes.json();
            const foundSubCategory = subCategories.find(sub => sub.slug === slug);
            
            if (foundSubCategory) {
              setSubCategory(foundSubCategory);
              // Fetch parent category
              if (foundSubCategory.category) {
                const parentCategory = categories.find(cat => cat._id === foundSubCategory.category._id || cat._id === foundSubCategory.category);
                if (parentCategory) {
                  setCategory(parentCategory);
                }
              }
              
              // Fetch products by subcategory
              const productsRes = await fetch(`/api/admin/products?subCategory=${foundSubCategory._id}&status=published`);
              if (productsRes.ok) {
                const data = await productsRes.json();
                setProducts(Array.isArray(data) ? data : []);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Filter by fabric
    if (selectedFabric) {
      filtered = filtered.filter(p => 
        p.description?.fabric?.toLowerCase().includes(selectedFabric.toLowerCase())
      );
    }

    // Filter by color
    if (selectedColor) {
      filtered = filtered.filter(p => 
        p.variations?.some(v => 
          v.color?.toLowerCase().includes(selectedColor.toLowerCase())
        )
      );
    }

    // Filter by price range
    filtered = filtered.filter(p => {
      const price = p.price?.salePrice || p.price?.regularPrice || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    setFilteredProducts(filtered);
    
    // Update active filters
    const filters = [];
    if (selectedFabric) filters.push({ type: 'Fabric', value: selectedFabric, onRemove: () => setSelectedFabric('') });
    if (selectedColor) filters.push({ type: 'Colour', value: selectedColor, onRemove: () => setSelectedColor('') });
    setActiveFilters(filters);
  }, [products, selectedFabric, selectedColor, priceRange]);

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [fetchCategoryAndProducts]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Get unique values for filters
  const uniqueFabrics = [...new Set(
    products.map(p => p.description?.fabric).filter(Boolean)
  )].sort();

  const uniqueColors = [...new Set(
    products.flatMap(p => p.variations?.map(v => v.color) || []).filter(Boolean)
  )].sort();

  const maxPrice = Math.max(...products.map(p => p.price?.salePrice || p.price?.regularPrice || 0), 100000);
  const minPrice = Math.min(...products.map(p => p.price?.salePrice || p.price?.regularPrice || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="text-center text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            {category && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/category/${category.slug}`} className="hover:text-gray-900">{category.name}</Link>
                {subCategory && (
                  <>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">{subCategory.name}</span>
                  </>
                )}
                <span className="mx-2">/</span>
                <span className="text-gray-900">Products</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Filters:</span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                All Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Categories
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Colour
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Fabric
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Price
              </button>
            </div>
            {activeFilters.length > 0 && (
              <button
                onClick={() => {
                  setSelectedFabric('');
                  setSelectedColor('');
                  setPriceRange({ min: 0, max: 100000 });
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                View All
              </button>
            )}
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {activeFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={filter.onRemove}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200"
                >
                  {filter.type}: {filter.value}
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          {/* Selected Fabric Display (Large) */}
          {selectedFabric && (
            <div className="mt-4">
              <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide">
                {selectedFabric}
              </h2>
            </div>
          )}

          {/* Category/SubCategory Name Display (when no fabric filter) */}
          {!selectedFabric && (subCategory || category) && (
            <div className="mt-4">
              <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide">
                {subCategory ? subCategory.name : category?.name}
              </h2>
            </div>
          )}

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Fabric</label>
                <select
                  value={selectedFabric}
                  onChange={(e) => setSelectedFabric(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                >
                  <option value="">All Fabrics</option>
                  {uniqueFabrics.map(fabric => (
                    <option key={fabric} value={fabric}>{fabric}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Colour</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                >
                  <option value="">All Colours</option>
                  {uniqueColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Min Price (৳)</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Max Price (৳)</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || maxPrice })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="py-8">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
