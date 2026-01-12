"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Package, RefreshCw, CheckCircle, XCircle, Clock, ArrowRight, Plus, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function ReturnsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    if (session) {
      fetchReturns();
    }
  }, [session, statusFilter, typeFilter]);

  const fetchReturns = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      
      const res = await fetch(`/api/returns/my-returns?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReturns(Array.isArray(data) ? data : []);
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem('orders');
        if (stored) {
          const ordersData = JSON.parse(stored);
          const userReturns = ordersData.filter(order => 
            (order.customer?._id === session?.user?.id || 
             order.customer?.email === session?.user?.email) &&
            (order.returnStatus || order.status === 'returned')
          );
          setReturns(userReturns);
        } else {
          setReturns([]);
        }
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem('orders');
      if (stored) {
        const ordersData = JSON.parse(stored);
        const userReturns = ordersData.filter(order => 
          (order.customer?._id === session?.user?.id || 
           order.customer?.email === session?.user?.email) &&
          (order.returnStatus || order.status === 'returned')
        );
        setReturns(userReturns);
      } else {
        setReturns([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = returns.filter(returnOrder => {
    const matchesSearch = 
      returnOrder.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnOrder.items?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
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

  const getReturnStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
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
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelReturn = async (returnId) => {
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
          fetchReturns();
        } else {
          Swal.fire('Error', 'Failed to cancel return request', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to cancel return request', 'error');
      }
    }
  };

  const handleNewReturn = () => {
    router.push('/my-account/order-history');
  };

  if (!session) {
    router.push('/login?redirect=/my-account/returns');
    return null;
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
            RETURNS & EXCHANGES
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

          {/* Main Content - Returns */}
          <div className="flex-1 max-w-4xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Returns & Exchanges</h2>
                <button
                  onClick={handleNewReturn}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm uppercase tracking-widest font-medium hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Return
                </button>
              </div>
              
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search by order number or product name..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-4 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black appearance-none bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
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
            </div>
            
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading returns...</div>
            ) : filteredReturns.length === 0 ? (
              <div className="border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-gray-400 min-h-[300px]">
                <RefreshCw className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No returns found</p>
                <p className="text-sm mb-6">You haven't requested any returns or exchanges yet</p>
                <button
                  onClick={handleNewReturn}
                  className="flex items-center gap-2 bg-black text-white px-6 py-2.5 text-sm uppercase tracking-widest font-medium hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Request a Return
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReturns.map((returnOrder) => (
                  <div 
                    key={returnOrder._id} 
                    className="border border-gray-200 rounded-lg p-6 hover:border-black transition-colors"
                  >
                    {/* Return Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-lg text-gray-900">
                            Order #{returnOrder.orderNumber || returnOrder._id.slice(-8)}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getReturnTypeColor(returnOrder.returnType)}`}>
                            {returnOrder.returnType || 'return'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getReturnStatusColor(returnOrder.returnStatus)}`}>
                            {getReturnStatusIcon(returnOrder.returnStatus)}
                            {returnOrder.returnStatus || 'pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Requested on {formatDate(returnOrder.updatedAt || returnOrder.createdAt)}
                        </p>
                      </div>
                      <div className="mt-3 md:mt-0 text-right">
                        <p className="text-lg font-bold text-gray-900">
                          Tk {returnOrder.total?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {returnOrder.items?.length || 0} {returnOrder.items?.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>

                    {/* Return Items */}
                    <div className="space-y-3 mb-4">
                      {returnOrder.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
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
                            {item.selectedVariation && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {item.selectedVariation.color && `Color: ${item.selectedVariation.color}`}
                                {item.selectedVariation.size && ` | Size: ${item.selectedVariation.size}`}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm">
                              Tk {((item.price?.salePrice || item.price?.regularPrice || 0) * (item.quantity || 1)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {returnOrder.items?.length > 3 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          +{returnOrder.items.length - 3} more items
                        </p>
                      )}
                    </div>

                    {/* Return Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/my-account/returns/${returnOrder._id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                      <div className="flex items-center gap-3">
                        {returnOrder.returnStatus === 'pending' && (
                          <button
                            onClick={() => handleCancelReturn(returnOrder._id)}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Cancel Request
                          </button>
                        )}
                        {returnOrder.returnStatus === 'approved' && (
                          <span className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg">
                            Processing Return
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
