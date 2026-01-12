import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Discount from '@/models/Discount';

// GET - Fetch single discount
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const discount = await Discount.findById(id)
      .populate('categoryIds', 'name')
      .populate('productIds', 'name');
    
    if (!discount) {
      return NextResponse.json(
        { message: 'Discount not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(discount, { status: 200 });
  } catch (error) {
    console.error('Error fetching discount:', error);
    return NextResponse.json(
      { message: 'Failed to fetch discount' },
      { status: 500 }
    );
  }
}

// PUT - Update discount
export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const data = await req.json();
    
    const discount = await Discount.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    )
      .populate('categoryIds', 'name')
      .populate('productIds', 'name');
    
    if (!discount) {
      return NextResponse.json(
        { message: 'Discount not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Discount updated successfully', discount },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating discount:', error);
    return NextResponse.json(
      { message: 'Failed to update discount', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete discount
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const discount = await Discount.findByIdAndDelete(id);
    
    if (!discount) {
      return NextResponse.json(
        { message: 'Discount not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Discount deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting discount:', error);
    return NextResponse.json(
      { message: 'Failed to delete discount' },
      { status: 500 }
    );
  }
}
