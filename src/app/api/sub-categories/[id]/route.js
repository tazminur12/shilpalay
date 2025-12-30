import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SubCategory from '@/models/SubCategory';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { name, category, slug, status } = await req.json();
    await connectDB();

    const subCategory = await SubCategory.findByIdAndUpdate(
      id,
      { name, category, slug, status },
      { new: true }
    );

    if (!subCategory) {
      return NextResponse.json(
        { message: 'SubCategory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subCategory);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update sub-category' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const subCategory = await SubCategory.findByIdAndDelete(id);

    if (!subCategory) {
      return NextResponse.json(
        { message: 'SubCategory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'SubCategory deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete sub-category' },
      { status: 500 }
    );
  }
}
