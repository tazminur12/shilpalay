"use client";

import { useState, useEffect, use } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Share2, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ProductDetailPage({ params: routeParams }) {
  const params = use(routeParams);
  const slug = params.slug;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/by-slug?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        // Set default variation if available
        if (data.variations && data.variations.length > 0) {
          setSelectedVariation(data.variations[0]);
        }
      } else {
        Swal.fire('Error', 'Product not found', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to load product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart
    Swal.fire('Success', 'Product added to cart', 'success');
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist API
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description?.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      Swal.fire('Copied!', 'Link copied to clipboard', 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Product not found</p>
          <Link href="/" className="text-black underline mt-4 inline-block">Go to Home</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.gallery && product.images.gallery.length > 0
    ? [product.images.thumbnail, ...product.images.gallery]
    : [product.images?.thumbnail].filter(Boolean);

  const displayPrice = product.price?.salePrice && product.price.salePrice < product.price.regularPrice
    ? product.price.salePrice
    : product.price?.regularPrice || 0;

  const originalPrice = product.price?.salePrice && product.price.salePrice < product.price.regularPrice
    ? product.price.regularPrice
    : null;

  const discount = originalPrice ? ((originalPrice - displayPrice) / originalPrice * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            {product.category && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/category/${product.category.slug}`} className="hover:text-gray-900">
                  {product.category.name}
                </Link>
              </>
            )}
            {product.subCategory && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/category/${product.category.slug}/${product.subCategory.slug}`} className="hover:text-gray-900">
                  {product.subCategory.name}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
              {images[selectedImageIndex] ? (
                <Image
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              
              {/* Wishlist Button */}
              <button
                onClick={handleWishlist}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full transition-colors z-10"
                aria-label="Add to wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>

              {/* Sale Badge */}
              {originalPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1 rounded font-medium">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ৳{displayPrice.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ৳{originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {originalPrice && (
                <p className="text-sm text-green-600 mt-1">You save ৳{(originalPrice - displayPrice).toFixed(2)}</p>
              )}
            </div>

            {/* SKU */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                SKU: <span className="font-medium">{product.sku}</span>
              </p>
            </div>

            {/* Short Description */}
            {product.description?.shortDescription && (
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {product.description.shortDescription}
                </p>
              </div>
            )}

            {/* Variations */}
            {product.variations && product.variations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Available Variations</h3>
                <div className="space-y-3">
                  {product.variations.map((variation, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedVariation(variation)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedVariation === variation ? 'border-black' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {variation.colorCode && (
                            <div
                              className="w-8 h-8 rounded-full border border-gray-300"
                              style={{ backgroundColor: variation.colorCode }}
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {variation.color && `Color: ${variation.color}`}
                              {variation.size && ` | Size: ${variation.size}`}
                            </p>
                            {variation.material && (
                              <p className="text-xs text-gray-500">Material: {variation.material}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Stock: {variation.stock || 0}</p>
                          {variation.priceOverride && (
                            <p className="text-xs text-gray-500">৳{variation.priceOverride.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.inventory?.availability === 'out_of_stock'}
                className="w-full bg-black text-white px-6 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                {product.inventory?.availability === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={handleWishlist}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                <span className="text-sm">Wishlist</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Share</span>
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              {product.description?.fabric && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Fabric</h4>
                  <p className="text-sm text-gray-600">{product.description.fabric}</p>
                </div>
              )}
              {product.description?.workType && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Work Type</h4>
                  <p className="text-sm text-gray-600">{product.description.workType}</p>
                </div>
              )}
              {product.description?.fit && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Fit</h4>
                  <p className="text-sm text-gray-600">{product.description.fit}</p>
                </div>
              )}
              {product.description?.washCare && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Wash Care</h4>
                  <p className="text-sm text-gray-600">{product.description.washCare}</p>
                </div>
              )}
              {product.description?.origin && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Origin</h4>
                  <p className="text-sm text-gray-600">{product.description.origin}</p>
                </div>
              )}
            </div>

            {/* Full Description */}
            {product.description?.fullDescription && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description.fullDescription}
                </div>
              </div>
            )}

            {/* Shipping Info */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                    <p className="text-xs text-gray-500">On orders over ৳5000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-500">7 days return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-500">100% secure checkout</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
