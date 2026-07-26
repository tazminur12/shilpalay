import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'admin'].includes(session.user?.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid user id.' }, { status: 400 });
    }

    if (session.user?.id === id) {
      return NextResponse.json(
        { message: 'You cannot delete your own account.' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.role === 'super_admin' && session.user?.role !== 'super_admin') {
      return NextResponse.json(
        { message: 'Only a Super Admin can delete another Super Admin.' },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}
