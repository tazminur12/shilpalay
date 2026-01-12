"use client";

import { Eye, Search, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';

export default function ReturnsOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const res = await fetch('/api/admin/orders?status=returned');
      // if (res.ok) {
      //   const data = await res.json();
      //   setOrders(Array.isArray(data) ? data : []);
      // }
      
      // For now, get orders from localStorage
      const stored = localStorage.getItem('orders');
      if (stored) {
        const ordersData = JSON.parse(stored);
        const allOrders = Array.isArray(ordersData) ? ordersData : [];
        setOrders(allOrders.filter(order => order.status === 'returned' || order.returnStatus));
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching returns/exchanges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || order.returnType === typeFilter;
    
    return matchesSearch && matchesType;
  });

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleApprove = async (orderId) => {
    const result = await Swal.fire({
      title: 'Approve Return/Exchange?',
      text: 'This action will approve the return/exchange request',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve'
    });

    if (result.isConfirmed) {
      // TODO: API call to approve return/exchange
      Swal.fire('Approved', 'Return/Exchange request has been approved', 'success');
      fetchOrders();
    }
  };

  const handleReject = async (orderId) => {
    const result = await Swal.fire({
      title: 'Reject Return/Exchange?',
      text: 'This action will reject the return/exchange request',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject'
    });

    if (result.isConfirmed) {
      // TODO: API call to reject return/exchange
      Swal.fire('Rejected', 'Return/Exchange request has been rejected', 'info');
      fetchOrders();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Returns / Exchanges</h1>
          <p className="text-sm text-gray-500 mt-1">Manage return and exchange requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search returns/exchanges..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-4 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="return">Return</option>
              <option value="exchange">Exchange</option>
            </select>
          </div>
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
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
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
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-purple-600" />
                      </div>
                      <p className="text-gray-500">No returns or exchanges</p>
                      <p className="text-sm text-gray-400">Return/exchange requests will appear here</p>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.returnType === 'exchange' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {order.returnType || 'return'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {order.items?.slice(0, 2).map((item, idx) => (
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
                        {order.items?.length > 2 && (
                          <span className="text-xs text-gray-500">+{order.items.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {formatDate(order.requestedAt || order.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReturnStatusColor(order.returnStatus)}`}>
                        {order.returnStatus || 'pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.returnStatus === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(order._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleReject(order._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
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
