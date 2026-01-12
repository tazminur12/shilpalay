"use client";

import { ArrowLeft, Edit, CheckCircle, XCircle, Package, Truck, MapPin, CreditCard, User, Calendar, Phone, Mail } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function OrderDetailPage({ params: routeParams }) {
  const router = useRouter();
  const params = use(routeParams);
  const orderId = params.id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setPaymentStatus(order.paymentStatus);
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const res = await fetch(`/api/admin/orders/${orderId}`);
      // if (res.ok) {
      //   const data = await res.json();
      //   setOrder(data);
      // }
      
      // For now, get order from localStorage
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
      Swal.fire('Error', 'Failed to load order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      // TODO: Replace with actual API endpoint
      // const res = await fetch(`/api/admin/orders/${orderId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // Update in localStorage
      const stored = localStorage.getItem('orders');
      if (stored) {
        const ordersData = JSON.parse(stored);
        const updatedOrders = ordersData.map(o => 
          o._id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
        );
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        setOrder({ ...order, status: newStatus });
        setStatus(newStatus);
        window.dispatchEvent(new CustomEvent('orderUpdated'));
        
        Swal.fire('Success', `Order status updated to ${newStatus}`, 'success');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to update order status', 'error');
    }
  };

  const updatePaymentStatus = async (newPaymentStatus) => {
    try {
      // Update in localStorage
      const stored = localStorage.getItem('orders');
      if (stored) {
        const ordersData = JSON.parse(stored);
        const updatedOrders = ordersData.map(o => 
          o._id === orderId ? { ...o, paymentStatus: newPaymentStatus, updatedAt: new Date().toISOString() } : o
        );
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        setOrder({ ...order, paymentStatus: newPaymentStatus });
        setPaymentStatus(newPaymentStatus);
        window.dispatchEvent(new CustomEvent('orderUpdated'));
        
        Swal.fire('Success', `Payment status updated to ${newPaymentStatus}`, 'success');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to update payment status', 'error');
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Order not found</p>
          <Link href="/dashboard/orders" className="text-black underline">Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
            <p className="text-sm text-gray-500 mt-1">Order #{order.orderNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Order Status</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => updateOrderStatus('pending')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => updateOrderStatus('processing')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  status === 'processing' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Processing
              </button>
              <button
                onClick={() => updateOrderStatus('shipped')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  status === 'shipped' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Shipped
              </button>
              <button
                onClick={() => updateOrderStatus('delivered')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  status === 'delivered' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Delivered
              </button>
              <button
                onClick={() => updateOrderStatus('cancelled')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  status === 'cancelled' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Payment Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(paymentStatus)}`}>
                  {paymentStatus}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updatePaymentStatus('pending')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    paymentStatus === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => updatePaymentStatus('paid')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => updatePaymentStatus('failed')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    paymentStatus === 'failed' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Failed
                </button>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Items</h2>
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
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-800">Shipping Address</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
              <p>{order.shippingAddress?.streetAddress1}</p>
              {order.shippingAddress?.streetAddress2 && <p>{order.shippingAddress.streetAddress2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.district}</p>
              <p>{order.shippingAddress?.zipCode}, {order.shippingAddress?.country}</p>
              <p className="pt-2 border-t border-gray-100">
                <Phone className="w-4 h-4 inline mr-1" />
                {order.shippingAddress?.mobile}
              </p>
              {order.shippingAddress?.email && (
                <p>
                  <Mail className="w-4 h-4 inline mr-1" />
                  {order.shippingAddress.email}
                </p>
              )}
            </div>
            {order.deliveryInstructions && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-600 mb-1">Delivery Instructions</p>
                <p className="text-sm text-gray-700">{order.deliveryInstructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Order Date</p>
                  <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900 capitalize">{order.paymentMethod || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Shipping Method</p>
                  <p className="font-medium text-gray-900 capitalize">{order.shippingMethod || 'Standard'}</p>
                </div>
              </div>
              {order.customer && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">Customer</p>
                    <p className="font-medium text-gray-900">{order.customer.name || 'Guest'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
