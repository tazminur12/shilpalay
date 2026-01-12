"use client";

import { Plus, Edit, Trash2, Search, CreditCard, Wallet, CheckCircle, XCircle, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'card',
    enabled: true,
    credentials: {},
    description: '',
    fees: {
      percentage: 0,
      fixed: 0
    }
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const res = await fetch('/api/admin/payments/methods');
      // if (res.ok) {
      //   const data = await res.json();
      //   setPaymentMethods(Array.isArray(data) ? data : []);
      // }
      
      // Default payment methods
      const defaultMethods = [
        {
          _id: '1',
          name: 'Debit/Credit Card',
          type: 'card',
          enabled: true,
          description: 'Accept payments via debit and credit cards',
          fees: { percentage: 2.5, fixed: 0 },
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'bKash',
          type: 'bkash',
          enabled: true,
          description: 'Mobile banking payment via bKash',
          fees: { percentage: 1.5, fixed: 0 },
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          name: 'Cash on Delivery',
          type: 'cod',
          enabled: true,
          description: 'Pay when you receive the order',
          fees: { percentage: 0, fixed: 0 },
          createdAt: new Date().toISOString()
        }
      ];
      setPaymentMethods(defaultMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMethods = paymentMethods.filter(method =>
    method.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    method.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      type: 'card',
      enabled: true,
      credentials: {},
      description: '',
      fees: { percentage: 0, fixed: 0 }
    });
    setShowAddModal(true);
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      enabled: method.enabled,
      credentials: method.credentials || {},
      description: method.description || '',
      fees: method.fees || { percentage: 0, fixed: 0 }
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      Swal.fire('Error', 'Payment method name is required', 'error');
      return;
    }

    try {
      // TODO: Replace with actual API endpoint
      // const res = editingMethod
      //   ? await fetch(`/api/admin/payments/methods/${editingMethod._id}`, {
      //       method: 'PUT',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify(formData)
      //     })
      //   : await fetch('/api/admin/payments/methods', {
      //       method: 'POST',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify(formData)
      //     });

      if (editingMethod) {
        setPaymentMethods(methods =>
          methods.map(m => m._id === editingMethod._id ? { ...m, ...formData } : m)
        );
        Swal.fire('Success', 'Payment method updated successfully', 'success');
      } else {
        const newMethod = {
          _id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString()
        };
        setPaymentMethods([...paymentMethods, newMethod]);
        Swal.fire('Success', 'Payment method added successfully', 'success');
      }
      setShowAddModal(false);
    } catch (error) {
      Swal.fire('Error', 'Failed to save payment method', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Payment Method?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        // TODO: API call to delete
        setPaymentMethods(methods => methods.filter(m => m._id !== id));
        Swal.fire('Deleted!', 'Payment method has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to delete payment method', 'error');
      }
    }
  };

  const toggleEnabled = async (method) => {
    try {
      // TODO: API call to toggle
      setPaymentMethods(methods =>
        methods.map(m => m._id === method._id ? { ...m, enabled: !m.enabled } : m)
      );
    } catch (error) {
      Swal.fire('Error', 'Failed to update payment method', 'error');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'bkash':
        return <Wallet className="w-5 h-5" />;
      case 'cod':
        return <Wallet className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Methods</h1>
          <p className="text-sm text-gray-500 mt-1">Configure and manage payment methods</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Method
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search payment methods..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading...</div>
        ) : filteredMethods.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No payment methods found</p>
            </div>
          </div>
        ) : (
          filteredMethods.map((method) => (
            <div key={method._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    method.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {getTypeIcon(method.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{method.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{method.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleEnabled(method)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    method.enabled 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={method.enabled ? 'Disable' : 'Enable'}
                >
                  {method.enabled ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{method.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Processing Fee</span>
                  <span className="font-medium text-gray-900">
                    {method.fees?.percentage > 0 && `${method.fees.percentage}%`}
                    {method.fees?.percentage > 0 && method.fees?.fixed > 0 && ' + '}
                    {method.fees?.fixed > 0 && `Tk ${method.fees.fixed.toFixed(2)}`}
                    {!method.fees?.percentage && !method.fees?.fixed && 'Free'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(method)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(method._id)}
                  className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  placeholder="e.g., Debit/Credit Card"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                >
                  <option value="card">Card</option>
                  <option value="bkash">bKash</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  rows="3"
                  placeholder="Payment method description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Fee Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fees.percentage}
                    onChange={(e) => setFormData({
                      ...formData,
                      fees: { ...formData.fees, percentage: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Fixed Fee (Tk)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fees.fixed}
                    onChange={(e) => setFormData({
                      ...formData,
                      fees: { ...formData.fees, fixed: parseFloat(e.target.value) || 0 }
                    })}
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
                  Enable this payment method
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
                {editingMethod ? 'Update' : 'Add'} Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
