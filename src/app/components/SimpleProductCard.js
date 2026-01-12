"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const SimpleProductCard = ({ product }) => {
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
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        
        {/* Plus Icon */}
        <button
          className="absolute bottom-4 left-4 w-8 h-8 bg-gray-500/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors z-10"
          aria-label="Add to cart"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Add to cart functionality
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </Link>
  );
};

export default SimpleProductCard;
