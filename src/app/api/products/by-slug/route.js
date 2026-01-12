import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { message: 'Slug is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findOne({ slug, status: 'published' })
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
