import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { getCache, setCache, generateCacheKey } from '@/lib/cache';
import { revalidateStorefront } from '@/lib/revalidate';
import { mongoErrorResponse } from '@/lib/mongoErrors';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    // Dashboard should always get fresh data; public storefront can use status filter + cache
    const admin = searchParams.get('admin') === '1';

    const cacheKey = generateCacheKey('categories', { status: status || 'all' });

    if (!admin) {
      const cached = getCache(cacheKey);
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Cache': 'HIT',
          },
        });
      }
    }

    await connectDB();
    const query = status ? { status } : {};
    const categories = await Category.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    if (!admin) {
      setCache(cacheKey, categories, 300);
    }

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': admin
          ? 'private, no-store'
          : 'public, s-maxage=300, stale-while-revalidate=600',
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

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { message: 'Name and slug are required.' },
        { status: 400 }
      );
    }

    const category = new Category({
      name: String(name).trim(),
      slug: String(slug).trim(),
      status: status === 'Inactive' ? 'Inactive' : 'Active',
      image: image || '',
      sortOrder: Number(sortOrder) || 0,
    });
    await category.save();

    revalidateStorefront();
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return mongoErrorResponse(error, 'Failed to create category');
  }
}
