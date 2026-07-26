"use client";

import OptimizedImage from './ui/OptimizedImage';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { addToCart } from '@/lib/cart';
import Swal from 'sweetalert2';

const SimpleProductCard = ({ product, priority = false }) => {
  const displayPrice = product.price?.salePrice || product.price?.regularPrice || 0;

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
        confirmButtonText: 'OK',
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
        position: 'top-end',
      });
    } else if (result.error === 'insufficient_stock') {
      Swal.fire({
        icon: 'warning',
        title: 'Insufficient Stock',
        text: result.message || 'Not enough stock available',
        confirmButtonText: 'OK',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message || 'Failed to add product to cart',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <Link href={`/product/${product.slug || product._id}`} className="group block relative">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {product.images?.thumbnail ? (
          <OptimizedImage
            src={product.images.thumbnail}
            alt={product.name}
            fill
            sizePreset="card"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            quality={70}
            priority={priority}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}

        <button
          className="absolute bottom-3 left-3 w-10 h-10 bg-black/75 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors z-10 shadow-sm"
          aria-label="Add to cart"
          onClick={handleAddToCart}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="pt-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:underline underline-offset-4">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-600 tabular-nums">
          Tk {Number(displayPrice).toLocaleString('en-BD')}
        </p>
      </div>
    </Link>
  );
};

export default SimpleProductCard;
