"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Calendar, Phone, Mail, CheckCircle, Clock, RefreshCw, XCircle, RefreshCcw, FileText, Download } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import InvoiceGenerator from '@/app/components/InvoiceGenerator';

export default function OrderDetailPage({ params: routeParams }) {
  const { data: session } = useSession();
  const router = useRouter();
  const params = use(routeParams);
  const orderId = params.id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

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
    if (session && orderId) {
      fetchOrder();
      fetchTracking();
    }
  }, [session, orderId]);

  const fetchOrder = async () => {
    try {
      // First try from API
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
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

  const fetchTracking = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/tracking`);
      if (res.ok) {
        const data = await res.json();
        setTrackingData(data);
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
    }
  };

  const handleRequestReturn = () => {
    router.push(`/my-account/order-history/${orderId}/return`);
  };

  const handleDownloadInvoice = async () => {
    try {
      Swal.fire({
        title: 'Generating Invoice...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const res = await fetch(`/api/orders/${orderId}/invoice`);
      if (res.ok) {
        const data = await res.json();
        setInvoiceData(data);
        setShowInvoice(true);
        Swal.close();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate invoice');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to generate invoice',
      });
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
            ORDER DETAILS
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
                        item.name === "Order History" ? "text-black font-semibold" : "text-gray-500 hover:text-black"
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
                Back to Orders
              </button>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Order #{order.orderNumber || order._id.slice(-8)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status || 'pending'}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Order Items */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items?.map((item, idx) => (
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

              {/* Shipping Address */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-800">Shipping Address</h3>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <p className="font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                  <p>{order.shippingAddress?.streetAddress1}</p>
                  {order.shippingAddress?.streetAddress2 && <p>{order.shippingAddress.streetAddress2}</p>}
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.district}</p>
                  <p>{order.shippingAddress?.zipCode}, {order.shippingAddress?.country}</p>
                  {order.shippingAddress?.mobile && (
                    <p className="pt-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {order.shippingAddress.mobile}
                    </p>
                  )}
                  {order.shippingAddress?.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {order.shippingAddress.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">Tk {order.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Tk {order.shippingCost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT</span>
                    <span className="font-medium">Tk {order.vat?.toFixed(2) || '0.00'}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">-Tk {order.discount?.toFixed(2) || '0.00'}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200 flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">Tk {order.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Order Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Order Date</p>
                      <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Payment Method</p>
                      <p className="font-medium text-gray-900 capitalize">{order.paymentMethod || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Shipping Method</p>
                      <p className="font-medium text-gray-900 capitalize">{order.shippingMethod || 'Standard'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Payment Status</p>
                      <p className="font-medium text-gray-900 capitalize">{order.paymentStatus || 'pending'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancel Order Button for Pending Orders */}
              {order.status === 'pending' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Want to Cancel?</h3>
                      <p className="text-sm text-gray-600">You can cancel this order if it hasn't been processed yet</p>
                    </div>
                    <button
                      onClick={async () => {
                        const { value: reason } = await Swal.fire({
                          title: 'Cancel Order?',
                          text: 'Are you sure you want to cancel this order?',
                          icon: 'warning',
                          input: 'textarea',
                          inputLabel: 'Reason for cancellation (optional)',
                          inputPlaceholder: 'Enter reason...',
                          showCancelButton: true,
                          confirmButtonColor: '#dc2626',
                          cancelButtonColor: '#6b7280',
                          confirmButtonText: 'Yes, cancel it!',
                          cancelButtonText: 'No, keep it',
                        });

                        if (reason !== undefined) {
                          try {
                            Swal.fire({
                              title: 'Processing...',
                              allowOutsideClick: false,
                              didOpen: () => Swal.showLoading(),
                            });

                            const res = await fetch(`/api/orders/${orderId}/cancel`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ reason: reason || 'No reason provided' }),
                            });

                            const data = await res.json();

                            if (!res.ok) {
                              throw new Error(data.message || 'Failed to cancel order');
                            }

                            Swal.fire({
                              icon: 'success',
                              title: 'Order Cancelled',
                              text: 'Your order has been cancelled successfully',
                              confirmButtonColor: '#000',
                            });

                            fetchOrder();
                            fetchTracking();
                          } catch (error) {
                            Swal.fire({
                              icon: 'error',
                              title: 'Error',
                              text: error.message || 'Failed to cancel order',
                            });
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}

              {/* Return Request Button for Delivered Orders */}
              {order.status === 'delivered' && !order.returnStatus && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Not Satisfied?</h3>
                      <p className="text-sm text-gray-600">Request a return or exchange for this order</p>
                    </div>
                    <button
                      onClick={handleRequestReturn}
                      className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Request Return/Exchange
                    </button>
                  </div>
                </div>
              )}

              {/* Return Status for Orders with Return Request */}
              {order.returnStatus && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Return Request</h3>
                      <p className="text-sm text-gray-600">
                        Status: <span className="font-medium capitalize">{order.returnStatus}</span>
                        {order.returnType && (
                          <> | Type: <span className="font-medium capitalize">{order.returnType}</span></>
                        )}
                      </p>
                    </div>
                    <Link
                      href={`/my-account/returns/${order._id}`}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Return Details
                    </Link>
                  </div>
                </div>
              )}

              {/* Order Tracking */}
              {trackingData && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-800">Order Tracking</h3>
                  </div>
                  
                  {trackingData.trackingNumber && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="text-lg font-semibold text-gray-900">{trackingData.trackingNumber}</p>
                    </div>
                  )}

                  {trackingData.estimatedDeliveryDate && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Estimated Delivery</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {formatDate(trackingData.estimatedDeliveryDate)}
                      </p>
                    </div>
                  )}

                  {trackingData.trackingHistory && trackingData.trackingHistory.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-700">Tracking History</h4>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        <div className="space-y-4">
                          {trackingData.trackingHistory.map((track, idx) => (
                            <div key={idx} className="relative flex items-start gap-4">
                              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                                idx === trackingData.trackingHistory.length - 1 
                                  ? 'bg-black' 
                                  : 'bg-gray-300'
                              }`}>
                                {idx === trackingData.trackingHistory.length - 1 && (
                                  <CheckCircle className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <p className="font-medium text-gray-900 capitalize">{track.status}</p>
                                {track.message && (
                                  <p className="text-sm text-gray-600 mt-1">{track.message}</p>
                                )}
                                {track.location && (
                                  <p className="text-xs text-gray-500 mt-1">📍 {track.location}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(track.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Download Invoice Button */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Invoice</h3>
                    <p className="text-sm text-gray-600">Download or print your order invoice</p>
                  </div>
                  <button
                    onClick={handleDownloadInvoice}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && invoiceData && (
        <InvoiceGenerator
          invoiceData={invoiceData}
          onClose={() => {
            setShowInvoice(false);
            setInvoiceData(null);
          }}
        />
      )}
    </main>
  );
}
