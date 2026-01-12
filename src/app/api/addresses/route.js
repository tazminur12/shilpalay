import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Address from '@/models/Address';
import authOptions from '@/lib/auth';

// GET - Fetch all addresses for logged-in user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const addresses = await Address.find({ user: session.user.id })
      .sort({ isDefault: -1, createdAt: -1 });
    
    return NextResponse.json(addresses, { status: 200 });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { message: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST - Create new address
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const data = await req.json();
    
    // If this is set as default, unset other default addresses
    if (data.isDefault) {
      await Address.updateMany(
        { user: session.user.id },
        { $set: { isDefault: false } }
      );
    }
    
    const address = new Address({
      ...data,
      user: session.user.id,
    });
    
    await address.save();
    
    return NextResponse.json(
      { message: 'Address added successfully', address },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { message: 'Failed to create address', error: error.message },
      { status: 500 }
    );
  }
}
