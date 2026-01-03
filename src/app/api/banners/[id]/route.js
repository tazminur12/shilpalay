import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Banner from '@/models/Banner';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { title, image, link, status, sortOrder, position } = await req.json();
    await connectDB();

    const updateData = { title, image, link, status, sortOrder, position };

    const banner = await Banner.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!banner) {
      return NextResponse.json(
        { message: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update banner' },
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

