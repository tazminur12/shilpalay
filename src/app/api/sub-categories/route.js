import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SubCategory from '@/models/SubCategory';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    let query = {};
    if (category) {
      query.category = category;
    }
    
    const subCategories = await SubCategory.find(query).populate('category', 'name').sort({ createdAt: -1 });
    return NextResponse.json(subCategories);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch sub-categories' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { name, category, slug, status, image } = await req.json();
    await connectDB();

    const subCategory = new SubCategory({ name, category, slug, status, image: image || '' });
    await subCategory.save();

    return NextResponse.json(subCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create sub-category' },
      { status: 500 }
    );
  }
}
