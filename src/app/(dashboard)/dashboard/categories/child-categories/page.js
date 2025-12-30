"use client";

import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function ChildCategoryPage() {
  const [childCategories, setChildCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', subCategory: '', slug: '', status: 'Active' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchChildCategories();
    fetchSubCategories();
  }, []);

  const fetchChildCategories = async () => {
    try {
      const res = await fetch('/api/child-categories');
      const data = await res.json();
      setChildCategories(data);
    } catch (error) {
      console.error('Error fetching child categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await fetch('/api/sub-categories');
      const data = await res.json();
      setSubCategories(data);
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newData = { ...prev, [name]: value };
        if (name === 'name') {
            newData.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }
        return newData;
    });
  };

  const handleEdit = (child) => {
    setEditingId(child._id);
    setFormData({
        name: child.name,
        subCategory: child.subCategory?._id || '',
        slug: child.slug,
        status: child.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/child-categories/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          Swal.fire('Deleted!', 'Child Category has been deleted.', 'success');
          fetchChildCategories();
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete child category', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/child-categories/${editingId}` : '/api/child-categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        Swal.fire('Success', `Child Category ${editingId ? 'updated' : 'created'} successfully`, 'success');
        fetchChildCategories();
        setShowModal(false);
        setFormData({ name: '', subCategory: '', slug: '', status: 'Active' });
        setEditingId(null);
      } else {
        throw new Error(`Failed to ${editingId ? 'update' : 'create'} child category`);
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', subCategory: '', slug: '', status: 'Active' });
    setEditingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Child Category Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product child categories (items)</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Child Category
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">{editingId ? 'Edit Child Category' : 'Add New Child Category'}</h3>
                    <button onClick={closeModal}><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Sub Category</label>
                        <select 
                            name="subCategory"
                            value={formData.subCategory}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-black bg-white"
                        >
                            <option value="">Select Sub Category</option>
                            {subCategories.map(sub => (
                                <option key={sub._id} value={sub._id}>
                                    {sub.category?.name ? `${sub.category.name} > ${sub.name}` : sub.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input 
                            type="text" 
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-black bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select 
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-black"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <button className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                        {editingId ? 'Update Child Category' : 'Create Child Category'}
                    </button>
                </form>
            </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="relative w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                    type="text" 
                    placeholder="Search child categories..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sub Category</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                  <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
              ) : childCategories.map((child) => (
                <tr key={child._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">{child.name}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {child.subCategory?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {child.slug}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        child.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {child.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(child)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(child._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
