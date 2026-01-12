"use client";

import { Plus, Edit, Trash2, Search, Users2, CheckCircle, XCircle, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function CustomerGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount: 0,
    minOrderAmount: 0,
    enabled: true,
    color: '#6366f1'
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const res = await fetch('/api/admin/customers/groups');
      // if (res.ok) {
      //   const data = await res.json();
      //   setGroups(Array.isArray(data) ? data : []);
      // }
      
      // Default customer groups
      const defaultGroups = [
        {
          _id: '1',
          name: 'Regular',
          description: 'Standard customers with no special benefits',
          discount: 0,
          minOrderAmount: 0,
          customerCount: 0,
          enabled: true,
          color: '#6b7280',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'VIP',
          description: 'VIP customers with exclusive discounts and benefits',
          discount: 10,
          minOrderAmount: 10000,
          customerCount: 0,
          enabled: true,
          color: '#9333ea',
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          name: 'Wholesale',
          description: 'Wholesale customers with bulk order discounts',
          discount: 15,
          minOrderAmount: 50000,
          customerCount: 0,
          enabled: true,
          color: '#2563eb',
          createdAt: new Date().toISOString()
        }
      ];
      setGroups(defaultGroups);
    } catch (error) {
      console.error('Error fetching customer groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      discount: 0,
      minOrderAmount: 0,
      enabled: true,
      color: '#6366f1'
    });
    setShowAddModal(true);
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      discount: group.discount || 0,
      minOrderAmount: group.minOrderAmount || 0,
      enabled: group.enabled !== undefined ? group.enabled : true,
      color: group.color || '#6366f1'
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      Swal.fire('Error', 'Group name is required', 'error');
      return;
    }

    try {
      // TODO: Replace with actual API endpoint
      // const res = editingGroup
      //   ? await fetch(`/api/admin/customers/groups/${editingGroup._id}`, {
      //       method: 'PUT',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify(formData)
      //     })
      //   : await fetch('/api/admin/customers/groups', {
      //       method: 'POST',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify(formData)
      //     });

      if (editingGroup) {
        setGroups(groups =>
          groups.map(g => g._id === editingGroup._id ? { ...g, ...formData } : g)
        );
        Swal.fire('Success', 'Customer group updated successfully', 'success');
      } else {
        const newGroup = {
          _id: Date.now().toString(),
          ...formData,
          customerCount: 0,
          createdAt: new Date().toISOString()
        };
        setGroups([...groups, newGroup]);
        Swal.fire('Success', 'Customer group added successfully', 'success');
      }
      setShowAddModal(false);
    } catch (error) {
      Swal.fire('Error', 'Failed to save customer group', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Customer Group?',
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
        setGroups(groups => groups.filter(g => g._id !== id));
        Swal.fire('Deleted!', 'Customer group has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to delete customer group', 'error');
      }
    }
  };

  const toggleEnabled = async (group) => {
    try {
      // TODO: API call to toggle
      setGroups(groups =>
        groups.map(g => g._id === group._id ? { ...g, enabled: !g.enabled } : g)
      );
    } catch (error) {
      Swal.fire('Error', 'Failed to update customer group', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Groups</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage customer groups with special benefits</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Group
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search customer groups..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Users2 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No customer groups found</p>
            </div>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${group.color}20`, color: group.color }}
                  >
                    <Users2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{group.name}</h3>
                    <p className="text-xs text-gray-500">{group.customerCount || 0} customers</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleEnabled(group)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    group.enabled 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={group.enabled ? 'Disable' : 'Enable'}
                >
                  {group.enabled ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{group.description}</p>
              
              <div className="space-y-2 mb-4">
                {group.discount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-green-600">{group.discount}%</span>
                  </div>
                )}
                {group.minOrderAmount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Min Order Amount</span>
                    <span className="font-medium text-gray-900">Tk {group.minOrderAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(group)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(group._id)}
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
                {editingGroup ? 'Edit Customer Group' : 'Add Customer Group'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  placeholder="e.g., VIP, Wholesale"
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
                  rows="3"
                  placeholder="Group description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Min Order Amount (Tk)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    placeholder="#6366f1"
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
                  Enable this customer group
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
                {editingGroup ? 'Update' : 'Add'} Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
