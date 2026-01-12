import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Address from '@/models/Address';
import authOptions from '@/lib/auth';

// GET - Get single address
export async function GET(req, { params }) {
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
    
    return NextResponse.json(address, { status: 200 });
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json(
      { message: 'Failed to fetch address' },
      { status: 500 }
    );
  }
}

// PUT - Update address
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
    const data = await req.json();
    
    // Check if address belongs to user
    const existingAddress = await Address.findOne({ 
      _id: id, 
      user: session.user.id 
    });
    
    if (!existingAddress) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      );
    }
    
    // If setting as default, unset other default addresses
    if (data.isDefault && !existingAddress.isDefault) {
      await Address.updateMany(
        { user: session.user.id, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }
    
    const address = await Address.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(
      { message: 'Address updated successfully', address },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { message: 'Failed to update address', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete address
export async function DELETE(req, { params }) {
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
    const address = await Address.findOneAndDelete({ 
      _id: id, 
      user: session.user.id 
    });
    
    if (!address) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Address deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { message: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
