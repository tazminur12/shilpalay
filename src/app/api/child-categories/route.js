import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ChildCategory from '@/models/ChildCategory';

export async function GET() {
  try {
    await connectDB();
    const childCategories = await ChildCategory.find()
      .populate({
        path: 'subCategory',
        select: 'name category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    return NextResponse.json(childCategories);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch child categories' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { name, subCategory, slug, status } = await req.json();
    await connectDB();

    const childCategory = new ChildCategory({ name, subCategory, slug, status });
    await childCategory.save();

    return NextResponse.json(childCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create child category' },
      { status: 500 }
    );
  }
}
