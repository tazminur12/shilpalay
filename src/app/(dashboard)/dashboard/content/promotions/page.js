"use client";

import { Plus, Edit, Trash2, Search, X, Upload, Image as ImageIcon, Calendar } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import Image from 'next/image';

export default function PromotionalSectionsPage() {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    buttonText: 'Shop Now',
    buttonLink: '#',
    sectionType: 'banner',
    position: 'homepage',
    category: '',
    displayOrder: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Active',
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);

  const sectionTypes = [
    { value: 'banner', label: 'Banner' },
    { value: 'two-column', label: 'Two Column' },
    { value: 'full-width', label: 'Full Width' },
    { value: 'sidebar', label: 'Sidebar' },
  ];

  const positions = [
    { value: 'homepage', label: 'Homepage' },
    { value: 'category', label: 'Category Page' },
    { value: 'product', label: 'Product Page' },
    { value: 'cart', label: 'Cart Page' },
    { value: 'checkout', label: 'Checkout Page' },
    { value: 'global', label: 'Global (All Pages)' },
  ];

  useEffect(() => {
    fetchSections();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.filter(cat => cat.status === 'Active'));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/promotional-sections');
      if (res.ok) {
        const data = await res.json();
        setSections(Array.isArray(data) ? data : []);
      } else {
        setSections([]);
      }
    } catch (error) {
      console.error('Error fetching promotional sections:', error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', 'Image size should be less than 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image: data.url }));
        setImagePreview(data.url);
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (section) => {
    setEditingId(section._id);
    setFormData({
      title: section.title || '',
      description: section.description || '',
      image: section.image || '',
      buttonText: section.buttonText || 'Shop Now',
      buttonLink: section.buttonLink || '#',
      sectionType: section.sectionType || 'banner',
      position: section.position || 'homepage',
      category: section.category?._id || section.category || '',
      displayOrder: section.displayOrder || 0,
      startDate: section.startDate ? new Date(section.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: section.endDate ? new Date(section.endDate).toISOString().split('T')[0] : '',
      status: section.status || 'Active',
    });
    setImagePreview(section.image || '');
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
        const res = await fetch(`/api/promotional-sections/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          Swal.fire('Deleted!', 'Promotional section has been deleted.', 'success');
          fetchSections();
        } else {
          const error = await res.json();
          throw new Error(error.message || 'Failed to delete');
        }
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to delete section', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.image) {
      Swal.fire('Error', 'Please fill in all required fields', 'error');
      return;
    }

    try {
      const url = editingId ? `/api/promotional-sections/${editingId}` : '/api/promotional-sections';
      const method = editingId ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        category: formData.category || null,
        endDate: formData.endDate || null,
        displayOrder: parseInt(formData.displayOrder) || 0,
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        Swal.fire('Success', `Promotional section ${editingId ? 'updated' : 'created'} successfully`, 'success');
        fetchSections();
        setShowModal(false);
        handleNew();
      } else {
        const error = await res.json();
        throw new Error(error.message || `Failed to ${editingId ? 'update' : 'create'} section`);
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      buttonText: 'Shop Now',
      buttonLink: '#',
      sectionType: 'banner',
      position: 'homepage',
      category: '',
      displayOrder: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Active',
    });
    setImagePreview('');
  };

  const filteredSections = sections.filter(section => {
    const matchesSearch = 
      section.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || section.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getSectionTypeLabel = (type) => {
    const section = sectionTypes.find(t => t.value === type);
    return section ? section.label : type;
  };

  const getPositionLabel = (position) => {
    const pos = positions.find(p => p.value === position);
    return pos ? pos.label : position;
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading promotional sections...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Promotional Sections</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotional banners and sections</p>
        </div>
        <button
          onClick={() => {
            handleNew();
            setShowModal(true);
          }}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Section
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSections.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No promotional sections found. Create one to get started.
                </td>
              </tr>
            ) : (
              filteredSections.map((section) => (
                <tr key={section._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {section.image ? (
                      <div className="relative w-16 h-16 rounded overflow-hidden">
                        <Image
                          src={section.image}
                          alt={section.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{section.title}</div>
                    {section.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{section.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getSectionTypeLabel(section.sectionType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getPositionLabel(section.position)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      section.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {section.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(section._id)}
                        className="text-red-600 hover:text-red-900"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Promotional Section' : 'New Promotional Section'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section Type</label>
                    <select
                      name="sectionType"
                      value={formData.sectionType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      {sectionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Optional description"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image <span className="text-red-500">*</span>
                  </label>
                  {imagePreview ? (
                    <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image: '' }));
                          setImagePreview('');
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-black transition-colors"
                    >
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload image</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  />
                  {uploading && (
                    <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                  )}
                </div>

                {/* Button Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                    <input
                      type="text"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                    <input
                      type="text"
                      name="buttonLink"
                      value={formData.buttonLink}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="/category/women"
                    />
                  </div>
                </div>

                {/* Position & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      {positions.map((pos) => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.position === 'category' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Display Order & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
