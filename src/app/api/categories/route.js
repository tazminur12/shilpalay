import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ sortOrder: 1, createdAt: -1 });
    return NextResponse.json(categories);
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
