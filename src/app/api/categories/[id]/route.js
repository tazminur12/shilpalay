import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import { revalidateStorefront } from '@/lib/revalidate';
import { mongoErrorResponse } from '@/lib/mongoErrors';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { name, slug, status, image, sortOrder } = await req.json();
    await connectDB();

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { message: 'Name and slug are required.' },
        { status: 400 }
      );
    }

    const updateData = {
      name: String(name).trim(),
      slug: String(slug).trim(),
      status: status === 'Inactive' ? 'Inactive' : 'Active',
    };
    if (image !== undefined) updateData.image = image;
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder) || 0;

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    revalidateStorefront();
    return NextResponse.json(category);
  } catch (error) {
    return mongoErrorResponse(error, 'Failed to update category');
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const childCount = await SubCategory.countDocuments({ category: id });
    if (childCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete. ${childCount} sub-categor${childCount === 1 ? 'y' : 'ies'} still linked. Remove or reassign them first.`,
        },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    revalidateStorefront();
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return mongoErrorResponse(error, 'Failed to delete category');
  }
}
