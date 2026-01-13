import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PromotionalSection from '@/models/PromotionalSection';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const position = searchParams.get('position');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const sectionType = searchParams.get('sectionType');

    let query = {};

    if (position) {
      query.position = position;
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (sectionType) {
      query.sectionType = sectionType;
    }

    // Filter by date range - only show active promotions
    const now = new Date();
    query.$or = [
      { endDate: null },
      { endDate: { $gte: now } }
    ];
    query.startDate = { $lte: now };

    const sections = await PromotionalSection.find(query)
      .populate('category', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching promotional sections:', error);
    return NextResponse.json(
      { message: 'Failed to fetch promotional sections', error: error.message },
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

    const section = new PromotionalSection(body);
    await section.save();

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error('Error creating promotional section:', error);
    return NextResponse.json(
      { message: 'Failed to create promotional section', error: error.message },
      { status: 500 }
    );
  }
}
