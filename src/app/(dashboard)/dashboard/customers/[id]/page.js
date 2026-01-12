"use client";

import { ArrowLeft, Edit, User, Mail, Phone, Calendar, MapPin, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import Image from 'next/image';

export default function CustomerDetailPage({ params: routeParams }) {
  const router = useRouter();
  const params = use(routeParams);
  const customerId = params.id;
  
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
      fetchCustomerOrders();
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const res = await fetch(`/api/admin/customers/${customerId}`);
      // if (res.ok) {
      //   const data = await res.json();
      //   setCustomer(data);
      // }
      
      // For now, get customer from orders in localStorage
      const stored = localStorage.getItem('orders');
      if (stored) {
        const ordersData = JSON.parse(stored);
        const customerOrder = ordersData.find(o => o.customer?._id === customerId);
        if (customerOrder) {
          const customerOrders = ordersData.filter(o => o.customer?._id === customerId);
          const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
          
          setCustomer({
            _id: customerId,
            firstName: customerOrder.customer.name?.split(' ')[0] || 'Guest',
            lastName: customerOrder.customer.name?.split(' ').slice(1).join(' ') || '',
            name: customerOrder.customer.name || 'Guest',
            email: customerOrder.customer.email || customerOrder.shippingAddress?.email || 'N/A',
            mobile: customerOrder.shippingAddress?.mobile || 'N/A',
            createdAt: customerOrder.createdAt,
            totalOrders: customerOrders.length,
            totalSpent: totalSpent,
            group: 'regular',
            address: customerOrder.shippingAddress
          });
        }
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      Swal.fire('Error', 'Failed to load customer details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async () => {
    try {
      // TODO: Replace with actual API endpoint
      const stored = localStorage.getItem('orders');
      if (stored) {
        const ordersData = JSON.parse(stored);
        const customerOrders = ordersData.filter(o => o.customer?._id === customerId);
        setOrders(customerOrders);
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Customer not found</p>
          <Link href="/dashboard/customers" className="text-black underline">Back to Customers</Link>
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
            <h1 className="text-2xl font-bold text-gray-800">Customer Details</h1>
            <p className="text-sm text-gray-500 mt-1">{customer.name}</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/dashboard/customers/${customerId}/edit`)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Customer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{customer.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    customer.group === 'vip' 
                      ? 'bg-purple-100 text-purple-800' 
                      : customer.group === 'wholesale'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.group || 'regular'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Mobile</p>
                    <p className="text-sm font-medium text-gray-900">{customer.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(customer.createdAt)}</p>
                  </div>
                </div>
              </div>

              {customer.address && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-sm text-gray-700">
                        {customer.address.streetAddress1}
                        {customer.address.streetAddress2 && `, ${customer.address.streetAddress2}`}
                        <br />
                        {customer.address.city}, {customer.address.district}
                        <br />
                        {customer.address.zipCode}, {customer.address.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Orders History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Order History</h2>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No orders found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link
                    key={order._id}
                    href={`/dashboard/orders/${order._id}`}
                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">#{order.orderNumber}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status || 'pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{order.items?.length || 0} items</span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">Tk {order.total?.toFixed(2) || '0.00'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Orders</p>
                    <p className="text-lg font-bold text-gray-900">{customer.totalOrders || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Spent</p>
                    <p className="text-lg font-bold text-gray-900">Tk {customer.totalSpent?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Average Order</p>
                    <p className="text-lg font-bold text-gray-900">
                      Tk {customer.totalOrders > 0 ? (customer.totalSpent / customer.totalOrders).toFixed(2) : '0.00'}
                    </p>
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
