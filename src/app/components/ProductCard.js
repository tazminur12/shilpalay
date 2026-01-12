"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/cart';
import { addToWishlist, isInWishlist } from '@/lib/wishlist';
import Swal from 'sweetalert2';

const ProductCard = ({ product }) => {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (product) {
      setIsWishlisted(isInWishlist(product._id));
    }
  }, [product]);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.inventory?.availability === 'out_of_stock') {
      Swal.fire('Out of Stock', 'This product is currently out of stock', 'warning');
      return;
    }

    const result = addToCart(product, 1, null);
    
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
    }
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
      <div className="relative aspect-[3/4] overflow-hidden mb-2 bg-gray-100">
        {product.images?.thumbnail ? (
          <Image
            src={product.images.thumbnail}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full transition-colors z-10 shadow-sm"
          aria-label="Add to wishlist"
        >
          <Heart 
            className={`w-3 h-3 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </button>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 p-1.5 bg-black/90 hover:bg-black text-white rounded-full transition-colors z-10 shadow-sm"
          aria-label="Add to cart"
        >
          <ShoppingBag className="w-3 h-3" />
        </button>

        {/* Sale Badge */}
        {product.price?.salePrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">
            SALE
          </div>
        )}
      </div>
      
      <div className="space-y-0.5">
        <h3 className="text-xs font-medium text-gray-800 group-hover:text-[#e5c100] transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-900">
            Tk {displayPrice.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-[10px] text-gray-500 line-through">
              Tk {originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
