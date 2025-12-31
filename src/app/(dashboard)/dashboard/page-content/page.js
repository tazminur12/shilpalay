"use client";

import { Plus, Edit, Trash2, Save, X, Eye, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function PageContentPage() {
  const [pageContents, setPageContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    pageType: 'category',
    category: '',
    hero: {
      title: '',
      subtitle: '',
      image: '',
      buttonText: 'Shop Now',
      buttonLink: '#',
      enabled: true,
    },
    categoryGrid: {
      title: 'SHOP BY CATEGORY',
      enabled: true,
    },
    featuredCollections: {
      title: 'FEATURED COLLECTIONS',
      enabled: true,
      items: [],
    },
    recommended: {
      title: 'RECOMMENDED FOR YOU',
      enabled: true,
    },
    trending: {
      title: 'TRENDING',
      enabled: true,
    },
    promoBanner: {
      title: '',
      image: '',
      buttonText: 'Shop Now',
      buttonLink: '#',
      enabled: false,
    },
    twoColumnBanners: {
      enabled: true,
      items: [],
    },
    newsletter: {
      enabled: true,
      title: 'STAY TUNED',
      description: "Don't miss the opportunity to get daily updates on all that's new at Shilpalay.",
    },
    status: 'Active',
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('hero');

  useEffect(() => {
    fetchPageContents();
    fetchCategories();
  }, []);

  const fetchPageContents = async () => {
    try {
      const res = await fetch('/api/page-content');
      const data = await res.json();
      setPageContents(data);
    } catch (error) {
      console.error('Error fetching page contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleEdit = (pageContent) => {
    setEditingId(pageContent._id);
    setFormData({
      pageType: pageContent.pageType || 'category',
      category: pageContent.category?._id || '',
      hero: pageContent.hero || formData.hero,
      categoryGrid: pageContent.categoryGrid || formData.categoryGrid,
      featuredCollections: pageContent.featuredCollections || formData.featuredCollections,
      recommended: pageContent.recommended || formData.recommended,
      trending: pageContent.trending || formData.trending,
      promoBanner: pageContent.promoBanner || formData.promoBanner,
      twoColumnBanners: pageContent.twoColumnBanners || formData.twoColumnBanners,
      newsletter: pageContent.newsletter || formData.newsletter,
      status: pageContent.status || 'Active',
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
        const res = await fetch(`/api/page-content/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          Swal.fire('Deleted!', 'Page content has been deleted.', 'success');
          fetchPageContents();
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete page content', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/page-content/${editingId}` : '/api/page-content';
      const method = editingId ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        category: formData.category || null,
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        Swal.fire('Success', `Page content ${editingId ? 'updated' : 'created'} successfully`, 'success');
        fetchPageContents();
        setShowModal(false);
        setEditingId(null);
        setFormData({
          pageType: 'category',
          category: '',
          hero: {
            title: '',
            subtitle: '',
            image: '',
            buttonText: 'Shop Now',
            buttonLink: '#',
            enabled: true,
          },
          categoryGrid: {
            title: 'SHOP BY CATEGORY',
            enabled: true,
          },
          featuredCollections: {
            title: 'FEATURED COLLECTIONS',
            enabled: true,
            items: [],
          },
          recommended: {
            title: 'RECOMMENDED FOR YOU',
            enabled: true,
          },
          trending: {
            title: 'TRENDING',
            enabled: true,
          },
          promoBanner: {
            title: '',
            image: '',
            buttonText: 'Shop Now',
            buttonLink: '#',
            enabled: false,
          },
          twoColumnBanners: {
            enabled: true,
            items: [],
          },
          newsletter: {
            enabled: true,
            title: 'STAY TUNED',
            description: "Don't miss the opportunity to get daily updates on all that's new at Shilpalay.",
          },
          status: 'Active',
        });
      } else {
        throw new Error(`Failed to ${editingId ? 'update' : 'create'} page content`);
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      pageType: 'category',
      category: '',
      hero: {
        title: '',
        subtitle: '',
        image: '',
        buttonText: 'Shop Now',
        buttonLink: '#',
        enabled: true,
      },
      categoryGrid: {
        title: 'SHOP BY CATEGORY',
        enabled: true,
      },
      featuredCollections: {
        title: 'FEATURED COLLECTIONS',
        enabled: true,
        items: [],
      },
      recommended: {
        title: 'RECOMMENDED FOR YOU',
        enabled: true,
      },
      trending: {
        title: 'TRENDING',
        enabled: true,
      },
      promoBanner: {
        title: '',
        image: '',
        buttonText: 'Shop Now',
        buttonLink: '#',
        enabled: false,
      },
      twoColumnBanners: {
        enabled: true,
        items: [],
      },
      newsletter: {
        enabled: true,
        title: 'STAY TUNED',
        description: "Don't miss the opportunity to get daily updates on all that's new at Shilpalay.",
      },
      status: 'Active',
    });
    setShowModal(true);
  };

  const tabs = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'categoryGrid', label: 'Category Grid' },
    { id: 'featuredCollections', label: 'Featured Collections' },
    { id: 'recommended', label: 'Recommended' },
    { id: 'trending', label: 'Trending' },
    { id: 'promoBanner', label: 'Promo Banner' },
    { id: 'twoColumnBanners', label: 'Two Column Banners' },
    { id: 'newsletter', label: 'Newsletter' },
  ];

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Page Content Management</h1>
        <button
          onClick={handleNew}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Page Content
        </button>
      </div>

      {/* Page Contents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pageContents.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No page content found. Create one to get started.
                </td>
              </tr>
            ) : (
              pageContents.map((pc) => (
                <tr key={pc._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pc.pageType === 'home' ? 'Homepage' : 'Category'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pc.category?.name || 'Homepage'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      pc.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {pc.category?.slug && (
                        <Link
                          href={`/category/${pc.category.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => handleEdit(pc)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pc._id)}
                        className="text-red-600 hover:text-red-900"
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
                {editingId ? 'Edit Page Content' : 'New Page Content'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Type</label>
                    <select
                      name="pageType"
                      value={formData.pageType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="category">Category</option>
                      <option value="home">Homepage</option>
                    </select>
                  </div>
                  {formData.pageType === 'category' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="py-4">
                  {/* Hero Section */}
                  {activeTab === 'hero' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.hero.enabled}
                          onChange={(e) => handleNestedInputChange('hero', 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label className="text-sm font-medium text-gray-700">Enable Hero Section</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={formData.hero.title}
                          onChange={(e) => handleNestedInputChange('hero', 'title', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                        <input
                          type="text"
                          value={formData.hero.subtitle}
                          onChange={(e) => handleNestedInputChange('hero', 'subtitle', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                        <input
                          type="url"
                          value={formData.hero.image}
                          onChange={(e) => handleNestedInputChange('hero', 'image', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                          <input
                            type="text"
                            value={formData.hero.buttonText}
                            onChange={(e) => handleNestedInputChange('hero', 'buttonText', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                          <input
                            type="text"
                            value={formData.hero.buttonLink}
                            onChange={(e) => handleNestedInputChange('hero', 'buttonLink', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category Grid */}
                  {activeTab === 'categoryGrid' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.categoryGrid.enabled}
                          onChange={(e) => handleNestedInputChange('categoryGrid', 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label className="text-sm font-medium text-gray-700">Enable Category Grid</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={formData.categoryGrid.title}
                          onChange={(e) => handleNestedInputChange('categoryGrid', 'title', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Newsletter */}
                  {activeTab === 'newsletter' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.newsletter.enabled}
                          onChange={(e) => handleNestedInputChange('newsletter', 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label className="text-sm font-medium text-gray-700">Enable Newsletter</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={formData.newsletter.title}
                          onChange={(e) => handleNestedInputChange('newsletter', 'title', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={formData.newsletter.description}
                          onChange={(e) => handleNestedInputChange('newsletter', 'description', e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
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

