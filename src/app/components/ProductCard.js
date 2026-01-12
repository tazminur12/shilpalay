"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useState } from 'react';

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // TODO: Add to wishlist API call
  };

  const displayPrice = product.price?.salePrice 
    ? product.price.salePrice 
    : product.price?.regularPrice || 0;

  const originalPrice = product.price?.salePrice 
    ? product.price.regularPrice 
    : null;

  return (
    <Link 
      href={`/product/${product.slug || product._id}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden mb-3 bg-gray-100">
        {product.images?.thumbnail ? (
          <Image
            src={product.images.thumbnail}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full transition-colors z-10"
          aria-label="Add to wishlist"
        >
          <Heart 
            className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </button>

        {/* Sale Badge */}
        {product.price?.salePrice && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
            SALE
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-800 group-hover:text-[#e5c100] transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            ৳{displayPrice.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              ৳{originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
