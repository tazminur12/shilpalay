import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ChildCategory from '@/models/ChildCategory';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { name, subCategory, slug, status } = await req.json();
    await connectDB();

    const childCategory = await ChildCategory.findByIdAndUpdate(
      id,
      { name, subCategory, slug, status },
      { new: true }
    );

    if (!childCategory) {
      return NextResponse.json(
        { message: 'Child Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(childCategory);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update child category' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const childCategory = await ChildCategory.findByIdAndDelete(id);

    if (!childCategory) {
      return NextResponse.json(
        { message: 'Child Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Child Category deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete child category' },
      { status: 500 }
    );
  }
}
