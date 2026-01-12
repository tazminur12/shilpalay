"use client";

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { ChevronDown, X } from 'lucide-react';

const ProductListing = ({ categoryId, subCategoryId, childCategoryId, categoryName }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fabric: [],
    color: [],
    priceRange: { min: 0, max: 100000 },
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });

  useEffect(() => {
    fetchProducts();
  }, [categoryId, subCategoryId, childCategoryId]);

  useEffect(() => {
    applyFilters();
  }, [products, selectedFabric, selectedColor, priceRange]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/products';
      const params = new URLSearchParams();
      
      if (childCategoryId) {
        params.append('childCategory', childCategoryId);
      } else if (subCategoryId) {
        params.append('subCategory', subCategoryId);
      } else if (categoryId) {
        params.append('category', categoryId);
      }
      params.append('status', 'published');
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Filter by fabric (from description.fabric)
    if (selectedFabric) {
      filtered = filtered.filter(p => 
        p.description?.fabric?.toLowerCase().includes(selectedFabric.toLowerCase())
      );
    }

    // Filter by color (from variations)
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

  // Group products by fabric
  const productsByFabric = {};
  filteredProducts.forEach(product => {
    const fabric = product.description?.fabric || 'Other';
    if (!productsByFabric[fabric]) {
      productsByFabric[fabric] = [];
    }
    productsByFabric[fabric].push(product);
  });

  const fabricGroups = Object.keys(productsByFabric).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="text-center text-gray-400">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-4 border-b border-gray-200">
        <nav className="text-sm text-gray-600">
          <span className="hover:text-gray-900">Home</span>
          {categoryName && (
            <>
              <span className="mx-2">/</span>
              <span className="hover:text-gray-900">{categoryName}</span>
            </>
          )}
        </nav>
      </div>

      {/* Filters */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {selectedFabric && (
            <button
              onClick={() => setSelectedFabric('')}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200"
            >
              Fabric: {selectedFabric}
              <X className="w-3 h-3" />
            </button>
          )}

          {selectedColor && (
            <button
              onClick={() => setSelectedColor('')}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200"
            >
              Color: {selectedColor}
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

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
                onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 100000 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>
        )}
      </div>

      {/* Products by Fabric */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-8">
        {fabricGroups.length > 0 ? (
          fabricGroups.map((fabric) => (
            <section key={fabric} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold uppercase tracking-wide">{fabric}</h2>
                {productsByFabric[fabric].length > 4 && (
                  <button className="text-sm text-gray-600 hover:text-black underline">
                    View All
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {productsByFabric[fabric].slice(0, 4).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {productsByFabric[fabric].length > 4 && (
                <div className="flex justify-center gap-1 mt-4">
                  {[...Array(Math.ceil(productsByFabric[fabric].length / 4))].map((_, i) => (
                    <button
                      key={i}
                      className="w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400"
                    />
                  ))}
                </div>
              )}
            </section>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        )}

        {/* All Products (if no fabric grouping) */}
        {fabricGroups.length === 0 && filteredProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-wide mb-6">All Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductListing;
