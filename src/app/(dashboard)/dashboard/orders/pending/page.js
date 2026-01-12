"use client";

import { Eye, Search, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PendingOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const res = await fetch('/api/admin/orders?status=pending');
      // if (res.ok) {
      //   const data = await res.json();
      //   setOrders(Array.isArray(data) ? data : []);
      // }
      
      // For now, get orders from localStorage
      const stored = localStorage.getItem('orders');
      if (stored) {
        const ordersData = JSON.parse(stored);
        const allOrders = Array.isArray(ordersData) ? ordersData : [];
        setOrders(allOrders.filter(order => order.status === 'pending'));
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const result = await Swal.fire({
      title: 'Update Order Status?',
      text: `Change status to ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update'
    });

    if (result.isConfirmed) {
      try {
        const stored = localStorage.getItem('orders');
        if (stored) {
          const ordersData = JSON.parse(stored);
          const updatedOrders = ordersData.map(o => 
            o._id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
          );
          localStorage.setItem('orders', JSON.stringify(updatedOrders));
          setOrders(updatedOrders.filter(o => o.status === 'pending'));
          window.dispatchEvent(new CustomEvent('orderUpdated'));
          
          Swal.fire('Success', `Order status updated to ${newStatus}`, 'success');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to update order status', 'error');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pending Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Orders awaiting confirmation or payment</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search pending orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-8 h-8 text-yellow-600" />
                      </div>
                      <p className="text-gray-500">No pending orders</p>
                      <p className="text-sm text-gray-400">All orders are processed</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">#{order.orderNumber || order._id.slice(-8)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{order.customer?.name || 'Guest'}</span>
                        <span className="text-xs text-gray-500">{order.customer?.email || order.shippingAddress?.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="relative w-8 h-8 rounded border border-gray-200 overflow-hidden">
                            {item.images?.thumbnail ? (
                              <Image
                                src={item.images.thumbnail}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-[8px] text-gray-400">N/A</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <span className="text-xs text-gray-500">+{order.items.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">
                        Tk {order.total?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateOrderStatus(order._id, 'processing')}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          title="Mark as Processing"
                        >
                          Process
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order._id, 'cancelled')}
                          className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          title="Cancel Order"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
