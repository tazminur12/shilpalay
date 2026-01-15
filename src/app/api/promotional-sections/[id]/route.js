import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PromotionalSection from '@/models/PromotionalSection';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid section ID' },
        { status: 400 }
      );
    }

    const section = await PromotionalSection.findById(id)
      .populate('category', 'name slug');

    if (!section) {
      return NextResponse.json(
        { message: 'Promotional section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error fetching promotional section:', error);
    return NextResponse.json(
      { message: 'Failed to fetch promotional section', error: error.message },
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
    const { id } = await params;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid section ID' },
        { status: 400 }
      );
    }

    const section = await PromotionalSection.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!section) {
      return NextResponse.json(
        { message: 'Promotional section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error updating promotional section:', error);
    return NextResponse.json(
      { message: 'Failed to update promotional section', error: error.message },
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
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid section ID' },
        { status: 400 }
      );
    }

    const section = await PromotionalSection.findByIdAndDelete(id);

    if (!section) {
      return NextResponse.json(
        { message: 'Promotional section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Promotional section deleted successfully' });
  } catch (error) {
    console.error('Error deleting promotional section:', error);
    return NextResponse.json(
      { message: 'Failed to delete promotional section', error: error.message },
      { status: 500 }
    );
  }
}
