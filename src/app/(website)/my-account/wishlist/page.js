"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, X, Trash2, Share2 } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Swal from 'sweetalert2';
import { getWishlist, removeFromWishlist as removeWishlistItem } from '@/lib/wishlist';
import { addToCart } from '@/lib/cart';

export default function WishlistPage() {
  const { data: session } = useSession();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, [session]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      // Use wishlist utility to get wishlist items
      const wishlist = getWishlist();
      setWishlistItems(wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      fetchWishlist();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      const result = removeWishlistItem(productId);
      
      if (result.success) {
        setWishlistItems(result.wishlist);
        Swal.fire({
          icon: 'success',
          title: 'Removed',
          text: 'Product removed from wishlist',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        Swal.fire('Error', 'Failed to remove from wishlist', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to remove from wishlist', 'error');
    }
  };

  const handleAddToCart = async (product) => {
    try {
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
      } else {
        Swal.fire('Error', 'Failed to add to cart', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to add to cart', 'error');
    }
  };

  const handleShare = (product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Shilpalay`,
        url: `${window.location.origin}/product/${product.slug || product._id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/product/${product.slug || product._id}`);
      Swal.fire({
        icon: 'success',
        title: 'Link Copied',
        text: 'Product link copied to clipboard',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };

  const menuItems = [
    { name: "Account Information", href: "/my-account/account-info" },
    { name: "Address Book", href: "/my-account/address-book" },
    { name: "Order History", href: "/my-account/order-history" },
    { name: "Rewards", href: "#" },
    { name: "Recommendations", href: "/my-account" },
    { name: "Wishlist", href: "/my-account/wishlist" },
    { name: "Credit Note", href: "#" },
    { name: "Returns", href: "/my-account/returns" },
    { name: "Remove Account", href: "#" }
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="relative w-full h-[250px] md:h-[300px] overflow-hidden">
          <Image
            src="/login/sari1.jpg"
            alt="Weaving background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wider text-center px-4">
              WELCOME, {session?.user?.name || 'GUEST'}
            </h1>
          </div>
        </div>
        <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12 md:py-16">
          <div className="text-center text-gray-400 py-20">Loading wishlist...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative w-full h-[250px] md:h-[300px] overflow-hidden">
        <Image
          src="/login/sari1.jpg"
          alt="Weaving background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wider text-center px-4">
            WELCOME, {session?.user?.name || 'GUEST'}
          </h1>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Sidebar Menu */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="mb-10">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-6 text-black">MY ACCOUNT</h2>
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className={`text-sm transition-colors block ${
                        item.name === "Wishlist" ? "text-black font-semibold" : "text-gray-500 hover:text-black"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-6 text-black">NEED HELP?</h2>
              <ul className="space-y-4">
                <li>
                  <Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors block">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm text-gray-500 hover:text-black transition-colors block text-left w-full"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content - Wishlist */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">My Wishlist</h2>
                <p className="text-gray-600 text-sm">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
              {wishlistItems.length > 0 && (
                <button
                  onClick={() => {
                    Swal.fire({
                      title: 'Clear Wishlist?',
                      text: 'Are you sure you want to remove all items?',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#d33',
                      cancelButtonColor: '#3085d6',
                      confirmButtonText: 'Yes, clear all',
                      cancelButtonText: 'Cancel'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        setWishlistItems([]);
                        localStorage.removeItem('wishlist');
                        Swal.fire('Cleared', 'Your wishlist has been cleared', 'success');
                      }
                    });
                  }}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            {wishlistItems.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Heart className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Your wishlist is empty</h3>
                  <p className="text-gray-600 mb-8">
                    Start adding products you love to your wishlist
                  </p>
                  <Link
                    href="/"
                    className="inline-block bg-black text-white px-8 py-3 text-sm uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {wishlistItems.map((product) => {
                  const displayPrice = product.price?.salePrice 
                    ? product.price.salePrice 
                    : product.price?.regularPrice || 0;
                  
                  const originalPrice = product.price?.salePrice 
                    ? product.price.regularPrice 
                    : null;

                  const discount = originalPrice 
                    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
                    : 0;

                  return (
                    <div key={product._id} className="group relative">
                      <Link 
                        href={`/product/${product.slug || product._id}`}
                        className="block"
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
                          
                          {/* Sale Badge */}
                          {product.price?.salePrice && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                              {discount}% OFF
                            </div>
                          )}

                          {/* Out of Stock Overlay */}
                          {product.inventory?.availability === 'out_of_stock' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-sm font-medium uppercase">Out of Stock</span>
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <div className="space-y-2">
                        <Link href={`/product/${product.slug || product._id}`}>
                          <h3 className="text-sm font-medium text-gray-800 group-hover:text-[#e5c100] transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        
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

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                            disabled={product.inventory?.availability === 'out_of_stock'}
                            className="flex-1 bg-black text-white px-3 py-2 text-xs font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span className="hidden sm:inline">Add to Cart</span>
                            <span className="sm:hidden">Cart</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              removeFromWishlist(product._id);
                            }}
                            className="p-2 border border-gray-300 hover:border-red-500 hover:text-red-500 transition-colors rounded"
                            aria-label="Remove from wishlist"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleShare(product);
                            }}
                            className="p-2 border border-gray-300 hover:border-gray-500 transition-colors rounded"
                            aria-label="Share product"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
