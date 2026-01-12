import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Banner from '@/models/Banner';
import mongoose from 'mongoose';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { title, image, link, status, sortOrder, position, category } = await req.json();
    await connectDB();

    // Convert category to ObjectId if provided and valid
    let categoryId = null;
    if (category && category.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryId = new mongoose.Types.ObjectId(category);
      }
    }

    const updateData = { 
      title: title || '', 
      image, 
      link: link || '', 
      status, 
      sortOrder, 
      position,
      category: categoryId
    };

    const banner = await Banner.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate({
      path: 'category',
      select: 'name slug',
      strictPopulate: false
    });

    if (!banner) {
      return NextResponse.json(
        { message: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update banner', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return NextResponse.json(
        { message: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}

