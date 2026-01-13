"use client";

import { Plus, Edit, Trash2, Save, X, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Link from 'next/link';
import RichTextEditor from '@/app/components/RichTextEditor';

export default function StaticPagesPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    pageType: 'about',
    content: '',
    metaTitle: '',
    metaDescription: '',
    status: 'Active',
  });
  const [editingId, setEditingId] = useState(null);

  const pageTypes = [
    { value: 'about', label: 'About Us' },
    { value: 'privacy', label: 'Privacy Policy' },
    { value: 'terms', label: 'Terms & Conditions' },
    { value: 'shipping', label: 'Shipping Policy' },
    { value: 'returns', label: 'Returns & Exchanges' },
    { value: 'faq', label: 'FAQ' },
    { value: 'contact', label: 'Contact Us' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/static-pages');
      const data = await res.json();
      setPages(data);
    } catch (error) {
      console.error('Error fetching static pages:', error);
      Swal.fire('Error', 'Failed to fetch pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from title
    if (name === 'title' && !editingId) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleEdit = (page) => {
    setEditingId(page._id);
    setFormData({
      title: page.title || '',
      slug: page.slug || '',
      pageType: page.pageType || 'about',
      content: page.content || '',
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      status: page.status || 'Active',
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
        const res = await fetch(`/api/static-pages/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          Swal.fire('Deleted!', 'Page has been deleted.', 'success');
          fetchPages();
        } else {
          const error = await res.json();
          throw new Error(error.message || 'Failed to delete');
        }
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to delete page', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.content) {
      Swal.fire('Error', 'Please fill in all required fields', 'error');
      return;
    }

    try {
      const url = editingId ? `/api/static-pages/${editingId}` : '/api/static-pages';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        Swal.fire('Success', `Page ${editingId ? 'updated' : 'created'} successfully`, 'success');
        fetchPages();
        setShowModal(false);
        handleNew();
      } else {
        const error = await res.json();
        throw new Error(error.message || `Failed to ${editingId ? 'update' : 'create'} page`);
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      pageType: 'about',
      content: '',
      metaTitle: '',
      metaDescription: '',
      status: 'Active',
    });
  };

  const getPageTypeLabel = (pageType) => {
    const type = pageTypes.find(t => t.value === pageType);
    return type ? type.label : pageType;
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading pages...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Static Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage About, Policies, and other static pages</p>
        </div>
        <button
          onClick={() => {
            handleNew();
            setShowModal(true);
          }}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No pages found. Create one to get started.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {page.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getPageTypeLabel(page.pageType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{page.slug}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      page.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/pages/${page.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-900"
                        title="View Page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleEdit(page)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page._id)}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Page' : 'New Page'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="pageType"
                      value={formData.pageType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    >
                      {pageTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                    required
                    placeholder="about-us"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (e.g., about-us, privacy-policy)</p>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="Enter page content..."
                  />
                </div>

                {/* SEO */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">SEO Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                      <input
                        type="text"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="SEO title for search engines"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                      <textarea
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="SEO description for search engines"
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
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
                  <Save className="w-4 h-4" />
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
