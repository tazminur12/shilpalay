import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SubCategory from '@/models/SubCategory';
import ChildCategory from '@/models/ChildCategory';
import { revalidateStorefront } from '@/lib/revalidate';
import { mongoErrorResponse } from '@/lib/mongoErrors';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
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

    const childCategory = await ChildCategory.findByIdAndUpdate(
      id,
      {
        name: String(name).trim(),
        subCategory,
        slug: String(slug).trim(),
        status: status === 'Inactive' ? 'Inactive' : 'Active',
        sortOrder: Number(sortOrder) || 0,
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'subCategory',
      select: 'name category',
      populate: { path: 'category', select: 'name' },
    });

    if (!childCategory) {
      return NextResponse.json({ message: 'Child Category not found' }, { status: 404 });
    }

    revalidateStorefront();
    return NextResponse.json(childCategory);
  } catch (error) {
    return mongoErrorResponse(error, 'Failed to update child category');
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const childCategory = await ChildCategory.findByIdAndDelete(id);

    if (!childCategory) {
      return NextResponse.json({ message: 'Child Category not found' }, { status: 404 });
    }

    revalidateStorefront();
    return NextResponse.json({ message: 'Child Category deleted successfully' });
  } catch (error) {
    return mongoErrorResponse(error, 'Failed to delete child category');
  }
}
