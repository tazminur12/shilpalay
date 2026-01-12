"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ArrowLeft, Package, RefreshCw, CheckCircle, XCircle, Clock, MapPin, Calendar } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function ReturnDetailPage({ params: routeParams }) {
  const { data: session } = useSession();
  const router = useRouter();
  const params = use(routeParams);
  const returnId = params.id;
  
  const [returnOrder, setReturnOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (session && returnId) {
      fetchReturn();
    }
  }, [session, returnId]);

  const fetchReturn = async () => {
    try {
      const res = await fetch(`/api/returns/my-returns/${returnId}`);
      if (res.ok) {
        const data = await res.json();
        setReturnOrder(data);
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem('orders');
        if (stored) {
          const ordersData = JSON.parse(stored);
          const found = ordersData.find(o => o._id === returnId && (o.returnStatus || o.status === 'returned'));
          if (found) {
            setReturnOrder(found);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching return:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReturnStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReturnStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getReturnTypeColor = (type) => {
    return type === 'exchange' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-orange-100 text-orange-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelReturn = async () => {
    const result = await Swal.fire({
      title: 'Cancel Return Request?',
      text: 'Are you sure you want to cancel this return request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/returns/my-returns/${returnId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cancel' })
        });
        
        if (res.ok) {
          Swal.fire('Cancelled', 'Your return request has been cancelled', 'success');
          router.push('/my-account/returns');
        } else {
          Swal.fire('Error', 'Failed to cancel return request', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to cancel return request', 'error');
      }
    }
  };

  if (!session) {
    router.push('/login?redirect=/my-account/returns');
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12 md:py-16">
          <div className="text-center py-20 text-gray-500">Loading return details...</div>
        </div>
      </main>
    );
  }

  if (!returnOrder) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12 md:py-16">
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Return request not found</p>
            <Link href="/my-account/returns" className="text-black underline">Back to Returns</Link>
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
            RETURN DETAILS
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
                      className={`text-sm transition-colors block ${
                        item.name === "Returns" ? "text-black font-semibold" : "text-gray-500 hover:text-black"
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

          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Returns
              </button>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Return Request #{returnOrder.orderNumber || returnOrder._id.slice(-8)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Requested on {formatDate(returnOrder.updatedAt || returnOrder.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getReturnTypeColor(returnOrder.returnType)}`}>
                    {returnOrder.returnType || 'return'}
                  </span>
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getReturnStatusColor(returnOrder.returnStatus)}`}>
                    {getReturnStatusIcon(returnOrder.returnStatus)}
                    {returnOrder.returnStatus || 'pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Return Items */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Items to {returnOrder.returnType || 'return'}</h3>
                <div className="space-y-4">
                  {returnOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                        {item.images?.thumbnail ? (
                          <Image
                            src={item.images.thumbnail}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Link 
                          href={`/product/${item.slug || ''}`}
                          className="font-medium text-gray-900 hover:text-black transition-colors"
                        >
                          {item.name}
                        </Link>
                        {item.selectedVariation && (
                          <p className="text-xs text-gray-500 mt-1">
                            {item.selectedVariation.color && `Color: ${item.selectedVariation.color}`}
                            {item.selectedVariation.size && ` | Size: ${item.selectedVariation.size}`}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          Tk {((item.price?.salePrice || item.price?.regularPrice || 0) * (item.quantity || 1)).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tk {(item.price?.salePrice || item.price?.regularPrice || 0).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Return Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Request Date</p>
                      <p className="font-medium text-gray-900">{formatDate(returnOrder.updatedAt || returnOrder.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Return Type</p>
                      <p className="font-medium text-gray-900 capitalize">{returnOrder.returnType || 'return'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="font-medium text-gray-900 capitalize">{returnOrder.returnStatus || 'pending'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Original Order</p>
                      <Link 
                        href={`/my-account/order-history/${returnOrder._id}`}
                        className="font-medium text-black hover:underline"
                      >
                        #{returnOrder.orderNumber || returnOrder._id.slice(-8)}
                      </Link>
                    </div>
                  </div>
                </div>
                {returnOrder.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Notes:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{returnOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-800">Return Address</h3>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <p className="font-medium">{returnOrder.shippingAddress?.firstName} {returnOrder.shippingAddress?.lastName}</p>
                  <p>{returnOrder.shippingAddress?.streetAddress1}</p>
                  {returnOrder.shippingAddress?.streetAddress2 && <p>{returnOrder.shippingAddress.streetAddress2}</p>}
                  <p>{returnOrder.shippingAddress?.city}, {returnOrder.shippingAddress?.district}</p>
                  <p>{returnOrder.shippingAddress?.zipCode}, {returnOrder.shippingAddress?.country}</p>
                </div>
              </div>

              {/* Return Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Refund Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">Tk {returnOrder.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Tk {returnOrder.shippingCost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between">
                    <span className="font-bold text-gray-900">Total Refund</span>
                    <span className="font-bold text-gray-900">Tk {returnOrder.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {returnOrder.returnStatus === 'pending' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Your return request is being reviewed</p>
                    <button
                      onClick={handleCancelReturn}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
