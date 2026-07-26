import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Role from '@/models/Role';

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'admin'].includes(session.user?.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { role } = await req.json();
    const roleKey = String(role || '')
      .trim()
      .toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid user id.' }, { status: 400 });
    }
    if (!roleKey) {
      return NextResponse.json({ message: 'Role is required.' }, { status: 400 });
    }

    await connectDB();

    const roleDoc = await Role.findOne({ key: roleKey, status: 'Active' });
    if (!roleDoc) {
      return NextResponse.json(
        { message: 'Selected role does not exist or is inactive.' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: roleKey },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json(
      { message: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
