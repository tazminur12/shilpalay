"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Plus, Minus, X, Trash2, ChevronDown, Tag, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { getCart, updateCartQuantity, removeFromCart as removeCartItem } from '@/lib/cart';
import Loading from '@/app/components/ui/Loading';

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [vatRate] = useState(10); // 10% VAT

  const getShippingCost = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const finalSubtotal = subtotal - discount;
    return finalSubtotal >= 5000 ? 0 : 100;
  };

  useEffect(() => {
    fetchCart();
  }, [session]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      // Use cart utility to get cart items
      const cart = getCart();
      setCartItems(cart.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    try {
      const item = cartItems.find(item => item._id === productId);
      const result = updateCartQuantity(productId, newQuantity, item?.selectedVariation || null);
      
      if (result.success) {
        setCartItems(result.cart.items || []);
      } else {
        if (result.error === 'out_of_stock') {
          Swal.fire({
            icon: 'warning',
            title: 'Product Not Available',
            text: result.message || 'This product is currently out of stock',
            confirmButtonText: 'OK'
          });
        } else if (result.error === 'insufficient_stock') {
          Swal.fire({
            icon: 'warning',
            title: 'Insufficient Stock',
            text: result.message || 'Not enough stock available',
            confirmButtonText: 'OK'
          });
        } else {
          Swal.fire('Error', result.message || 'Failed to update quantity', 'error');
        }
        fetchCart(); // Refresh cart to show correct quantity
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to update quantity', 'error');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const item = cartItems.find(item => item._id === productId);
      const result = removeCartItem(productId, item?.selectedVariation || null);
      
      if (result.success) {
        setCartItems(result.cart.items || []);
        Swal.fire({
          icon: 'success',
          title: 'Removed',
          text: 'Product removed from cart',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        Swal.fire('Error', 'Failed to remove from cart', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to remove from cart', 'error');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      Swal.fire('Error', 'Please enter a coupon code', 'error');
      return;
    }

    if (appliedCoupon) {
      Swal.fire('Info', 'Please remove the current coupon before applying a new one', 'info');
      return;
    }

    setApplyingCoupon(true);
    
    try {
      const subtotal = calculateSubtotal();
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal: subtotal
        })
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          name: data.coupon.name,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          discountAmount: data.coupon.discountAmount,
          maxDiscountAmount: data.coupon.maxDiscountAmount
        });
        Swal.fire({
          icon: 'success',
          title: 'Coupon Applied!',
          text: data.coupon.description || `You saved Tk ${data.coupon.discountAmount.toFixed(2)}`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        setCouponCode('');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Coupon',
          text: data.message || 'Please enter a valid coupon code',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      Swal.fire('Error', 'Failed to apply coupon. Please try again.', 'error');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.price?.salePrice || item.price?.regularPrice || 0;
      return sum + (price * (item.quantity || 1));
    }, 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    // If discountAmount is already calculated, use it
    if (appliedCoupon.discountAmount !== undefined) {
      return appliedCoupon.discountAmount;
    }
    
    // Fallback calculation
    const subtotal = calculateSubtotal();
    if (appliedCoupon.discountType === 'percent') {
      let discount = (subtotal * appliedCoupon.discountValue) / 100;
      // Apply max discount limit if set
      if (appliedCoupon.maxDiscountAmount && discount > appliedCoupon.maxDiscountAmount) {
        discount = appliedCoupon.maxDiscountAmount;
      }
      return discount;
    } else {
      return Math.min(appliedCoupon.discountValue, subtotal);
    }
  };

  const calculateVAT = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return ((subtotal - discount) * vatRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const vat = calculateVAT();
    const shipping = getShippingCost();
    return subtotal - discount + shipping + vat;
  };

  const handleCheckout = () => {
    if (!session) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to proceed with checkout',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login?redirect=/cart';
        }
      });
      return;
    }
    
    // Navigate to checkout page
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <Loading text="Loading cart..." />
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const vat = calculateVAT();
  const shippingCost = getShippingCost();
  const total = calculateTotal();
  const itemText = cartItems.length === 1 ? 'ITEM' : 'ITEMS';

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <nav className="text-xs text-gray-600">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-black">Shopping Bag</span>
          </nav>
        </div>
      </div>

      {/* Cart Content */}
      <div className="py-6 md:py-8">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
                <p className="text-sm text-gray-600 mb-8">
                  Looks like you haven&apos;t added anything to your cart yet
                </p>
                <Link
                  href="/"
                  className="inline-block bg-black text-white px-8 py-3 text-xs uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                {/* MY BAG Title */}
                <h1 className="text-lg md:text-xl font-bold mb-6 uppercase tracking-wide">
                  MY BAG ({cartItems.length} {itemText})
                </h1>
                
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const displayPrice = item.price?.salePrice 
                      ? item.price.salePrice 
                      : item.price?.regularPrice || 0;
                    
                    const originalPrice = item.price?.salePrice 
                      ? item.price.regularPrice 
                      : null;

                    const itemTotal = displayPrice * (item.quantity || 1);

                    return (
                      <div key={item._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <Link 
                            href={`/product/${item.slug || item._id}`}
                            className="shrink-0 w-24 h-32 md:w-32 md:h-40 relative bg-gray-100 rounded overflow-hidden"
                          >
                            {item.images?.thumbnail ? (
                              <Image
                                src={item.images.thumbnail}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </Link>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <div className="flex-1">
                                <Link 
                                  href={`/product/${item.slug || item._id}`}
                                  className="block"
                                >
                                  <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1 hover:text-[#e5c100] transition-colors">
                                    {item.name}
                                  </h3>
                                </Link>
                                
                                {/* Stock & Size Info */}
                                <div className="flex items-center gap-3 mb-2 text-xs text-gray-600">
                                  <span className={item.inventory?.availability === 'out_of_stock' ? 'text-red-600' : 'text-green-600'}>
                                    {item.inventory?.availability === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}
                                  </span>
                                  {item.selectedVariation && (
                                    <>
                                      <span>|</span>
                                      <span>Size : {item.selectedVariation.name || item.selectedVariation.size || 'N/A'}</span>
                                    </>
                                  )}
                                </div>

                                {/* Price */}
                                <div className="mb-3">
                                  <span className="text-sm md:text-base font-semibold text-gray-900">
                                    Tk {displayPrice.toFixed(2)}
                                  </span>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center border border-gray-300 rounded w-fit">
                                  <button
                                    onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}
                                    className="p-1.5 hover:bg-gray-100 transition-colors"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <input
                                    type="number"
                                    value={item.quantity || 1}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 1;
                                      updateQuantity(item._id, val);
                                    }}
                                    className="w-12 text-center text-xs font-medium border-0 outline-none focus:ring-0"
                                    min="1"
                                  />
                                  <button
                                    onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                                    className="p-1.5 hover:bg-gray-100 transition-colors"
                                    aria-label="Increase quantity"
                                    disabled={item.inventory?.availability === 'out_of_stock'}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Action Links */}
                                <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
                                  <button className="hover:text-black transition-colors">Gift Wrap</button>
                                  <span>|</span>
                                  <button className="hover:text-black transition-colors">Save For Later</button>
                                  <span>|</span>
                                  <button 
                                    onClick={() => removeFromCart(item._id)}
                                    className="hover:text-red-600 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>

                              {/* Item Price */}
                              <div className="text-right">
                                <p className="text-sm md:text-base font-semibold text-gray-900">
                                  Tk {itemTotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Continue Shopping */}
                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-block border border-black text-black px-6 py-2.5 text-xs uppercase tracking-wider font-medium hover:bg-black hover:text-white transition-colors"
                  >
                    CONTINUE SHOPPING
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  {/* Checkout Button - Top */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-black text-white px-6 py-3 text-xs uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors mb-6"
                  >
                    CHECKOUT
                  </button>

                  <div className="border border-gray-200 rounded p-4 bg-white">
                    <h2 className="text-base font-bold mb-4 uppercase tracking-wide">ORDER SUMMARY</h2>
                    
                    {/* Promo Code Section */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Promo Code
                      </label>
                      {!appliedCoupon ? (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Enter promo code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  applyCoupon();
                                }
                              }}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-black transition-colors uppercase"
                              disabled={applyingCoupon}
                            />
                          </div>
                          <button
                            onClick={applyCoupon}
                            disabled={applyingCoupon || !couponCode.trim()}
                            className="px-4 py-2 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {applyingCoupon ? 'Applying...' : 'Apply'}
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-semibold text-green-800">
                                {appliedCoupon.code}
                              </span>
                            </div>
                            <button
                              onClick={removeCoupon}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              aria-label="Remove coupon"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          {appliedCoupon.name && (
                            <p className="text-[10px] text-green-700 mt-1">
                              {appliedCoupon.name}
                            </p>
                          )}
                          <p className="text-xs font-medium text-green-800 mt-1">
                            Discount: Tk {calculateDiscount().toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 mb-4 border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">Tk {subtotal.toFixed(2)}</span>
                      </div>
                      
                      {discount > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-medium text-green-600">
                            -Tk {discount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium">
                          {shippingCost === 0 ? 'Free' : `Tk ${shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        (Standard Shipping : within 3-4 days inside Dhaka, within 4-7 days outside Dhaka)
                      </p>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">VAT</span>
                        <span className="font-medium">Tk {vat.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between text-xs pt-3 border-t border-gray-200 mt-3">
                        <span className="text-sm font-bold">Total</span>
                        <span className="text-sm font-bold">Tk {total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Express Delivery Note */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-[10px] text-gray-600 leading-relaxed">
                        Express delivery within 24 to 48 hours available for Dhaka City. Select option on next screen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
