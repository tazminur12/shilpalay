import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Banner from '@/models/Banner';
import mongoose from 'mongoose';
import { revalidateStorefront } from '@/lib/revalidate';

const VALID_POSITIONS = [
  'Homepage Hero',
  'Homepage Banner',
  'Offer Banner',
  'Featured Banner',
  'Featured Collection',
  'Category Banner',
  'Sidebar',
];

function serializeBanner(banner) {
  return {
    _id: banner._id.toString(),
    title: banner.title || '',
    image: banner.image,
    link: banner.link || '',
    status: banner.status,
    sortOrder: banner.sortOrder || 0,
    position: banner.position,
    category: banner.category
      ? {
          _id: banner.category._id?.toString() || banner.category.toString(),
          name: banner.category.name || null,
          slug: banner.category.slug || null,
        }
      : null,
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt,
  };
}

function parseCategoryId(category, position) {
  if (position !== 'Category Banner') return null;
  if (!category || String(category).trim() === '') return null;
  if (!mongoose.Types.ObjectId.isValid(category)) return null;
  return new mongoose.Types.ObjectId(category);
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title = '',
      image,
      link = '',
      status = 'Active',
      sortOrder = 0,
      position = 'Homepage Banner',
      category = '',
    } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid banner id.' }, { status: 400 });
    }

    if (!image || !String(image).trim()) {
      return NextResponse.json(
        { message: 'Please upload a banner image before saving.' },
        { status: 400 }
      );
    }

    if (!VALID_POSITIONS.includes(position)) {
      return NextResponse.json({ message: 'Invalid banner position.' }, { status: 400 });
    }

    if (position === 'Category Banner' && !parseCategoryId(category, position)) {
      return NextResponse.json(
        { message: 'Please select a category for Category Banner.' },
        { status: 400 }
      );
    }

    await connectDB();

    const banner = await Banner.findByIdAndUpdate(
      id,
      {
        title: title || '',
        image: String(image).trim(),
        link: link || '',
        status: status === 'Inactive' ? 'Inactive' : 'Active',
        sortOrder: Number(sortOrder) || 0,
        position,
        category: parseCategoryId(category, position),
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'category',
      select: 'name slug',
      strictPopulate: false,
    });

    if (!banner) {
      return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
    }

    revalidateStorefront();
    return NextResponse.json(serializeBanner(banner));
  } catch (error) {
    console.error('Failed to update banner:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid banner id.' }, { status: 400 });
    }

    await connectDB();

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
    }

    revalidateStorefront();
    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Failed to delete banner:', error);
    return NextResponse.json({ message: 'Failed to delete banner' }, { status: 500 });
  }
}
