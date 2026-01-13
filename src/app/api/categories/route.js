import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { getCache, setCache, generateCacheKey } from '@/lib/cache';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    // Check cache first
    const cacheKey = generateCacheKey('categories', { status: status || 'all' });
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
    const query = status ? { status } : {};
    const categories = await Category.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean(); // Use lean() for better performance
    
    // Cache for 5 minutes
    setCache(cacheKey, categories, 300);
    
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { name, slug, status, image, sortOrder } = await req.json();
    await connectDB();

    const category = new Category({ 
      name, 
      slug, 
      status, 
      image: image || '',
      sortOrder: sortOrder || 0
    });
    await category.save();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create category' },
      { status: 500 }
    );
  }
}
