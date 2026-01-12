"use client";

import { Search, Filter, Download, Box, AlertTriangle, CheckCircle, XCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';

export default function InventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/inventory/stats');
      if (res.ok) {
        const stats = await res.json();
        // Stats will be calculated from products, but we can use this for real-time updates
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (stockFilter !== 'all') params.append('stockFilter', stockFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, stockFilter, categoryFilter]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const stock = product.inventory?.totalStock || 0;
    const lowStockAlert = product.inventory?.lowStockAlert || 10;
    
    let matchesStock = true;
    if (stockFilter === 'in_stock') {
      matchesStock = stock > 0;
    } else if (stockFilter === 'low_stock') {
      matchesStock = stock > 0 && stock <= lowStockAlert;
    } else if (stockFilter === 'out_of_stock') {
      matchesStock = stock === 0;
    }
    
    const matchesCategory = categoryFilter === 'all' || product.category?._id === categoryFilter;
    
    return matchesSearch && matchesStock && matchesCategory;
  });

  const updateStock = async (productId, newStock) => {
    try {
      const res = await fetch(`/api/admin/inventory/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalStock: newStock
        })
      });

      if (res.ok) {
        const result = await res.json();
        Swal.fire('Success', result.message || 'Stock updated successfully', 'success');
        fetchProducts();
      } else {
        const error = await res.json();
        Swal.fire('Error', error.message || 'Failed to update stock', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to update stock', 'error');
    }
  };

  const handleStockUpdate = (productId, currentStock) => {
    Swal.fire({
      title: 'Update Stock',
      html: `
        <input id="stock-input" type="number" min="0" value="${currentStock}" class="swal2-input" placeholder="Enter stock quantity">
      `,
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      preConfirm: () => {
        const stockInput = document.getElementById('stock-input');
        const newStock = parseInt(stockInput.value);
        if (isNaN(newStock) || newStock < 0) {
          Swal.showValidationMessage('Please enter a valid stock quantity');
          return false;
        }
        return newStock;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        updateStock(productId, result.value);
      }
    });
  };

  const getStockStatus = (stock, lowStockAlert) => {
    if (stock === 0) {
      return { text: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: XCircle };
    } else if (stock <= lowStockAlert) {
      return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    } else {
      return { text: 'In Stock', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
  };

  const totalProducts = filteredProducts.length;
  const inStockProducts = filteredProducts.filter(p => (p.inventory?.totalStock || 0) > 0).length;
  const lowStockProducts = filteredProducts.filter(p => {
    const stock = p.inventory?.totalStock || 0;
    const alert = p.inventory?.lowStockAlert || 10;
    return stock > 0 && stock <= alert;
  }).length;
  const outOfStockProducts = filteredProducts.filter(p => (p.inventory?.totalStock || 0) === 0).length;
  const totalStockValue = filteredProducts.reduce((sum, p) => {
    const stock = p.inventory?.totalStock || 0;
    const price = p.price?.regularPrice || 0;
    return sum + (stock * price);
  }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage product stock levels</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Box className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">In Stock</p>
              <p className="text-2xl font-bold text-green-600">{inStockProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockProducts}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">Tk {totalStockValue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by product name or SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black appearance-none bg-white"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Low Stock Alert</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Value</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading inventory...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Box className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No products found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stock = product.inventory?.totalStock || 0;
                  const lowStockAlert = product.inventory?.lowStockAlert || 10;
                  const stockStatus = getStockStatus(stock, lowStockAlert);
                  const StatusIcon = stockStatus.icon;
                  const stockValue = stock * (product.price?.regularPrice || 0);

                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {product.images?.thumbnail ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                              <Image
                                src={product.images.thumbnail}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                              <Box className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category?.name || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-700 font-mono">{product.sku}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">{stock}</span>
                        <span className="text-xs text-gray-500 ml-1">units</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-700">{lowStockAlert}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">Tk {stockValue.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleStockUpdate(product._id, stock)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Update Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
