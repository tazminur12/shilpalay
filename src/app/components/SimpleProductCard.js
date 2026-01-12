"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { addToCart } from '@/lib/cart';
import Swal from 'sweetalert2';

const SimpleProductCard = ({ product }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const stock = product.inventory?.totalStock || 0;
    const availability = product.inventory?.availability || 'in_stock';
    
    if (availability === 'out_of_stock' || stock === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Product Not Available',
        text: 'This product is currently out of stock',
        confirmButtonText: 'OK'
      });
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
    } else if (result.error === 'insufficient_stock') {
      Swal.fire({
        icon: 'warning',
        title: 'Insufficient Stock',
        text: result.message || 'Not enough stock available',
        confirmButtonText: 'OK'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message || 'Failed to add product to cart',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <Link 
      href={`/product/${product.slug || product._id}`}
      className="group block relative"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
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
        
        {/* Plus Icon */}
        <button
          className="absolute bottom-2 left-2 w-6 h-6 bg-gray-500/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors z-10 shadow-sm"
          aria-label="Add to cart"
          onClick={handleAddToCart}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </Link>
  );
};

export default SimpleProductCard;
