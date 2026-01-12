import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find()
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
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: data.sku.toUpperCase() });
    if (existingProduct) {
      return NextResponse.json(
        { message: 'SKU already exists' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let slug = data.slug;
    if (!slug) {
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

    // Calculate total stock from variations if provided
    let totalStock = data.inventory?.totalStock || 0;
    if (data.variations && data.variations.length > 0) {
      totalStock = data.variations.reduce((sum, variation) => sum + (variation.stock || 0), 0);
    }

    // Prepare product data
    const productData = {
      name: data.name.trim(),
      slug,
      sku: data.sku.toUpperCase().trim(),
      category: data.category,
      subCategory: data.subCategory || null,
      childCategory: data.childCategory || null,
      collection: data.collection || '',
      brand: data.brand || 'Own Brand',
      price: {
        regularPrice: parseFloat(data.price.regularPrice),
        salePrice: data.price.salePrice ? parseFloat(data.price.salePrice) : null,
        discountType: data.price.discountType || 'percent',
      },
      variations: data.variations || [],
      inventory: {
        totalStock,
        lowStockAlert: data.inventory?.lowStockAlert || 10,
        availability: data.inventory?.availability || 'in_stock',
      },
      images: {
        thumbnail: data.images.thumbnail,
        gallery: data.images.gallery || [],
        video: data.images.video || '',
      },
      description: {
        shortDescription: data.description?.shortDescription || '',
        fullDescription: data.description?.fullDescription || '',
        fabric: data.description?.fabric || '',
        workType: data.description?.workType || '',
        fit: data.description?.fit || '',
        washCare: data.description?.washCare || '',
        origin: data.description?.origin || '',
      },
      shipping: {
        weight: parseFloat(data.shipping?.weight || 0),
        shippingClass: data.shipping?.shippingClass || 'standard',
        estimatedDelivery: parseInt(data.shipping?.estimatedDelivery || 7),
      },
      seo: {
        metaTitle: data.seo?.metaTitle || '',
        metaDescription: data.seo?.metaDescription || '',
        keywords: data.seo?.keywords || [],
      },
      tags: data.tags || [],
      flags: {
        featured: data.flags?.featured || false,
        showOnHomepage: data.flags?.showOnHomepage || false,
      },
      status: data.status || 'draft',
    };

    const product = new Product(productData);
    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { message: `${field} already exists` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to create product', error: error.message },
      { status: 500 }
    );
  }
}
