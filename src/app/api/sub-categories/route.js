import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SubCategory from '@/models/SubCategory';

export async function GET() {
  try {
    await connectDB();
    const subCategories = await SubCategory.find().populate('category', 'name').sort({ createdAt: -1 });
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
    const { name, category, slug, status } = await req.json();
    await connectDB();

    const subCategory = new SubCategory({ name, category, slug, status });
    await subCategory.save();

    return NextResponse.json(subCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create sub-category' },
      { status: 500 }
    );
  }
}
