"use client";

import { Plus, Edit, Trash2, Search, X, Upload, Image as ImageIcon } from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

const EMPTY_FORM = {
  title: '',
  image: '',
  link: '',
  status: 'Active',
  sortOrder: 0,
  position: 'Homepage Banner',
  category: '',
};

const POSITION_OPTIONS = [
  'Homepage Hero',
  'Homepage Banner',
  'Offer Banner',
  'Featured Banner',
  'Featured Collection',
  'Category Banner',
  'Sidebar',
];

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

async function readErrorMessage(res, fallback) {
  try {
    const data = await res.json();
    return data.message || data.error || fallback;
  } catch {
    return fallback;
  }
}

export default function BannerListPage() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBanners();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, `Failed to fetch banners: ${res.status}`));
      }
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to fetch banners. Please try again.',
        timer: 3000,
        showConfirmButton: false,
      });
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBanners = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return banners;
    return banners.filter((banner) => {
      const haystack = [
        banner.title,
        banner.position,
        banner.link,
        banner.status,
        banner.category?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [banners, searchQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'position' && value !== 'Category Banner') {
        next.category = '';
      }
      return next;
    });
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setImagePreview('');
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (banner) => {
    setEditingId(banner._id);
    setFormData({
      title: banner.title || '',
      image: banner.image || '',
      link: banner.link || '',
      status: banner.status || 'Active',
      sortOrder: banner.sortOrder || 0,
      position: banner.position || 'Homepage Banner',
      category: banner.category?._id || '',
    });
    setImagePreview(banner.image || '');
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
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Failed to delete banner'));
      }
      Swal.fire('Deleted!', 'Banner has been deleted.', 'success');
      fetchBanners();
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to delete banner', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploading) {
      Swal.fire('Please wait', 'Image is still uploading.', 'info');
      return;
    }

    if (!formData.image?.trim()) {
      Swal.fire('Image required', 'Please upload a banner image before saving.', 'warning');
      return;
    }

    if (formData.position === 'Category Banner' && !formData.category) {
      Swal.fire('Category required', 'Please select a category for Category Banner.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/banners/${editingId}` : '/api/banners';
      const method = editingId ? 'PUT' : 'POST';
      const payload = {
        ...formData,
        sortOrder: Number(formData.sortOrder) || 0,
        category: formData.position === 'Category Banner' ? formData.category : '',
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(
          await readErrorMessage(res, `Failed to ${editingId ? 'update' : 'create'} banner`)
        );
      }

      Swal.fire(
        'Success',
        `Banner ${editingId ? 'updated' : 'created'} successfully`,
        'success'
      );
      await fetchBanners();
      setShowModal(false);
      resetForm();
    } catch (error) {
      Swal.fire('Error', error.message || 'Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const looksLikeImage =
      (file.type && file.type.startsWith('image/')) ||
      /\.(jpe?g|png|webp|gif|avif|bmp|svg)$/i.test(file.name || '');

    if (!looksLikeImage) {
      Swal.fire('Error', 'Please select an image file (JPG, PNG, WebP, GIF).', 'error');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      Swal.fire('Error', 'Image size should be less than 10MB.', 'error');
      e.target.value = '';
      return;
    }

    // Instant local preview while Cloudinary upload runs
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'shilpalay/banners');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Failed to upload image'));
      }

      const data = await res.json();
      if (!data?.url) {
        throw new Error('Upload succeeded but no image URL was returned.');
      }

      setFormData((prev) => ({ ...prev, image: data.url }));
      setImagePreview(data.url);
      Swal.fire({
        icon: 'success',
        title: 'Uploaded',
        text: 'Image uploaded successfully',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      setFormData((prev) => ({ ...prev, image: '' }));
      setImagePreview('');
      Swal.fire('Upload failed', error.message || 'Failed to upload image', 'error');
      console.error('Upload error:', error);
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeModal = () => {
    if (uploading || saving) return;
    setShowModal(false);
    resetForm();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Banner Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage website banners</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">{editingId ? 'Edit Banner' : 'Add New Banner'}</h3>
              <button type="button" onClick={closeModal} disabled={uploading || saving}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-black"
                  placeholder="Banner title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-black"
                >
                  {POSITION_OPTIONS.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>

              {formData.position === 'Category Banner' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-black"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the category this banner will be displayed on
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-black"
                  placeholder="/women or https://example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Relative paths like /women are supported
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-black"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {imagePreview ? (
                    <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={uploading}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">No image selected</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.avif"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="banner-image-upload"
                    disabled={uploading || saving}
                  />
                  <label
                    htmlFor="banner-image-upload"
                    className={`flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors ${
                      uploading || saving ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span className="text-sm text-gray-600">
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                        </span>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-gray-500">JPG, PNG, WebP, GIF — max 10MB</p>
                </div>
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

              <button
                type="submit"
                disabled={uploading || saving}
                className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? editingId
                    ? 'Updating...'
                    : 'Creating...'
                  : editingId
                    ? 'Update Banner'
                    : 'Create Banner'}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search banners..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Link
                </th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sort Order
                </th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No banners found
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => (
                  <tr key={banner._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      {banner.image ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={banner.image}
                            alt={banner.title || 'Banner'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 font-medium">
                      {banner.title || '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">{banner.position}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {banner.category ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {banner.category?.name || 'Unknown'}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {banner.link ? (
                        <a
                          href={banner.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate max-w-xs block"
                        >
                          {banner.link}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-sm font-medium text-gray-700">
                        {banner.sortOrder || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          banner.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {banner.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
    </div>
  );
}
