"use client";

import { useState, useEffect, use } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Share2, Minus, Plus, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { addToCart } from '@/lib/cart';
import { addToWishlist, isInWishlist } from '@/lib/wishlist';

export default function ProductDetailPage({ params: routeParams }) {
  const params = use(routeParams);
  const slug = params.slug;
  const router = useRouter();
  
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

  useEffect(() => {
    if (product) {
      setIsWishlisted(isInWishlist(product._id));
    }
  }, [product]);

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
    if (!product) return;
    
    if (product.inventory?.availability === 'out_of_stock') {
      Swal.fire('Out of Stock', 'This product is currently out of stock', 'warning');
      return;
    }

    const result = addToCart(product, quantity, selectedVariation);
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Added to Cart',
        text: `${product.name} added to cart`,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } else {
      Swal.fire('Error', 'Failed to add product to cart', 'error');
    }
  };

  const handleWishlist = () => {
    if (!product) return;
    
    const result = addToWishlist(product);
    
    if (result.success) {
      setIsWishlisted(result.added);
      
      if (result.added) {
        Swal.fire({
          icon: 'success',
          title: 'Added to Wishlist',
          text: `${product.name} added to wishlist`,
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        }).then(() => {
          // Redirect to wishlist page
          router.push('/my-account/wishlist');
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Removed from Wishlist',
          text: `${product.name} removed from wishlist`,
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    } else {
      Swal.fire('Error', 'Failed to update wishlist', 'error');
    }
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
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <nav className="text-xs text-gray-600">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            {product.category && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/category/${product.category.slug}`} className="hover:text-black transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            {product.subCategory && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/category/${product.category.slug}/${product.subCategory.slug}`} className="hover:text-black transition-colors">
                  {product.subCategory.name}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-black">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Images */}
          <div className="flex flex-col items-center">
            {/* Main Image Container */}
            <div className="relative w-full max-w-md">
              {/* Main Image */}
              <div className="relative aspect-[3/4] bg-gray-100 rounded overflow-hidden mb-4">
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
                  className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-white rounded-full transition-colors z-10 shadow-sm"
                  aria-label="Add to wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>

                {/* Sale Badge */}
                {originalPrice && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                    {discount}% OFF
                  </div>
                )}

                {/* Left Arrow */}
                {images.length > 1 && (
                  <button
                    onClick={() => setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 bg-white hover:bg-gray-50 rounded-full shadow-md transition-colors z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-800" />
                  </button>
                )}

                {/* Right Arrow */}
                {images.length > 1 && (
                  <button
                    onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % images.length)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 bg-white hover:bg-gray-50 rounded-full shadow-md transition-colors z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-800" />
                  </button>
                )}
              </div>

              {/* Pagination Dots */}
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        selectedImageIndex === index ? 'bg-orange-500' : 'bg-gray-400'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">
                  Tk {displayPrice.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    Tk {originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {originalPrice && (
                <p className="text-xs text-green-600 mt-0.5">You save Tk {(originalPrice - displayPrice).toFixed(2)}</p>
              )}
            </div>

            {/* SKU */}
            <div className="mb-4">
              <p className="text-xs text-gray-600">
                SKU: <span className="font-medium">{product.sku}</span>
              </p>
            </div>

            {/* Short Description */}
            {product.description?.shortDescription && (
              <div className="mb-4">
                <p className="text-xs text-gray-700 leading-relaxed">
                  {product.description.shortDescription}
                </p>
              </div>
            )}

            {/* Variations */}
            {product.variations && product.variations.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Available Variations</h3>
                <div className="space-y-2">
                  {product.variations.map((variation, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedVariation(variation)}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedVariation === variation ? 'border-black' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {variation.colorCode && (
                            <div
                              className="w-6 h-6 rounded-full border border-gray-300 shrink-0"
                              style={{ backgroundColor: variation.colorCode }}
                            />
                          )}
                          <div>
                            <p className="font-medium text-xs">
                              {variation.color && `Color: ${variation.color}`}
                              {variation.size && ` | Size: ${variation.size}`}
                            </p>
                            {variation.material && (
                              <p className="text-[10px] text-gray-500">Material: {variation.material}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium">Stock: {variation.stock || 0}</p>
                          {variation.priceOverride && (
                            <p className="text-[10px] text-gray-500">Tk {variation.priceOverride.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center text-xs border border-gray-300 rounded px-2 py-1.5"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mb-4">
              <button
                onClick={handleAddToCart}
                disabled={product.inventory?.availability === 'out_of_stock'}
                className="w-full bg-black text-white px-4 py-2.5 text-xs uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                {product.inventory?.availability === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleWishlist}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                <span>Wishlist</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-gray-600" />
                <span>Share</span>
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              {product.description?.fabric && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-0.5 uppercase tracking-wide">Fabric</h4>
                  <p className="text-xs text-gray-600">{product.description.fabric}</p>
                </div>
              )}
              {product.description?.workType && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-0.5 uppercase tracking-wide">Work Type</h4>
                  <p className="text-xs text-gray-600">{product.description.workType}</p>
                </div>
              )}
              {product.description?.fit && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-0.5 uppercase tracking-wide">Fit</h4>
                  <p className="text-xs text-gray-600">{product.description.fit}</p>
                </div>
              )}
              {product.description?.washCare && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-0.5 uppercase tracking-wide">Wash Care</h4>
                  <p className="text-xs text-gray-600">{product.description.washCare}</p>
                </div>
              )}
              {product.description?.origin && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-0.5 uppercase tracking-wide">Origin</h4>
                  <p className="text-xs text-gray-600">{product.description.origin}</p>
                </div>
              )}
            </div>

            {/* Full Description */}
            {product.description?.fullDescription && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2 uppercase tracking-wide">Description</h3>
                <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description.fullDescription}
                </div>
              </div>
            )}

            {/* Shipping Info */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Free Shipping</p>
                    <p className="text-[10px] text-gray-500">On orders over Tk 5000</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-gray-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Easy Returns</p>
                    <p className="text-[10px] text-gray-500">7 days return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Secure Payment</p>
                    <p className="text-[10px] text-gray-500">100% secure checkout</p>
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
