"use client";

import { Plus, Edit, Trash2, Save, X, Eye, Image as ImageIcon, Search, Calendar } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import Image from 'next/image';
import Link from 'next/link';
import RichTextEditor from '@/app/components/RichTextEditor';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    author: 'Admin',
    category: 'stories',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    publishedAt: new Date().toISOString().split('T')[0],
    status: 'draft',
    featured: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);

  const categories = [
    { value: 'fashion', label: 'Fashion' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'tips', label: 'Tips & Tricks' },
    { value: 'news', label: 'News' },
    { value: 'stories', label: 'Stories' },
    { value: 'other', label: 'Other' },
  ];

  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs?status=all');
      if (res.ok) {
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : []);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
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
        setFormData(prev => ({ ...prev, featuredImage: data.url }));
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

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleEdit = (blog) => {
    setEditingId(blog._id);
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      featuredImage: blog.featuredImage || '',
      author: blog.author || 'Admin',
      category: blog.category || 'stories',
      tags: blog.tags || [],
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      publishedAt: blog.publishedAt ? new Date(blog.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: blog.status || 'draft',
      featured: blog.featured || false,
    });
    setImagePreview(blog.featuredImage || '');
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
        const res = await fetch(`/api/blogs/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          Swal.fire('Deleted!', 'Blog has been deleted.', 'success');
          fetchBlogs();
        } else {
          const error = await res.json();
          throw new Error(error.message || 'Failed to delete');
        }
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to delete blog', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.content || !formData.featuredImage) {
      Swal.fire('Error', 'Please fill in all required fields', 'error');
      return;
    }

    try {
      const url = editingId ? `/api/blogs/${editingId}` : '/api/blogs';
      const method = editingId ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt) : new Date(),
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        Swal.fire('Success', `Blog ${editingId ? 'updated' : 'created'} successfully`, 'success');
        fetchBlogs();
        setShowModal(false);
        handleNew();
      } else {
        const error = await res.json();
        throw new Error(error.message || `Failed to ${editingId ? 'update' : 'create'} blog`);
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
      excerpt: '',
      content: '',
      featuredImage: '',
      author: 'Admin',
      category: 'stories',
      tags: [],
      metaTitle: '',
      metaDescription: '',
      publishedAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      featured: false,
    });
    setImagePreview('');
    setTagInput('');
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getStatusLabel = (status) => {
    const stat = statuses.find(s => s.value === status);
    return stat ? stat.label : status;
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading blogs...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blogs / Stories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage blog posts and stories</p>
        </div>
        <button
          onClick={() => {
            handleNew();
            setShowModal(true);
          }}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Blog
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
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
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blogs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No blogs found. Create one to get started.
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {blog.featuredImage ? (
                      <div className="relative w-16 h-16 rounded overflow-hidden">
                        <Image
                          src={blog.featuredImage}
                          alt={blog.title}
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
                    <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                    {blog.excerpt && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{blog.excerpt}</div>
                    )}
                    {blog.featured && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">Featured</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCategoryLabel(blog.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      blog.status === 'published' 
                        ? 'bg-green-100 text-green-800'
                        : blog.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusLabel(blog.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {blog.views || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {blog.status === 'published' && (
                        <Link
                          href={`/blogs/${blog.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900"
                          title="View Blog"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => handleEdit(blog)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
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
                {editingId ? 'Edit Blog' : 'New Blog'}
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
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                      required
                      placeholder="blog-post-title"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                  <RichTextEditor
                    value={formData.excerpt}
                    onChange={(content) => setFormData(prev => ({ ...prev, excerpt: content }))}
                    placeholder="Short description or summary..."
                    minHeight="150px"
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image <span className="text-red-500">*</span>
                  </label>
                  {imagePreview ? (
                    <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, featuredImage: '' }));
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
                      <p className="text-sm text-gray-500">Click to upload featured image</p>
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

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="Enter blog content..."
                  />
                </div>

                {/* Category, Author, Status */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
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
                      {statuses.map((stat) => (
                        <option key={stat.value} value={stat.value}>
                          {stat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Add tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Published Date & Featured */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Published Date</label>
                    <input
                      type="date"
                      name="publishedAt"
                      value={formData.publishedAt}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center pt-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured Blog</span>
                    </label>
                  </div>
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
