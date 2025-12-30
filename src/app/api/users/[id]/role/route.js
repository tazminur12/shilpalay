import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { role } = await req.json();

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
