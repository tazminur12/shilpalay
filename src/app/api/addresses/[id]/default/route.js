import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Address from '@/models/Address';
import authOptions from '@/lib/auth';

// PUT - Set address as default
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { id } = await params;
    
    // Check if address belongs to user
    const address = await Address.findOne({ 
      _id: id, 
      user: session.user.id 
    });
    
    if (!address) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      );
    }
    
    // Unset all other default addresses
    await Address.updateMany(
      { user: session.user.id, _id: { $ne: id } },
      { $set: { isDefault: false } }
    );
    
    // Set this address as default
    address.isDefault = true;
    await address.save();
    
    return NextResponse.json(
      { message: 'Address set as default', address },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error setting default address:', error);
    return NextResponse.json(
      { message: 'Failed to set default address', error: error.message },
      { status: 500 }
    );
  }
}
