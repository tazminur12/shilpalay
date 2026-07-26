import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Role from '@/models/Role';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'admin'].includes(session.user?.role)) {
    return null;
  }
  return session;
}

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const mobile = String(body.mobile || '').trim();
    const gender = body.gender || undefined;
    const password = String(body.password || '');
    const roleKey = String(body.role || 'customer').trim().toLowerCase();

    if (!firstName || !lastName || !email || !mobile || !password) {
      return NextResponse.json(
        { message: 'First name, last name, email, mobile, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    await connectDB();

    const roleDoc = await Role.findOne({ key: roleKey, status: 'Active' });
    if (!roleDoc) {
      return NextResponse.json(
        { message: 'Selected role does not exist or is inactive.' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this email already exists.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      mobile,
      gender: ['male', 'female', 'other'].includes(gender) ? gender : undefined,
      password: hashedPassword,
      role: roleKey,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    if (error?.code === 11000) {
      return NextResponse.json(
        { message: 'A user with this email already exists.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
