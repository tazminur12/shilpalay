"use client";

import { Plus, Edit, Trash2, Search, Filter, Zap, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function FlashSalesPage() {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'percent',
    discountValue: 0,
    productIds: [],
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    enabled: true
  });

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const fetchFlashSales = async () => {
    try {
      const res = await fetch('/api/admin/offers/flash-sales');
      if (res.ok) {
        const data = await res.json();
        setFlashSales(Array.isArray(data) ? data : []);
      } else {
        setFlashSales([]);
      }
    } catch (error) {
      console.error('Error fetching flash sales:', error);
      setFlashSales([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFlashSales = flashSales.filter(sale => {
    const matchesSearch = 
      sale.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const startDateTime = new Date(`${sale.startDate}T${sale.startTime}`);
    const endDateTime = new Date(`${sale.endDate}T${sale.endTime}`);
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = now >= startDateTime && now <= endDateTime && sale.enabled;
    } else if (statusFilter === 'upcoming') {
      matchesStatus = now < startDateTime && sale.enabled;
    } else if (statusFilter === 'ended') {
      matchesStatus = now > endDateTime;
    } else if (statusFilter === 'disabled') {
      matchesStatus = !sale.enabled;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setEditingSale(null);
    setFormData({
      name: '',
      description: '',
      discountType: 'percent',
      discountValue: 0,
      productIds: [],
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      enabled: true
    });
    setShowAddModal(true);
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    const startTime = sale.startTime || '';
    const endTime = sale.endTime || '';
    setFormData({
      name: sale.name,
      description: sale.description || '',
      discountType: sale.discountType || 'percent',
      discountValue: sale.discountValue || 0,
      productIds: sale.productIds || [],
      startDate: sale.startDate ? new Date(sale.startDate).toISOString().split('T')[0] : '',
      endDate: sale.endDate ? new Date(sale.endDate).toISOString().split('T')[0] : '',
      startTime: startTime.substring(0, 5),
      endTime: endTime.substring(0, 5),
      enabled: sale.enabled !== undefined ? sale.enabled : true
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      Swal.fire('Error', 'Flash sale name is required', 'error');
      return;
    }

    if (formData.discountValue <= 0) {
      Swal.fire('Error', 'Discount value must be greater than 0', 'error');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      Swal.fire('Error', 'Start and end dates are required', 'error');
      return;
    }

    try {
      const url = editingSale 
        ? `/api/admin/offers/flash-sales/${editingSale._id}`
        : '/api/admin/offers/flash-sales';
      const method = editingSale ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const result = await res.json();
        Swal.fire('Success', result.message || 'Flash sale saved successfully', 'success');
        fetchFlashSales();
        setShowAddModal(false);
      } else {
        const error = await res.json();
        Swal.fire('Error', error.message || 'Failed to save flash sale', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to save flash sale', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Flash Sale?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/offers/flash-sales/${id}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          Swal.fire('Deleted!', 'Flash sale has been deleted.', 'success');
          fetchFlashSales();
        } else {
          Swal.fire('Error', 'Failed to delete flash sale', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete flash sale', 'error');
      }
    }
  };

  const toggleEnabled = async (sale) => {
    try {
      const res = await fetch(`/api/admin/offers/flash-sales/${sale._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !sale.enabled })
      });
      
      if (res.ok) {
        fetchFlashSales();
      } else {
        Swal.fire('Error', 'Failed to update flash sale', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to update flash sale', 'error');
    }
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'N/A';
    const dateObj = new Date(`${date}T${time || '00:00'}`);
    return dateObj.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSaleStatus = (sale) => {
    const now = new Date();
    const startDateTime = new Date(`${sale.startDate}T${sale.startTime || '00:00'}`);
    const endDateTime = new Date(`${sale.endDate}T${sale.endTime || '23:59'}`);
    
    if (!sale.enabled) return { text: 'Disabled', color: 'bg-gray-100 text-gray-800' };
    if (now < startDateTime) return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    if (now > endDateTime) return { text: 'Ended', color: 'bg-red-100 text-red-800' };
    return { text: 'Active', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Flash Sales</h1>
          <p className="text-sm text-gray-500 mt-1">Create time-limited flash sale campaigns</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Flash Sale
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search flash sales..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="ended">Ended</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flash Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading flash sales...</td></tr>
              ) : filteredFlashSales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Zap className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No flash sales found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFlashSales.map((sale) => {
                  const status = getSaleStatus(sale);
                  return (
                    <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{sale.name}</p>
                          {sale.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{sale.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">
                          {sale.discountType === 'percent' 
                            ? `${sale.discountValue}%` 
                            : `Tk ${sale.discountValue.toFixed(2)}`}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-700">
                          {sale.productIds?.length || 0} products
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        <div className="flex flex-col">
                          <span>{formatDateTime(sale.startDate, sale.startTime)}</span>
                          <span className="text-xs text-gray-500">to {formatDateTime(sale.endDate, sale.endTime)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.text}
                          </span>
                          <button
                            onClick={() => toggleEnabled(sale)}
                            className={`p-1 rounded transition-colors ${
                              sale.enabled 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            {sale.enabled ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(sale)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(sale._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingSale ? 'Edit Flash Sale' : 'Add Flash Sale'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Flash Sale Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  placeholder="Midnight Flash Sale"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  rows="2"
                  placeholder="Flash sale description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Tk)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Select Products
                </label>
                <p className="text-xs text-gray-500 mb-2">Product selection will be implemented with API</p>
                <div className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-50">
                  Select products (Coming soon)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="text-sm text-gray-700">
                  Enable this flash sale
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
              >
                {editingSale ? 'Update' : 'Add'} Flash Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
