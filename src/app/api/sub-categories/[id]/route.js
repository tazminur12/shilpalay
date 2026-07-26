import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import ChildCategory from '@/models/ChildCategory';
import { revalidateStorefront } from '@/lib/revalidate';
import { mongoErrorResponse } from '@/lib/mongoErrors';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
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

    const subCategory = await SubCategory.findByIdAndUpdate(
      id,
      {
        name: String(name).trim(),
        category,
        slug: String(slug).trim(),
        status: status === 'Inactive' ? 'Inactive' : 'Active',
        image: image || '',
        sortOrder: Number(sortOrder) || 0,
      },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!subCategory) {
      return NextResponse.json({ message: 'SubCategory not found' }, { status: 404 });
    }

    revalidateStorefront();
    return NextResponse.json(subCategory);
  } catch (error) {
    return mongoErrorResponse(error, 'Failed to update sub-category');
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const childCount = await ChildCategory.countDocuments({ subCategory: id });
    if (childCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete. ${childCount} child categor${childCount === 1 ? 'y' : 'ies'} still linked. Remove or reassign them first.`,
        },
        { status: 400 }
      );
    }

    const subCategory = await SubCategory.findByIdAndDelete(id);

    if (!subCategory) {
      return NextResponse.json({ message: 'SubCategory not found' }, { status: 404 });
    }

    revalidateStorefront();
    return NextResponse.json({ message: 'SubCategory deleted successfully' });
  } catch (error) {
    return mongoErrorResponse(error, 'Failed to delete sub-category');
  }
}
