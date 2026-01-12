"use client";

import { Plus, Edit, Trash2, Search, Tag, CheckCircle, XCircle, Palette, Ruler } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function AttributesPage() {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'select',
    values: [],
    newValue: '',
    enabled: true
  });

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const res = await fetch('/api/admin/attributes');
      // if (res.ok) {
      //   const data = await res.json();
      //   setAttributes(Array.isArray(data) ? data : []);
      // }
      
      // Mock data
      const mockAttributes = [
        {
          _id: '1',
          name: 'Color',
          slug: 'color',
          type: 'select',
          values: ['Red', 'Blue', 'Green', 'Black', 'White'],
          enabled: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Size',
          slug: 'size',
          type: 'select',
          values: ['S', 'M', 'L', 'XL', 'XXL'],
          enabled: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          name: 'Material',
          slug: 'material',
          type: 'select',
          values: ['Cotton', 'Polyester', 'Silk', 'Wool'],
          enabled: true,
          createdAt: new Date().toISOString()
        }
      ];
      setAttributes(mockAttributes);
    } catch (error) {
      console.error('Error fetching attributes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttributes = attributes.filter(attr => {
    const matchesSearch = 
      attr.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attr.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || attr.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleAdd = () => {
    setEditingAttribute(null);
    setFormData({
      name: '',
      slug: '',
      type: 'select',
      values: [],
      newValue: '',
      enabled: true
    });
    setShowAddModal(true);
  };

  const handleEdit = (attribute) => {
    setEditingAttribute(attribute);
    setFormData({
      name: attribute.name,
      slug: attribute.slug,
      type: attribute.type || 'select',
      values: [...(attribute.values || [])],
      newValue: '',
      enabled: attribute.enabled !== undefined ? attribute.enabled : true
    });
    setShowAddModal(true);
  };

  const handleAddValue = () => {
    if (formData.newValue.trim()) {
      setFormData({
        ...formData,
        values: [...formData.values, formData.newValue.trim()],
        newValue: ''
      });
    }
  };

  const handleRemoveValue = (index) => {
    setFormData({
      ...formData,
      values: formData.values.filter((_, i) => i !== index)
    });
  };

  const handleSave = async () => {
    if (!formData.name) {
      Swal.fire('Error', 'Attribute name is required', 'error');
      return;
    }

    if (formData.values.length === 0) {
      Swal.fire('Error', 'At least one attribute value is required', 'error');
      return;
    }

    try {
      // TODO: API call
      if (editingAttribute) {
        setAttributes(attributes =>
          attributes.map(a => a._id === editingAttribute._id ? { ...a, ...formData } : a)
        );
        Swal.fire('Success', 'Attribute updated successfully', 'success');
      } else {
        const newAttribute = {
          _id: Date.now().toString(),
          ...formData,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
          createdAt: new Date().toISOString()
        };
        setAttributes([...attributes, newAttribute]);
        Swal.fire('Success', 'Attribute added successfully', 'success');
      }
      setShowAddModal(false);
    } catch (error) {
      Swal.fire('Error', 'Failed to save attribute', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Attribute?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        // TODO: API call
        setAttributes(attributes => attributes.filter(a => a._id !== id));
        Swal.fire('Deleted!', 'Attribute has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to delete attribute', 'error');
      }
    }
  };

  const toggleEnabled = async (attribute) => {
    try {
      // TODO: API call
      setAttributes(attributes =>
        attributes.map(a => a._id === attribute._id ? { ...a, enabled: !a.enabled } : a)
      );
    } catch (error) {
      Swal.fire('Error', 'Failed to update attribute', 'error');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'color':
        return <Palette className="w-5 h-5" />;
      case 'size':
        return <Ruler className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attributes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product attributes like color, size, material, etc.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Attribute
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search attributes..." 
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
              <option value="select">Select</option>
              <option value="color">Color</option>
              <option value="size">Size</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attributes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Attribute</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Values</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Count</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading attributes...</td></tr>
              ) : filteredAttributes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Tag className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No attributes found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAttributes.map((attribute) => (
                  <tr key={attribute._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getTypeIcon(attribute.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{attribute.name}</p>
                          <p className="text-xs text-gray-500">{attribute.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700 capitalize">{attribute.type || 'select'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {attribute.values?.slice(0, 3).map((value, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {value}
                          </span>
                        ))}
                        {attribute.values?.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            +{attribute.values.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900">{attribute.values?.length || 0}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          attribute.enabled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {attribute.enabled ? 'Active' : 'Disabled'}
                        </span>
                        <button
                          onClick={() => toggleEnabled(attribute)}
                          className={`p-1 rounded transition-colors ${
                            attribute.enabled 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {attribute.enabled ? (
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
                          onClick={() => handleEdit(attribute)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(attribute._id)}
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
                {editingAttribute ? 'Edit Attribute' : 'Add Attribute'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Attribute Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      name: e.target.value,
                      slug: formData.slug || e.target.value.toLowerCase().replace(/\s+/g, '-')
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    placeholder="e.g., Color, Size"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    placeholder="color, size"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                >
                  <option value="select">Select</option>
                  <option value="color">Color</option>
                  <option value="size">Size</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Attribute Values <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.newValue}
                    onChange={(e) => setFormData({ ...formData, newValue: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddValue())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    placeholder="Enter value and press Enter or click Add"
                  />
                  <button
                    type="button"
                    onClick={handleAddValue}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {formData.values.length === 0 ? (
                    <p className="text-sm text-gray-400 w-full">No values added yet</p>
                  ) : (
                    formData.values.map((value, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700"
                      >
                        {value}
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(index)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
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
                  Enable this attribute
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
                {editingAttribute ? 'Update' : 'Add'} Attribute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
