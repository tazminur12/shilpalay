import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PageContent from '@/models/PageContent';

// GET all page contents or filter by category/pageType
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const pageType = searchParams.get('pageType');
    const subCategory = searchParams.get('subCategory');
    const childCategory = searchParams.get('childCategory');

    let query = {};
    if (category) query.category = category;
    if (pageType) query.pageType = pageType;
    if (subCategory) query.subCategory = subCategory;
    if (childCategory) query.childCategory = childCategory;

    const pageContents = await PageContent.find(query)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('childCategory', 'name slug')
      .sort({ createdAt: -1 });

    return NextResponse.json(pageContents);
  } catch (error) {
    console.error('Error fetching page contents:', error);
    return NextResponse.json(
      { message: 'Failed to fetch page contents', error: error.message },
      { status: 500 }
    );
  }
}

// POST create new page content
export async function POST(req) {
  try {
    const data = await req.json();
    await connectDB();

    // Check if page content already exists for this category/pageType
    if (data.category || data.pageType === 'category') {
      const existing = await PageContent.findOne({
        category: data.category || null,
        pageType: data.pageType || 'category',
      });

      if (existing) {
        return NextResponse.json(
          { message: 'Page content already exists for this category' },
          { status: 400 }
        );
      }
    }

    const pageContent = new PageContent(data);
    await pageContent.save();

    return NextResponse.json(pageContent, { status: 201 });
  } catch (error) {
    console.error('Error creating page content:', error);
    return NextResponse.json(
      { message: 'Failed to create page content', error: error.message },
      { status: 500 }
    );
  }
}

