import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Banner from '@/models/Banner';

export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { title, image, link, status, sortOrder, position } = await req.json();
    await connectDB();

    const banner = new Banner({ 
      title: title || '', 
      image, 
      link: link || '',
      status: status || 'Active',
      sortOrder: sortOrder || 0,
      position: position || 'Homepage Banner'
    });
    await banner.save();

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create banner', error: error.message },
      { status: 500 }
    );
  }
}

