import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PageContent from '@/models/PageContent';

// GET single page content by ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    const pageContent = await PageContent.findById(params.id)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('childCategory', 'name slug');

    if (!pageContent) {
      return NextResponse.json(
        { message: 'Page content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pageContent);
  } catch (error) {
    console.error('Error fetching page content:', error);
    return NextResponse.json(
      { message: 'Failed to fetch page content', error: error.message },
      { status: 500 }
    );
  }
}

// PUT update page content
export async function PUT(req, { params }) {
  try {
    const data = await req.json();
    await connectDB();

    const pageContent = await PageContent.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('childCategory', 'name slug');

    if (!pageContent) {
      return NextResponse.json(
        { message: 'Page content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pageContent);
  } catch (error) {
    console.error('Error updating page content:', error);
    return NextResponse.json(
      { message: 'Failed to update page content', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE page content
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const pageContent = await PageContent.findByIdAndDelete(params.id);

    if (!pageContent) {
      return NextResponse.json(
        { message: 'Page content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Page content deleted successfully' });
  } catch (error) {
    console.error('Error deleting page content:', error);
    return NextResponse.json(
      { message: 'Failed to delete page content', error: error.message },
      { status: 500 }
    );
  }
}

