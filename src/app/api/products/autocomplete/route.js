import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { getCache, setCache } from '@/lib/cache';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }
    
    // Check cache
    const cacheKey = `autocomplete:${query.toLowerCase().trim()}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'HIT',
        },
      });
    }
    
    await connectDB();
    
    const searchRegex = { $regex: query.trim(), $options: 'i' };
    
    // Search products
    const products = await Product.find({
      status: 'published',
      $or: [
        { name: searchRegex },
        { sku: searchRegex },
        { tags: { $in: [new RegExp(query.trim(), 'i')] } },
      ],
    })
      .select('name slug sku images price')
      .limit(5)
      .lean();
    
    // Search categories
    const categories = await Category.find({
      status: 'Active',
      $or: [
        { name: searchRegex },
        { slug: searchRegex },
      ],
    })
      .select('name slug')
      .limit(3)
      .lean();
    
    const suggestions = {
      products: products.map(p => ({
        _id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        thumbnail: p.images?.thumbnail,
        price: p.price,
        type: 'product',
      })),
      categories: categories.map(c => ({
        _id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        type: 'category',
      })),
    };
    
    // Cache for 5 minutes
    setCache(cacheKey, suggestions, 300);
    
    return NextResponse.json(suggestions, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Autocomplete API Error:', error);
    return NextResponse.json(
      { products: [], categories: [] },
      { status: 500 }
    );
  }
}
