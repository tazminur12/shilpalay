import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(id).lean();

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    // Increment views for published blogs
    if (blog.status === 'published') {
      await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { message: 'Failed to fetch blog', error: error.message },
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
        { message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    // Check if slug already exists for another blog
    if (body.slug) {
      const existingBlog = await Blog.findOne({
        slug: body.slug,
        _id: { $ne: id }
      });
      if (existingBlog) {
        return NextResponse.json(
          { message: 'A blog with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { message: 'Failed to update blog', error: error.message },
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
        { message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { message: 'Failed to delete blog', error: error.message },
      { status: 500 }
    );
  }
}
