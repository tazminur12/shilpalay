"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ArrowLeft, Package, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function RequestReturnPage({ params: routeParams }) {
  const { data: session } = useSession();
  const router = useRouter();
  const params = use(routeParams);
  const orderId = params.id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    returnType: 'return',
    reason: '',
    notes: ''
  });

  const menuItems = [
    { name: "Account Information", href: "/my-account/account-info" },
    { name: "Address Book", href: "/my-account/address-book" },
    { name: "Order History", href: "/my-account/order-history" },
    { name: "Recommendations", href: "/my-account" },
    { name: "Wishlist", href: "/my-account/wishlist" },
    { name: "Credit Note", href: "#" },
    { name: "Returns", href: "/my-account/returns" },
    { name: "Remove Account", href: "#" }
  ];

  const returnReasons = [
    'Defective product',
    'Wrong item received',
    'Size/Color mismatch',
    'Not as described',
    'Damaged during shipping',
    'Changed my mind',
    'Other'
  ];

  useEffect(() => {
    if (session && orderId) {
      fetchOrder();
    }
  }, [session, orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/my-orders`);
      if (res.ok) {
        const orders = await res.json();
        const foundOrder = orders.find(o => o._id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem('orders');
      if (stored) {
        const ordersData = JSON.parse(stored);
        const foundOrder = ordersData.find(o => o._id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason) {
      Swal.fire('Error', 'Please select a reason for return', 'error');
      return;
    }

    setSubmitting(true);
    
    try {
      const res = await fetch('/api/returns/my-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          returnType: formData.returnType,
          reason: formData.reason,
          notes: formData.notes
        })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Your return request has been submitted successfully',
          icon: 'success',
          confirmButtonColor: '#000'
        }).then(() => {
          router.push(`/my-account/returns/${orderId}`);
        });
      } else {
        Swal.fire('Error', data.message || 'Failed to submit return request', 'error');
      }
    } catch (error) {
      console.error('Error submitting return request:', error);
      Swal.fire('Error', 'Failed to submit return request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    router.push('/login?redirect=/my-account/order-history');
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12 md:py-16">
          <div className="text-center py-20 text-gray-500">Loading order details...</div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12 md:py-16">
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Order not found</p>
            <Link href="/my-account/order-history" className="text-black underline">Back to Order History</Link>
          </div>
        </div>
      </main>
    );
  }

  if (order.status !== 'delivered') {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12 md:py-16">
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <p className="text-gray-500 mb-4">Only delivered orders can be returned</p>
            <Link href={`/my-account/order-history/${orderId}`} className="text-black underline">Back to Order</Link>
          </div>
        </div>
      </main>
    );
  }

  if (order.returnStatus) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12 md:py-16">
          <div className="text-center py-20">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <p className="text-gray-500 mb-4">A return request already exists for this order</p>
            <Link href={`/my-account/returns/${orderId}`} className="text-black underline">View Return Details</Link>
          </div>
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
            REQUEST RETURN/EXCHANGE
          </h1>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Sidebar Menu */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="mb-10">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-6 text-black">MY ACCOUNT</h2>
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="text-sm text-gray-500 hover:text-black transition-colors block"
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

          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Order
              </button>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Order #{order.orderNumber || order._id.slice(-8)}
              </h2>
              <p className="text-sm text-gray-500">Request a return or exchange for this order</p>
            </div>

            {/* Order Items Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      {item.images?.thumbnail ? (
                        <Image
                          src={item.images.thumbnail}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Return Request Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-800">Return Request Details</h3>
              
              {/* Return Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Return Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="returnType"
                      value="return"
                      checked={formData.returnType === 'return'}
                      onChange={(e) => setFormData({ ...formData, returnType: e.target.value })}
                      className="w-4 h-4 text-black focus:ring-black"
                    />
                    <span className="text-sm text-gray-700">Return (Refund)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="returnType"
                      value="exchange"
                      checked={formData.returnType === 'exchange'}
                      onChange={(e) => setFormData({ ...formData, returnType: e.target.value })}
                      className="w-4 h-4 text-black focus:ring-black"
                    />
                    <span className="text-sm text-gray-700">Exchange</span>
                  </label>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Reason for Return <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                  required
                >
                  <option value="">Select a reason</option>
                  {returnReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black resize-none"
                  placeholder="Please provide any additional details about your return request..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-black text-white px-6 py-3 text-sm font-medium uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Return Request'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
