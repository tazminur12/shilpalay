import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const slug = searchParams.get('slug');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page') || 1;

    let query = {};

    if (slug) {
      query.slug = slug;
    } else if (status) {
      query.status = status;
    } else {
      // Default: only show published blogs for public access
      query.status = 'published';
    }

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    let blogsQuery = Blog.find(query).sort({ publishedAt: -1, createdAt: -1 });

    if (limit) {
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      const skip = (pageNum - 1) * limitNum;
      blogsQuery = blogsQuery.skip(skip).limit(limitNum);
    }

    const blogs = await blogsQuery.lean();

    // Increment views for published blogs
    if (status === 'published' || !status) {
      await Blog.updateMany(
        { _id: { $in: blogs.map(b => b._id) } },
        { $inc: { views: 1 } }
      );
    }

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { message: 'Failed to fetch blogs', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug: body.slug });
    if (existingBlog) {
      return NextResponse.json(
        { message: 'A blog with this slug already exists' },
        { status: 400 }
      );
    }

    const blog = new Blog(body);
    await blog.save();

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { message: 'Failed to create blog', error: error.message },
      { status: 500 }
    );
  }
}
