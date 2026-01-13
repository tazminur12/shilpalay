"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Truck, CreditCard, Wallet, ChevronDown, Tag, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { getCart } from '@/lib/cart';

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
    mobile: '',
    streetAddress1: '',
    streetAddress2: '',
    country: 'Bangladesh',
    district: '',
    city: '',
    zipCode: ''
  });
  
  const [saveToAddressBook, setSaveToAddressBook] = useState(true);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/login?redirect=/checkout');
      return;
    }
    fetchCart();
  }, [session, router]);

  const fetchCart = () => {
    setLoading(true);
    try {
      const cart = getCart();
      setCartItems(cart.items || []);
      
      if (cart.items.length === 0) {
        Swal.fire('Cart Empty', 'Your cart is empty. Please add items to proceed.', 'warning').then(() => {
          router.push('/cart');
        });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.price?.salePrice || item.price?.regularPrice || 0;
      return sum + (price * (item.quantity || 1));
    }, 0);
  };

  const getShippingCost = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 5000 ? 0 : 100;
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
    const vatRate = 10; // 10% VAT
    return ((subtotal - discount) * vatRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = getShippingCost();
    const vat = calculateVAT();
    return subtotal - discount + shipping + vat;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Swal.fire('Error', 'Please enter a coupon code', 'error');
      return;
    }

    setApplyingCoupon(true);
    try {
      const subtotal = calculateSubtotal();
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal: subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to validate coupon');
      }

      if (data.valid && data.coupon) {
        setAppliedCoupon(data.coupon);
        setCouponCode('');
        Swal.fire({
          icon: 'success',
          title: 'Coupon Applied!',
          text: `${data.coupon.name || 'Coupon'} has been applied successfully`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error('Invalid coupon code');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Coupon Error',
        text: error.message || 'Failed to apply coupon. Please check the code and try again.',
      });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.mobile) {
      Swal.fire('Required Fields', 'Please fill in all required fields', 'warning');
      return;
    }

    if (!shippingAddress.streetAddress1 || !shippingAddress.district || !shippingAddress.city) {
      Swal.fire('Required Fields', 'Please complete your shipping address', 'warning');
      return;
    }

    if (!paymentMethod) {
      Swal.fire('Payment Method', 'Please select a payment method', 'warning');
      return;
    }

    Swal.fire({
      title: 'Processing Order...',
      text: 'Please wait while we process your order',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Calculate order totals
      const subtotal = calculateSubtotal();
      const discount = calculateDiscount();
      const shipping = getShippingCost();
      const vat = calculateVAT();
      const total = calculateTotal();

      // Create order object
      const order = {
        _id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        customer: session?.user ? {
          _id: session.user.id,
          name: session.user.name,
          email: session.user.email
        } : null,
        items: cartItems.map(item => ({
          _id: item._id,
          name: item.name,
          slug: item.slug,
          price: item.price,
          quantity: item.quantity || 1,
          selectedVariation: item.selectedVariation,
          images: item.images
        })),
        shippingAddress: {
          ...shippingAddress,
          email: session?.user?.email || shippingAddress.email
        },
        billingAddress: sameAsShipping ? {
          ...shippingAddress,
          email: session?.user?.email || shippingAddress.email
        } : null,
        subtotal: subtotal,
        shippingCost: shipping,
        vat: vat,
        discount: discount,
        total: total,
        couponCode: appliedCoupon?.code || null,
        shippingMethod: shippingMethod,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        status: 'pending',
        deliveryInstructions: deliveryInstructions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // API call to save order and decrease stock
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to place order');
      }

      const result = await res.json();
      
      // Also save to localStorage for demo purposes
      const existingOrders = localStorage.getItem('orders');
      const orders = existingOrders ? JSON.parse(existingOrders) : [];
      orders.push(result.order || order);
      localStorage.setItem('orders', JSON.stringify(orders));

      // Clear cart
      localStorage.removeItem('cart');
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Dispatch order update event
      window.dispatchEvent(new CustomEvent('orderUpdated'));

      Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: `Order #${order.orderNumber} has been placed successfully`,
        confirmButtonText: 'View Orders'
      }).then(() => {
        router.push('/dashboard/orders');
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to place order. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="text-center text-gray-400 py-20">Loading checkout...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null;
  }

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const shipping = getShippingCost();
  const vat = calculateVAT();
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <nav className="text-xs text-gray-600">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-black">Checkout</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 md:py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-2">CHECKOUT</h1>
            <p className="text-sm text-gray-600">
              Please fill in the fields below and place order to complete your purchase!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. SHIPPING ADDRESS */}
              <div className="border border-gray-200">
                <div className="bg-gray-800 text-white px-6 py-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide">1. SHIPPING ADDRESS</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.mobile}
                      onChange={(e) => setShippingAddress({...shippingAddress, mobile: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.streetAddress1}
                      onChange={(e) => setShippingAddress({...shippingAddress, streetAddress1: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black transition-colors mb-2"
                      placeholder="Address Line 1"
                      required
                    />
                    <input
                      type="text"
                      value={shippingAddress.streetAddress2}
                      onChange={(e) => setShippingAddress({...shippingAddress, streetAddress2: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black transition-colors"
                      placeholder="Address Line 2 (Optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black transition-colors bg-white"
                      >
                        <option value="Bangladesh">Bangladesh</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        District/State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={shippingAddress.district}
                          onChange={(e) => setShippingAddress({...shippingAddress, district: e.target.value})}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 text-sm outline-none focus:border-black transition-colors bg-white appearance-none"
                          required
                        >
                          <option value="">Select a region, state or province.</option>
                          <option value="Dhaka">Dhaka</option>
                          <option value="Chittagong">Chittagong</option>
                          <option value="Sylhet">Sylhet</option>
                          <option value="Rajshahi">Rajshahi</option>
                          <option value="Khulna">Khulna</option>
                          <option value="Barisal">Barisal</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        City/Area <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 text-sm outline-none focus:border-black transition-colors bg-white appearance-none"
                          required
                        >
                          <option value="">Select city or area.</option>
                          <option value="Gulshan">Gulshan</option>
                          <option value="Dhanmondi">Dhanmondi</option>
                          <option value="Uttara">Uttara</option>
                          <option value="Banani">Banani</option>
                          <option value="Wari">Wari</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Zip/Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveToAddressBook}
                        onChange={(e) => setSaveToAddressBook(e.target.checked)}
                        className="w-4 h-4 border-gray-300 rounded"
                      />
                      <span className="text-xs text-gray-700">Save in address book</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                        className="w-4 h-4 border-gray-300 rounded"
                      />
                      <span className="text-xs text-gray-700">My billing and shipping address are the same</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button className="px-6 py-2 bg-gray-800 text-white text-xs uppercase tracking-wider font-medium hover:bg-gray-700 transition-colors">
                      UPDATE
                    </button>
                    <button className="px-6 py-2 bg-black text-white text-xs uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors">
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. SHIPPING METHOD */}
              <div className="border border-gray-200">
                <div className="bg-gray-800 text-white px-6 py-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide">2. SHIPPING METHOD</h2>
                </div>
                <div className="p-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="mt-1 w-4 h-4 border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">
                          Standard Shipping within 3-4 days inside Dhaka, within 4-7 days outside Dhaka
                        </span>
                        <span className="text-sm font-semibold text-gray-900">Tk {shipping.toFixed(2)}</span>
                      </div>
                    </div>
                  </label>
                  <Link href="#" className="text-xs text-gray-600 hover:text-black mt-3 inline-block">
                    Add Instructions for Delivery
                  </Link>
                </div>
              </div>

              {/* 3. PAYMENT METHOD */}
              <div className="border border-gray-200">
                <div className="bg-gray-800 text-white px-6 py-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide">3. PAYMENT METHOD</h2>
                </div>
                <div className="p-6 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded hover:border-black transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 border-gray-300"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">Debit/Credit cards and Mobile Banking</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded hover:border-black transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 border-gray-300"
                    />
                    <Truck className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">Cash on delivery</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Review */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="border border-gray-200">
                  <div className="bg-gray-800 text-white px-6 py-3">
                    <h2 className="text-sm font-bold uppercase tracking-wide">4. ORDER REVIEW</h2>
                  </div>
                  <div className="p-6 bg-white">
                    {/* Products */}
                    <div className="space-y-4 mb-6">
                      {cartItems.map((item) => {
                        const displayPrice = item.price?.salePrice || item.price?.regularPrice || 0;
                        const itemTotal = displayPrice * (item.quantity || 1);
                        
                        return (
                          <div key={item._id} className="flex gap-3 pb-4 border-b border-gray-200 last:border-b-0">
                            <Link 
                              href={`/product/${item.slug || item._id}`}
                              className="shrink-0 w-20 h-24 relative bg-gray-100 rounded overflow-hidden"
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
                            <div className="flex-1 min-w-0">
                              <Link 
                                href={`/product/${item.slug || item._id}`}
                                className="block"
                              >
                                <h3 className="text-xs font-medium text-gray-900 mb-1 line-clamp-2 hover:text-[#e5c100] transition-colors">
                                  {item.name}
                                </h3>
                              </Link>
                              {item.selectedVariation && (
                                <p className="text-xs text-gray-600 mb-1">
                                  Size: {item.selectedVariation.name || item.selectedVariation.size || 'N/A'}
                                </p>
                              )}
                              <p className="text-xs text-gray-600 mb-1">Quantity: {item.quantity || 1}</p>
                              <p className="text-sm font-semibold text-gray-900">Tk {itemTotal.toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Coupon Section */}
                    <div className="mb-6 border-b border-gray-200 pb-4">
                      {!appliedCoupon ? (
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Have a coupon code?
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleApplyCoupon();
                                }
                              }}
                              placeholder="Enter coupon code"
                              className="flex-1 px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black transition-colors"
                            />
                            <button
                              onClick={handleApplyCoupon}
                              disabled={applyingCoupon || !couponCode.trim()}
                              className="px-4 py-2 bg-black text-white text-xs uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {applyingCoupon ? '...' : 'APPLY'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-xs font-semibold text-green-900">
                                  {appliedCoupon.code} - {appliedCoupon.name || 'Coupon Applied'}
                                </p>
                                <p className="text-xs text-green-700">
                                  Discount: Tk {discount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveCoupon}
                              className="p-1 text-green-600 hover:text-green-800 transition-colors"
                              title="Remove coupon"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 mb-6 border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">SUBTOTAL</span>
                        <span className="font-medium">Tk {subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-xs text-green-600">
                          <span>DISCOUNT ({appliedCoupon?.code})</span>
                          <span className="font-medium">-Tk {discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">SHIPPING</span>
                        <span className="font-medium">Tk {shipping.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Standard Shipping: within 3-4 days inside Dhaka, within 4-7 days outside Dhaka
                      </p>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">VAT</span>
                        <span className="font-medium">Tk {vat.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-3 border-t border-gray-200 mt-3">
                        <span className="font-bold">TOTAL</span>
                        <span className="font-bold text-red-600">Tk {total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Disclaimers */}
                    <div className="mb-6 text-[10px] text-gray-600 space-y-1.5">
                      <p>1. Returns and exchanges are available within 7 days of delivery. [Learn more]</p>
                      <p>2. Shipping charges are non-refundable. [Learn more]</p>
                      <p>3. For any queries, contact our customer service. [Learn more]</p>
                      <p>4. Product images are for reference only. [Learn more]</p>
                      <p>5. Please check package integrity before accepting delivery. [Learn more]</p>
                      <p>6. COD orders require verification. [Learn more]</p>
                      <p>7. Terms and conditions apply. [Learn more]</p>
                    </div>

                    {/* Agreement */}
                    <div className="mb-6 text-xs text-gray-700">
                      <p>
                        By clicking &quot;Place Order&quot;, you agree to Shilpalay&apos;s{' '}
                        <Link href="/terms" className="text-orange-600 hover:underline">Terms & Conditions</Link>
                        {' '}and{' '}
                        <Link href="/returns" className="text-orange-600 hover:underline">Return & Exchange policy</Link>.
                      </p>
                    </div>

                    {/* Place Order Button */}
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full bg-black text-white px-6 py-3 text-xs uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors"
                    >
                      PLACE ORDER
                    </button>
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
