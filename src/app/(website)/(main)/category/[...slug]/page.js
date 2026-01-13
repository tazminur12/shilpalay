"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import ProductCard from '@/app/components/ProductCard';
import PageLayout from '@/app/components/PageLayout';
import { ChevronDown, X, Filter } from 'lucide-react';

const DynamicCategoryPage = ({ params }) => {
  const { slug } = use(params);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [childCategory, setChildCategory] = useState(null);
  const [pageContent, setPageContent] = useState(null);
  const [error, setError] = useState(null);
  
  // Filter states (only for product listing)
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState('newest');
  const [activeFilters, setActiveFilters] = useState([]);

  // Check if it's only main category (no subcategory/child category)
  const isMainCategoryOnly = slug && slug.length === 1;

  useEffect(() => {
    if (slug && slug.length > 0) {
      if (isMainCategoryOnly) {
        fetchCategoryAndPageContent();
      } else {
        fetchCategoryAndProducts();
      }
    }
  }, [slug]);

  useEffect(() => {
    if (!isMainCategoryOnly) {
      applyFilters();
    }
  }, [products, selectedFabric, selectedColor, priceRange, sortBy, isMainCategoryOnly]);

  // Fetch category and page content for main category only
  const fetchCategoryAndPageContent = async () => {
    setLoading(true);
    try {
      // Fetch category by slug
      const categoryRes = await fetch(`/api/categories`);
      if (!categoryRes.ok) throw new Error('Failed to fetch categories');
      const categories = await categoryRes.json();
      const foundCategory = categories.find(cat => cat.slug === slug[0]);
      
      if (!foundCategory) {
        throw new Error('Category not found');
      }
      
      setCategory(foundCategory);
      
      // Fetch page content for this category
      const contentRes = await fetch(`/api/page-content/by-slug?slug=${slug[0]}&pageType=category`);
      if (contentRes.ok) {
        const content = await contentRes.json();
        setPageContent(content);
      } else {
        // Use default page content if not found
        setPageContent({
          hero: { enabled: false },
          categoryGrid: { enabled: true, title: 'SHOP BY CATEGORY' },
          featuredCollections: { enabled: false },
          recommended: { enabled: true },
          trending: { enabled: true },
          promoBanner: { enabled: false },
          twoColumnBanners: { enabled: false },
          newsletter: { enabled: true }
        });
      }
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch page data", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch category and products for subcategory/child category
  const fetchCategoryAndProducts = async () => {
    setLoading(true);
    try {
      // Fetch category by slug
      const categoryRes = await fetch(`/api/categories`);
      if (!categoryRes.ok) throw new Error('Failed to fetch categories');
      const categories = await categoryRes.json();
      const foundCategory = categories.find(cat => cat.slug === slug[0]);
      
      if (!foundCategory) {
        throw new Error('Category not found');
      }
      
      setCategory(foundCategory);
      
      let categoryId = foundCategory._id;
      let subCategoryId = null;
      let childCategoryId = null;
      
      // If sub-category slug exists
      if (slug.length > 1) {
        const subCategoryRes = await fetch(`/api/sub-categories?category=${foundCategory._id}`);
        if (subCategoryRes.ok) {
          const subCategories = await subCategoryRes.json();
          const foundSubCategory = subCategories.find(sub => sub.slug === slug[1]);
          if (foundSubCategory) {
            setSubCategory(foundSubCategory);
            subCategoryId = foundSubCategory._id;
            
            // If child-category slug exists
            if (slug.length > 2) {
              const childCategoryRes = await fetch(`/api/child-categories?subCategory=${foundSubCategory._id}`);
              if (childCategoryRes.ok) {
                const childCategories = await childCategoryRes.json();
                const foundChildCategory = childCategories.find(child => child.slug === slug[2]);
                if (foundChildCategory) {
                  setChildCategory(foundChildCategory);
                  childCategoryId = foundChildCategory._id;
                }
              }
            }
          }
        }
      }
      
      // Fetch products based on category level
      let url = '/api/admin/products';
      const params = new URLSearchParams();
      
      if (childCategoryId) {
        params.append('childCategory', childCategoryId);
      } else if (subCategoryId) {
        params.append('subCategory', subCategoryId);
      } else {
        params.append('category', categoryId);
      }
      params.append('status', 'published');
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const productsRes = await fetch(url);
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch page data", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
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

    // Sort products
    filtered.sort((a, b) => {
      const priceA = a.price?.salePrice || a.price?.regularPrice || 0;
      const priceB = b.price?.salePrice || b.price?.regularPrice || 0;
      
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    
    // Update active filters
    const filters = [];
    if (selectedFabric) filters.push({ type: 'Fabric', value: selectedFabric });
    if (selectedColor) filters.push({ type: 'Colour', value: selectedColor });
    setActiveFilters(filters);
  };

  // Get unique fabrics and colors from products
  const uniqueFabrics = [...new Set(
    products
      .map(p => p.description?.fabric)
      .filter(Boolean)
  )].sort();

  const uniqueColors = [...new Set(
    products
      .flatMap(p => p.variations?.map(v => v.color) || [])
      .filter(Boolean)
  )].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="text-center text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="text-center text-gray-500">Category not found.</div>
        </div>
      </div>
    );
  }

  // If main category only, show PageLayout
  if (isMainCategoryOnly && pageContent) {
    return (
      <PageLayout 
        pageContent={pageContent}
        categoryId={category._id?.toString() || category._id}
        categorySlug={category.slug}
      />
    );
  }

  // If subcategory or child category, show product listing page
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            {category && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/${category.slug}`} className="hover:text-gray-900 transition-colors">
                  {category.name}
                </Link>
              </>
            )}
            {subCategory && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/category/${category.slug}/${subCategory.slug}`} className="hover:text-gray-900 transition-colors">
                  {subCategory.name}
                </Link>
              </>
            )}
            {childCategory && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{childCategory.name}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Filters:</span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              
              {activeFilters.map((filter, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (filter.type === 'Fabric') setSelectedFabric('');
                    if (filter.type === 'Colour') setSelectedColor('');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition-colors"
                >
                  {filter.type}: {filter.value}
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredProducts.length} RESULTS
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-8 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-black bg-white"
                >
                  <option value="newest">Sort By: Newest</option>
                  <option value="oldest">Sort By: Oldest</option>
                  <option value="price-low">Sort By: Price (Low to High)</option>
                  <option value="price-high">Sort By: Price (High to Low)</option>
                  <option value="name-asc">Sort By: Name (A-Z)</option>
                  <option value="name-desc">Sort By: Name (Z-A)</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Colour</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
                >
                  <option value="">All Colours</option>
                  {uniqueColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Fabric</label>
                <select
                  value={selectedFabric}
                  onChange={(e) => setSelectedFabric(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
                >
                  <option value="">All Fabrics</option>
                  {uniqueFabrics.map(fabric => (
                    <option key={fabric} value={fabric}>{fabric}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Price</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min || ''}
                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max === 100000 ? '' : priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 100000 })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No products found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicCategoryPage;
