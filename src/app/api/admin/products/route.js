import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const childCategory = searchParams.get('childCategory');
    const status = searchParams.get('status'); // Don't default to 'published' for admin
    const trending = searchParams.get('trending');
    const recommended = searchParams.get('recommended');
    const whatsNew = searchParams.get('whatsNew');
    
    let query = {};
    
    // Only filter by status if explicitly provided
    if (status) {
      query.status = status;
    }

    // Filter by trending flag
    if (trending === 'true') {
      query['flags.trending'] = true;
    }

    // Filter by recommended flag
    if (recommended === 'true') {
      query['flags.recommended'] = true;
    }

    // Filter by whatsNew flag
    if (whatsNew === 'true') {
      query['flags.whatsNew'] = true;
    }
    
    if (childCategory) {
      if (mongoose.Types.ObjectId.isValid(childCategory)) {
        query.childCategory = new mongoose.Types.ObjectId(childCategory);
      } else {
        query.childCategory = childCategory;
      }
    } else if (subCategory) {
      if (mongoose.Types.ObjectId.isValid(subCategory)) {
        query.subCategory = new mongoose.Types.ObjectId(subCategory);
      } else {
        query.subCategory = subCategory;
      }
    } else if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = new mongoose.Types.ObjectId(category);
      } else {
        query.category = category;
      }
    }
    
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('childCategory', 'name slug')
      .sort({ createdAt: -1 });
    
    // Convert to plain objects
    const productsData = products.map(product => ({
      _id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category: product.category ? {
        _id: product.category._id?.toString(),
        name: product.category.name,
        slug: product.category.slug
      } : null,
      subCategory: product.subCategory ? {
        _id: product.subCategory._id?.toString(),
        name: product.subCategory.name
      } : null,
      childCategory: product.childCategory ? {
        _id: product.childCategory._id?.toString(),
        name: product.childCategory.name
      } : null,
      collection: product.collection,
      brand: product.brand,
      price: {
        regularPrice: product.price.regularPrice,
        salePrice: product.price.salePrice,
        discountType: product.price.discountType,
      },
      variations: product.variations || [],
      inventory: {
        totalStock: product.inventory.totalStock,
        lowStockAlert: product.inventory.lowStockAlert,
        availability: product.inventory.availability,
      },
      images: {
        thumbnail: product.images.thumbnail,
        gallery: product.images.gallery || [],
        video: product.images.video || '',
      },
      description: product.description,
      shipping: product.shipping,
      seo: product.seo,
      tags: product.tags || [],
      flags: product.flags,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return NextResponse.json(productsData);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch products', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.sku || !data.category || !data.price?.regularPrice || !data.images?.thumbnail) {
      return NextResponse.json(
        { message: 'Missing required fields', missing: {
          name: !data.name,
          sku: !data.sku,
          category: !data.category,
          regularPrice: !data.price?.regularPrice,
          thumbnail: !data.images?.thumbnail
        }},
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

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: data.sku.toUpperCase().trim() });
    if (existingProduct) {
      return NextResponse.json(
        { message: 'SKU already exists' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let slug = data.slug;
    if (!slug || slug.trim() === '') {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check if slug already exists
    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Process variations - only include valid variations with all required fields
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

    // Prepare product data
    const productData = {
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

    const product = new Product(productData);
    await product.save();

    // Populate category before returning
    await product.populate('category', 'name slug');
    await product.populate('subCategory', 'name slug');
    await product.populate('childCategory', 'name slug');

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      errors: error.errors
    });

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
      { message: 'Failed to create product', error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: 500 }
    );
  }
}
