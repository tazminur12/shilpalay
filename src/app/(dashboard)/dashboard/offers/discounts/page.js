"use client";

import { Plus, Edit, Trash2, Search, Filter, Percent, CheckCircle, XCircle, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'percent',
    discountValue: 0,
    applyTo: 'all',
    categoryIds: [],
    productIds: [],
    minPurchaseAmount: 0,
    startDate: '',
    endDate: '',
    enabled: true
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await fetch('/api/admin/offers/discounts');
      if (res.ok) {
        const data = await res.json();
        setDiscounts(Array.isArray(data) ? data : []);
      } else {
        setDiscounts([]);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = 
      discount.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || discount.discountType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleAdd = () => {
    setEditingDiscount(null);
    setFormData({
      name: '',
      description: '',
      discountType: 'percent',
      discountValue: 0,
      applyTo: 'all',
      categoryIds: [],
      productIds: [],
      minPurchaseAmount: 0,
      startDate: '',
      endDate: '',
      enabled: true
    });
    setShowAddModal(true);
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      description: discount.description || '',
      discountType: discount.discountType || 'percent',
      discountValue: discount.discountValue || 0,
      applyTo: discount.applyTo || 'all',
      categoryIds: discount.categoryIds || [],
      productIds: discount.productIds || [],
      minPurchaseAmount: discount.minPurchaseAmount || 0,
      startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
      endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
      enabled: discount.enabled !== undefined ? discount.enabled : true
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      Swal.fire('Error', 'Discount name is required', 'error');
      return;
    }

    if (formData.discountValue <= 0) {
      Swal.fire('Error', 'Discount value must be greater than 0', 'error');
      return;
    }

    try {
      const url = editingDiscount 
        ? `/api/admin/offers/discounts/${editingDiscount._id}`
        : '/api/admin/offers/discounts';
      const method = editingDiscount ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const result = await res.json();
        Swal.fire('Success', result.message || 'Discount saved successfully', 'success');
        fetchDiscounts();
        setShowAddModal(false);
      } else {
        const error = await res.json();
        Swal.fire('Error', error.message || 'Failed to save discount', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to save discount', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Discount?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/offers/discounts/${id}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          Swal.fire('Deleted!', 'Discount has been deleted.', 'success');
          fetchDiscounts();
        } else {
          Swal.fire('Error', 'Failed to delete discount', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete discount', 'error');
      }
    }
  };

  const toggleEnabled = async (discount) => {
    try {
      const res = await fetch(`/api/admin/offers/discounts/${discount._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !discount.enabled })
      });
      
      if (res.ok) {
        fetchDiscounts();
      } else {
        Swal.fire('Error', 'Failed to update discount', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to update discount', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Discounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product and category discounts</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Discount
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search discounts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applies To</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Validity</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading discounts...</td></tr>
              ) : filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Percent className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No discounts found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((discount) => (
                  <tr key={discount._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{discount.name}</p>
                        {discount.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{discount.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">
                        {discount.discountType === 'percent' 
                          ? `${discount.discountValue}%` 
                          : `Tk ${discount.discountValue.toFixed(2)}`}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700 capitalize">
                        {discount.applyTo === 'all' ? 'All Products' : 
                         discount.applyTo === 'category' ? `${discount.categoryIds?.length || 0} Categories` :
                         discount.applyTo === 'product' ? `${discount.productIds?.length || 0} Products` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span>{formatDate(discount.startDate)}</span>
                        <span className="text-xs text-gray-500">to {formatDate(discount.endDate)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          discount.enabled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {discount.enabled ? 'Active' : 'Disabled'}
                        </span>
                        <button
                          onClick={() => toggleEnabled(discount)}
                          className={`p-1 rounded transition-colors ${
                            discount.enabled 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {discount.enabled ? (
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
                          onClick={() => handleEdit(discount)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(discount._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingDiscount ? 'Edit Discount' : 'Add Discount'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Discount Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  placeholder="Summer Sale"
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
                  placeholder="Discount description..."
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
                  Apply To
                </label>
                <select
                  value={formData.applyTo}
                  onChange={(e) => setFormData({ ...formData, applyTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                >
                  <option value="all">All Products</option>
                  <option value="category">Specific Categories</option>
                  <option value="product">Specific Products</option>
                </select>
              </div>

              {formData.applyTo === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Select Categories
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Category selection will be implemented with API</p>
                  <div className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-50">
                    Select categories (Coming soon)
                  </div>
                </div>
              )}

              {formData.applyTo === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Select Products
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Product selection will be implemented with API</p>
                  <div className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-50">
                    Select products (Coming soon)
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Min Purchase Amount (Tk)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
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
                  Enable this discount
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
                {editingDiscount ? 'Update' : 'Add'} Discount
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
