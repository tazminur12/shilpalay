import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category'; // ensure schema registered for nested populate
import SubCategory from '@/models/SubCategory';
import ChildCategory from '@/models/ChildCategory';
import { revalidateStorefront } from '@/lib/revalidate';
import { mongoErrorResponse } from '@/lib/mongoErrors';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const subCategory = searchParams.get('subCategory');

    const query = {};
    if (subCategory) query.subCategory = subCategory;

    const childCategories = await ChildCategory.find(query)
      .populate({
        path: 'subCategory',
        select: 'name category',
        populate: {
          path: 'category',
          select: 'name',
        },
      })
      .sort({ sortOrder: 1, createdAt: -1 });

    return NextResponse.json(childCategories, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Failed to fetch child categories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch child categories' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { name, subCategory, slug, status, sortOrder } = await req.json();
    await connectDB();

    if (!name?.trim() || !slug?.trim() || !subCategory) {
      return NextResponse.json(
        { message: 'Name, slug, and parent sub-category are required.' },
        { status: 400 }
      );
    }

    const parent = await SubCategory.findById(subCategory).select('_id');
    if (!parent) {
      return NextResponse.json(
        { message: 'Parent sub-category not found.' },
        { status: 400 }
      );
    }

    const childCategory = new ChildCategory({
      name: String(name).trim(),
      subCategory,
      slug: String(slug).trim(),
      status: status === 'Inactive' ? 'Inactive' : 'Active',
      sortOrder: Number(sortOrder) || 0,
    });
    await childCategory.save();
    await childCategory.populate({
      path: 'subCategory',
      select: 'name category',
      populate: { path: 'category', select: 'name' },
    });

    revalidateStorefront();
    return NextResponse.json(childCategory, { status: 201 });
  } catch (error) {
    return mongoErrorResponse(error, 'Failed to create child category');
  }
}
