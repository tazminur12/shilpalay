import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FlashSale from '@/models/FlashSale';

// GET - Fetch single flash sale
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const flashSale = await FlashSale.findById(id)
      .populate('productIds', 'name images price');
    
    if (!flashSale) {
      return NextResponse.json(
        { message: 'Flash sale not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(flashSale, { status: 200 });
  } catch (error) {
    console.error('Error fetching flash sale:', error);
    return NextResponse.json(
      { message: 'Failed to fetch flash sale' },
      { status: 500 }
    );
  }
}

// PUT - Update flash sale
export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const data = await req.json();
    
    // Combine date and time for startDate and endDate
    if (data.startDate && data.startTime) {
      data.startDate = new Date(`${data.startDate}T${data.startTime}`);
    }
    if (data.endDate && data.endTime) {
      data.endDate = new Date(`${data.endDate}T${data.endTime}`);
    }
    
    const flashSale = await FlashSale.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    )
      .populate('productIds', 'name images price');
    
    if (!flashSale) {
      return NextResponse.json(
        { message: 'Flash sale not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Flash sale updated successfully', flashSale },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating flash sale:', error);
    return NextResponse.json(
      { message: 'Failed to update flash sale', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete flash sale
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const flashSale = await FlashSale.findByIdAndDelete(id);
    
    if (!flashSale) {
      return NextResponse.json(
        { message: 'Flash sale not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Flash sale deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting flash sale:', error);
    return NextResponse.json(
      { message: 'Failed to delete flash sale' },
      { status: 500 }
    );
  }
}
