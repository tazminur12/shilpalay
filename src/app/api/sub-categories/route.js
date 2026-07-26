import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category'; // ensure schema registered for populate
import SubCategory from '@/models/SubCategory';
import { revalidateStorefront } from '@/lib/revalidate';
import { mongoErrorResponse } from '@/lib/mongoErrors';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const query = {};
    if (category) query.category = category;

    const subCategories = await SubCategory.find(query)
      .populate('category', 'name')
      .sort({ sortOrder: 1, createdAt: -1 });

    return NextResponse.json(subCategories, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Failed to fetch sub-categories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch sub-categories' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { name, category, slug, status, image, sortOrder } = await req.json();
    await connectDB();

    if (!name?.trim() || !slug?.trim() || !category) {
      return NextResponse.json(
        { message: 'Name, slug, and parent category are required.' },
        { status: 400 }
      );
    }

    const parent = await Category.findById(category).select('_id');
    if (!parent) {
      return NextResponse.json({ message: 'Parent category not found.' }, { status: 400 });
    }

    const subCategory = new SubCategory({
      name: String(name).trim(),
      category,
      slug: String(slug).trim(),
      status: status === 'Inactive' ? 'Inactive' : 'Active',
      image: image || '',
      sortOrder: Number(sortOrder) || 0,
    });
    await subCategory.save();
    await subCategory.populate('category', 'name');

    revalidateStorefront();
    return NextResponse.json(subCategory, { status: 201 });
  } catch (error) {
    return mongoErrorResponse(error, 'Failed to create sub-category');
  }
}
