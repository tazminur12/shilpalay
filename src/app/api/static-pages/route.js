import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import StaticPage from '@/models/StaticPage';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const pageType = searchParams.get('pageType');
    const status = searchParams.get('status');
    const slug = searchParams.get('slug');

    let query = {};

    if (pageType) {
      query.pageType = pageType;
    }

    if (status) {
      query.status = status;
    }

    if (slug) {
      query.slug = slug;
    }

    const pages = await StaticPage.find(query).sort({ createdAt: -1 });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching static pages:', error);
    return NextResponse.json(
      { message: 'Failed to fetch static pages', error: error.message },
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
    const existingPage = await StaticPage.findOne({ slug: body.slug });
    if (existingPage) {
      return NextResponse.json(
        { message: 'A page with this slug already exists' },
        { status: 400 }
      );
    }

    const page = new StaticPage(body);
    await page.save();

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('Error creating static page:', error);
    return NextResponse.json(
      { message: 'Failed to create static page', error: error.message },
      { status: 500 }
    );
  }
}
