import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import StaticPage from '@/models/StaticPage';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    const page = await StaticPage.findById(id);

    if (!page) {
      return NextResponse.json(
        { message: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching static page:', error);
    return NextResponse.json(
      { message: 'Failed to fetch static page', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = params;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    // Check if slug already exists for another page
    if (body.slug) {
      const existingPage = await StaticPage.findOne({ 
        slug: body.slug,
        _id: { $ne: id }
      });
      if (existingPage) {
        return NextResponse.json(
          { message: 'A page with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const page = await StaticPage.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!page) {
      return NextResponse.json(
        { message: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error updating static page:', error);
    return NextResponse.json(
      { message: 'Failed to update static page', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    const page = await StaticPage.findByIdAndDelete(id);

    if (!page) {
      return NextResponse.json(
        { message: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting static page:', error);
    return NextResponse.json(
      { message: 'Failed to delete static page', error: error.message },
      { status: 500 }
    );
  }
}
