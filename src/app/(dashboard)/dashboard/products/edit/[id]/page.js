"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Upload, Image as ImageIcon, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import Image from 'next/image';
import { productSchema } from '@/lib/validations/productSchema';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [seoExpanded, setSeoExpanded] = useState(false);
  const thumbnailInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      sku: '',
      category: '',
      subCategory: null,
      childCategory: null,
      collection: '',
      brand: 'Own Brand',
      price: {
        regularPrice: 0,
        salePrice: null,
        discountType: 'percent',
      },
      variations: [],
      inventory: {
        totalStock: 0,
        lowStockAlert: 10,
        availability: 'in_stock',
      },
      images: {
        thumbnail: '',
        gallery: [],
        video: '',
      },
      description: {
        shortDescription: '',
        fullDescription: '',
        fabric: '',
        workType: '',
        fit: '',
        washCare: '',
        origin: '',
      },
      shipping: {
        weight: 0,
        shippingClass: 'standard',
        estimatedDelivery: 7,
      },
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: [],
      },
      tags: [],
      flags: {
        featured: false,
        showOnHomepage: false,
      },
      status: 'draft',
    },
  });

  const { fields: variationFields, append: appendVariation, remove: removeVariation } = useFieldArray({
    control,
    name: 'variations',
  });

  const watchedName = watch('name');
  const watchedCategory = watch('category');
  const watchedSubCategory = watch('subCategory');
  const watchedRegularPrice = watch('price.regularPrice');
  const watchedSalePrice = watch('price.salePrice');
  const watchedThumbnail = watch('images.thumbnail');
  const watchedGallery = watch('images.gallery');

  // Fetch product data
  useEffect(() => {
    if (!productId) {
      Swal.fire('Error', 'Product ID is missing', 'error');
      router.push('/dashboard/products');
      return;
    }

    const fetchProduct = async () => {
      setFetching(true);
      try {
        const res = await fetch(`/api/admin/products/${productId}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Failed to fetch product' }));
          throw new Error(errorData.message || 'Failed to fetch product');
        }
        const product = await res.json();
        
        if (!product || !product._id) {
          throw new Error('Invalid product data received');
        }

        // Extract category IDs for form population and fetching sub/child categories
        const categoryId = product.category?._id || product.category || '';
        const subCategoryId = product.subCategory?._id || product.subCategory || null;
        const childCategoryId = product.childCategory?._id || product.childCategory || null;
        
        // Convert to strings for form values
        const categoryIdStr = categoryId ? (typeof categoryId === 'string' ? categoryId : categoryId.toString()) : '';
        const subCategoryIdStr = subCategoryId ? (typeof subCategoryId === 'string' ? subCategoryId : subCategoryId.toString()) : null;
        const childCategoryIdStr = childCategoryId ? (typeof childCategoryId === 'string' ? childCategoryId : childCategoryId.toString()) : null;

        // Populate form with product data
        reset({
          name: product.name || '',
          slug: product.slug || '',
          sku: product.sku || '',
          category: categoryIdStr,
          subCategory: subCategoryIdStr,
          childCategory: childCategoryIdStr,
          collection: product.collection || '',
          brand: product.brand || 'Own Brand',
          price: {
            regularPrice: product.price?.regularPrice || 0,
            salePrice: product.price?.salePrice || null,
            discountType: product.price?.discountType || 'percent',
          },
          variations: product.variations || [],
          inventory: {
            totalStock: product.inventory?.totalStock || 0,
            lowStockAlert: product.inventory?.lowStockAlert || 10,
            availability: product.inventory?.availability || 'in_stock',
          },
          images: {
            thumbnail: product.images?.thumbnail || '',
            gallery: product.images?.gallery || [],
            video: product.images?.video || '',
          },
          description: {
            shortDescription: product.description?.shortDescription || '',
            fullDescription: product.description?.fullDescription || '',
            fabric: product.description?.fabric || '',
            workType: product.description?.workType || '',
            fit: product.description?.fit || '',
            washCare: product.description?.washCare || '',
            origin: product.description?.origin || '',
          },
          shipping: {
            weight: product.shipping?.weight || 0,
            shippingClass: product.shipping?.shippingClass || 'standard',
            estimatedDelivery: product.shipping?.estimatedDelivery || 7,
          },
          seo: {
            metaTitle: product.seo?.metaTitle || '',
            metaDescription: product.seo?.metaDescription || '',
            keywords: product.seo?.keywords || [],
          },
          tags: product.tags || [],
          flags: {
            featured: product.flags?.featured || false,
            showOnHomepage: product.flags?.showOnHomepage || false,
            trending: product.flags?.trending || false,
            recommended: product.flags?.recommended || false,
            whatsNew: product.flags?.whatsNew || false,
          },
          status: product.status || 'draft',
        });

        // Fetch sub-categories and child-categories based on product data
        if (categoryIdStr) {
          fetch(`/api/sub-categories?category=${categoryIdStr}`)
            .then(res => res.json())
            .then(data => {
              setSubCategories(data.filter(sub => sub.status === 'Active'));
            })
            .catch(err => console.error('Error fetching sub-categories:', err));
        }

        if (subCategoryIdStr) {
          fetch(`/api/child-categories?subCategory=${subCategoryIdStr}`)
            .then(res => res.json())
            .then(data => {
              setChildCategories(data.filter(child => child.status === 'Active'));
            })
            .catch(err => console.error('Error fetching child-categories:', err));
        }
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to load product', 'error');
        router.push('/dashboard/products');
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [productId, reset, router]);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.filter(cat => cat.status === 'Active')))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Fetch sub-categories when category changes
  useEffect(() => {
    if (watchedCategory) {
      fetch(`/api/sub-categories?category=${watchedCategory}`)
        .then(res => res.json())
        .then(data => {
          setSubCategories(data.filter(sub => sub.status === 'Active'));
          // Don't reset subCategory if it's already set
          if (!watch('subCategory')) {
            setValue('subCategory', null);
          }
          setValue('childCategory', null);
        })
        .catch(err => console.error('Error fetching sub-categories:', err));
    } else {
      setSubCategories([]);
      setChildCategories([]);
    }
  }, [watchedCategory, setValue, watch]);

  // Fetch child-categories when sub-category changes
  useEffect(() => {
    if (watchedSubCategory) {
      fetch(`/api/child-categories?subCategory=${watchedSubCategory}`)
        .then(res => res.json())
        .then(data => {
          setChildCategories(data.filter(child => child.status === 'Active'));
          // Don't reset childCategory if it's already set
          if (!watch('childCategory')) {
            setValue('childCategory', null);
          }
        })
        .catch(err => console.error('Error fetching child-categories:', err));
    } else {
      setChildCategories([]);
    }
  }, [watchedSubCategory, setValue, watch]);

  const handleImageUpload = async (file, type) => {
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
        if (type === 'thumbnail') {
          setValue('images.thumbnail', data.url);
        } else if (type === 'gallery') {
          const currentGallery = watchedGallery || [];
          setValue('images.gallery', [...currentGallery, data.url]);
        }
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index) => {
    const currentGallery = watchedGallery || [];
    setValue('images.gallery', currentGallery.filter((_, i) => i !== index));
  };

  const calculateDiscount = () => {
    if (!watchedRegularPrice || !watchedSalePrice) return null;
    const discount = watchedRegularPrice - watchedSalePrice;
    const percent = ((discount / watchedRegularPrice) * 100).toFixed(0);
    return { discount, percent };
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        Swal.fire('Success', 'Product updated successfully', 'success');
        router.push(`/dashboard/products`);
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update product');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-1">Update product information</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Name */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-black"
                  placeholder="Enter product name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Category Selection */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Category Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Main Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('category')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sub Category</label>
                    <select
                      {...register('subCategory')}
                      disabled={!watchedCategory}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black disabled:bg-gray-100"
                    >
                      <option value="">Select Sub Category</option>
                      {subCategories.map(sub => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Child Category</label>
                    <select
                      {...register('childCategory')}
                      disabled={!watchedSubCategory}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black disabled:bg-gray-100"
                    >
                      <option value="">Select Child Category</option>
                      {childCategories.map(child => (
                        <option key={child._id} value={child._id}>{child.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Collection & Brand */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Collection</label>
                    <input
                      {...register('collection')}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-black"
                      placeholder="Collection name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <input
                      {...register('brand')}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-black"
                      placeholder="Brand name"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Regular Price (৳) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('price.regularPrice', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                    {errors.price?.regularPrice && (
                      <p className="text-red-500 text-xs mt-1">{errors.price.regularPrice.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sale Price (৳)</label>
                    <input
                      {...register('price.salePrice', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
                    <select
                      {...register('price.discountType')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    >
                      <option value="percent">Percentage</option>
                      <option value="flat">Flat Amount</option>
                    </select>
                  </div>
                </div>
                {watchedSalePrice && watchedRegularPrice && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      Discount: ৳{calculateDiscount()?.discount.toFixed(2)} ({calculateDiscount()?.percent}%)
                    </p>
                  </div>
                )}
              </div>

              {/* Inventory */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Total Stock</label>
                    <input
                      {...register('inventory.totalStock', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Low Stock Alert</label>
                    <input
                      {...register('inventory.lowStockAlert', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Availability</label>
                    <select
                      {...register('inventory.availability')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="preorder">Preorder</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SKU */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('sku')}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-black uppercase"
                  placeholder="PRODUCT-SKU-001"
                />
                {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
              </div>

              {/* Full Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Product Description</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Short Description</label>
                    <textarea
                      {...register('description.shortDescription')}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                      placeholder="Brief product description"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Full Description</label>
                    <textarea
                      {...register('description.fullDescription')}
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                      placeholder="Detailed product description"
                    />
                  </div>
                </div>
              </div>

              {/* Care & Artisan Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Care & Artisan Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fabric</label>
                    <input
                      {...register('description.fabric')}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Work Type</label>
                    <input
                      {...register('description.workType')}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fit</label>
                    <input
                      {...register('description.fit')}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Wash Care</label>
                    <input
                      {...register('description.washCare')}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Origin</label>
                    <input
                      {...register('description.origin')}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
                    <input
                      {...register('shipping.weight', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Shipping Class</label>
                    <input
                      {...register('shipping.shippingClass')}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Delivery (days)</label>
                    <input
                      {...register('shipping.estimatedDelivery', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <button
                  type="button"
                  onClick={() => setSeoExpanded(!seoExpanded)}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-4"
                >
                  <span>SEO Settings</span>
                  {seoExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {seoExpanded && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
                      <input
                        {...register('seo.metaTitle')}
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
                      <textarea
                        {...register('seo.metaDescription')}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Keywords (comma separated)</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                        placeholder="keyword1, keyword2, keyword3"
                        defaultValue={watch('seo.keywords')?.join(', ')}
                        onBlur={(e) => {
                          const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                          setValue('seo.keywords', keywords);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Product Images</h3>
                
                {/* Thumbnail */}
                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Thumbnail <span className="text-red-500">*</span>
                  </label>
                  {watchedThumbnail ? (
                    <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={watchedThumbnail}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setValue('images.thumbnail', '')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-black transition-colors"
                    >
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload thumbnail</p>
                    </div>
                  )}
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files?.[0], 'thumbnail')}
                  />
                  {errors.images?.thumbnail && (
                    <p className="text-red-500 text-xs mt-1">{errors.images.thumbnail.message}</p>
                  )}
                </div>

                {/* Gallery */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Gallery Images</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {watchedGallery?.map((img, index) => (
                      <div key={index} className="relative aspect-square border border-gray-300 rounded-lg overflow-hidden">
                        <Image
                          src={img}
                          alt={`Gallery ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Add Gallery Image'}
                  </button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files?.[0], 'gallery')}
                  />
                </div>
              </div>

              {/* Variations */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Variations</h3>
                  <button
                    type="button"
                    onClick={() => appendVariation({
                      color: '',
                      colorCode: '',
                      size: '',
                      material: '',
                      stock: 0,
                      priceOverride: null,
                      sku: '',
                    })}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-3 h-3" />
                    Add Variation
                  </button>
                </div>
                <div className="space-y-4">
                  {variationFields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600">Variation {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeVariation(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          {...register(`variations.${index}.color`)}
                          placeholder="Color"
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-black"
                        />
                        <input
                          {...register(`variations.${index}.colorCode`)}
                          placeholder="Color Code"
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-black"
                        />
                        <input
                          {...register(`variations.${index}.size`)}
                          placeholder="Size"
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-black"
                        />
                        <input
                          {...register(`variations.${index}.material`)}
                          placeholder="Material"
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-black"
                        />
                        <input
                          {...register(`variations.${index}.stock`, { valueAsNumber: true })}
                          type="number"
                          placeholder="Stock"
                          min="0"
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-black"
                        />
                        <input
                          {...register(`variations.${index}.sku`)}
                          placeholder="Variation SKU"
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  ))}
                  {variationFields.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">No variations added</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                <div className="space-y-2">
                  {['Eid', 'New', 'Limited Edition', 'Sale', 'Featured'].map(tag => (
                    <label key={tag} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('tags')}
                        value={tag}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-600">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status & Flags */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Status & Visibility</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Status</label>
                    <select
                      {...register('status')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('flags.featured')}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-600">Featured Product</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('flags.showOnHomepage')}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-600">Show on Homepage</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('flags.trending')}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-600">Trending Product</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('flags.recommended')}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-600">Recommended Product</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('flags.whatsNew')}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-600">What&apos;s New</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
