import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('childCategory', 'name slug');

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Convert to plain object for proper serialization
    const productData = {
      _id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category: product.category ? {
        _id: product.category._id?.toString() || product.category.toString(),
        name: product.category.name,
        slug: product.category.slug
      } : null,
      subCategory: product.subCategory ? {
        _id: product.subCategory._id?.toString() || product.subCategory.toString(),
        name: product.subCategory.name,
        slug: product.subCategory.slug
      } : null,
      childCategory: product.childCategory ? {
        _id: product.childCategory._id?.toString() || product.childCategory.toString(),
        name: product.childCategory.name,
        slug: product.childCategory.slug
      } : null,
      collection: product.collection || '',
      brand: product.brand || 'Own Brand',
      price: product.price,
      variations: product.variations || [],
      inventory: product.inventory,
      images: product.images,
      description: product.description || {},
      shipping: product.shipping || {},
      seo: product.seo || {},
      tags: product.tags || [],
      flags: product.flags || {},
      status: product.status || 'draft',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    return NextResponse.json(productData);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Failed to fetch product', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const data = await req.json();
    await connectDB();

    // Validate required fields
    if (!data.name || !data.sku || !data.category || !data.price?.regularPrice || !data.images?.thumbnail) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert category IDs to ObjectId
    let categoryId = null;
    let subCategoryId = null;
    let childCategoryId = null;

    if (data.category) {
      if (mongoose.Types.ObjectId.isValid(data.category)) {
        categoryId = new mongoose.Types.ObjectId(data.category);
      } else {
        return NextResponse.json(
          { message: 'Invalid category ID' },
          { status: 400 }
        );
      }
    }

    if (data.subCategory && data.subCategory.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(data.subCategory)) {
        subCategoryId = new mongoose.Types.ObjectId(data.subCategory);
      }
    }

    if (data.childCategory && data.childCategory.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(data.childCategory)) {
        childCategoryId = new mongoose.Types.ObjectId(data.childCategory);
      }
    }

    // Check if SKU already exists (excluding current product)
    const existingProduct = await Product.findOne({ 
      sku: data.sku.toUpperCase().trim(), 
      _id: { $ne: id } 
    });
    if (existingProduct) {
      return NextResponse.json(
        { message: 'SKU already exists' },
        { status: 400 }
      );
    }

    // Generate slug if not provided or changed
    let slug = data.slug;
    if (!slug || slug.trim() === '') {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check if slug already exists (excluding current product)
    const existingSlug = await Product.findOne({ slug, _id: { $ne: id } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Process variations - only include valid variations
    let validVariations = [];
    let totalStock = data.inventory?.totalStock || 0;
    
    if (data.variations && Array.isArray(data.variations) && data.variations.length > 0) {
      validVariations = data.variations
        .filter(variation => 
          variation && 
          typeof variation === 'object' &&
          variation.color && 
          variation.color.trim() !== '' &&
          variation.size && 
          variation.size.trim() !== '' &&
          (variation.stock !== undefined && variation.stock !== null && variation.stock !== '') &&
          variation.sku &&
          variation.sku.trim() !== ''
        )
        .map(variation => ({
          color: variation.color.trim(),
          colorCode: variation.colorCode?.trim() || '',
          size: variation.size.trim(),
          material: variation.material?.trim() || '',
          stock: parseInt(variation.stock) || 0,
          priceOverride: variation.priceOverride ? parseFloat(variation.priceOverride) : null,
          sku: variation.sku.trim(),
        }));
      
      // Calculate total stock from valid variations
      if (validVariations.length > 0) {
        totalStock = validVariations.reduce((sum, variation) => sum + (variation.stock || 0), 0);
      }
    }

    // Prepare update data
    const updateData = {
      name: data.name.trim(),
      slug,
      sku: data.sku.toUpperCase().trim(),
      category: categoryId,
      subCategory: subCategoryId,
      childCategory: childCategoryId,
      collection: data.collection || '',
      brand: data.brand || 'Own Brand',
      price: {
        regularPrice: parseFloat(data.price.regularPrice),
        salePrice: data.price.salePrice ? parseFloat(data.price.salePrice) : null,
        discountType: data.price.discountType || 'percent',
      },
      variations: validVariations,
      inventory: {
        totalStock,
        lowStockAlert: data.inventory?.lowStockAlert || 10,
        availability: data.inventory?.availability || 'in_stock',
      },
      images: {
        thumbnail: data.images.thumbnail.trim(),
        gallery: Array.isArray(data.images.gallery) ? data.images.gallery.filter(img => img && img.trim() !== '') : [],
        video: data.images.video?.trim() || '',
      },
      description: {
        shortDescription: data.description?.shortDescription?.trim() || '',
        fullDescription: data.description?.fullDescription?.trim() || '',
        fabric: data.description?.fabric?.trim() || '',
        workType: data.description?.workType?.trim() || '',
        fit: data.description?.fit?.trim() || '',
        washCare: data.description?.washCare?.trim() || '',
        origin: data.description?.origin?.trim() || '',
      },
      shipping: {
        weight: parseFloat(data.shipping?.weight) || 0,
        shippingClass: data.shipping?.shippingClass?.trim() || 'standard',
        estimatedDelivery: parseInt(data.shipping?.estimatedDelivery) || 7,
      },
      seo: {
        metaTitle: data.seo?.metaTitle?.trim() || '',
        metaDescription: data.seo?.metaDescription?.trim() || '',
        keywords: Array.isArray(data.seo?.keywords) ? data.seo.keywords.filter(k => k && k.trim() !== '') : [],
      },
      tags: Array.isArray(data.tags) ? data.tags.filter(t => t && t.trim() !== '') : [],
      flags: {
        featured: data.flags?.featured || false,
        showOnHomepage: data.flags?.showOnHomepage || false,
        trending: data.flags?.trending || false,
        recommended: data.flags?.recommended || false,
        whatsNew: data.flags?.whatsNew || false,
      },
      status: data.status || 'draft',
    };

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug')
     .populate('subCategory', 'name slug')
     .populate('childCategory', 'name slug');

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { message: `${field} already exists` },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: 'Validation error', errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to update product', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete product', error: error.message },
      { status: 500 }
    );
  }
}
