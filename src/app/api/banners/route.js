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

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let query = {};
    let cacheHeaders = {
      'Cache-Control': 'private, no-store',
    };

    if (category) {
      try {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(category);
        if (isValidObjectId) {
          const categoryObjectId = new mongoose.Types.ObjectId(category);
          query.$or = [
            { category: categoryObjectId },
            { category: category },
            { category: category.toString() },
          ];
        } else {
          query.category = category;
        }
      } catch {
        query.category = category;
      }
      query.position = 'Category Banner';
      query.status = 'Active';
      cacheHeaders = {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      };
    }

    const banners = await Banner.find(query)
      .populate({
        path: 'category',
        select: 'name slug',
        strictPopulate: false,
      })
      .sort({ sortOrder: 1, createdAt: -1 });

    const bannersData = banners.map(serializeBanner);

    return NextResponse.json(bannersData, { headers: cacheHeaders });
  } catch (error) {
    console.error('Failed to fetch banners:', error);
    return NextResponse.json([], {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }
}

export async function POST(req) {
  try {
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

    const banner = new Banner({
      title: title || '',
      image: String(image).trim(),
      link: link || '',
      status: status === 'Inactive' ? 'Inactive' : 'Active',
      sortOrder: Number(sortOrder) || 0,
      position,
      category: parseCategoryId(category, position),
    });

    const savedBanner = await banner.save();
    await savedBanner.populate({
      path: 'category',
      select: 'name slug',
      strictPopulate: false,
    });

    revalidateStorefront();
    return NextResponse.json(serializeBanner(savedBanner), { status: 201 });
  } catch (error) {
    console.error('Failed to create banner:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create banner' },
      { status: 500 }
    );
  }
}
