import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';

// GET - Fetch single coupon
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      return NextResponse.json(
        { message: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(coupon, { status: 200 });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { message: 'Failed to fetch coupon' },
      { status: 500 }
    );
  }
}

// PUT - Update coupon
export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const data = await req.json();
    
    // If code is being updated, check for duplicates
    if (data.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: data.code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingCoupon) {
        return NextResponse.json(
          { message: 'Coupon code already exists' },
          { status: 400 }
        );
      }
      data.code = data.code.toUpperCase();
    }
    
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    
    if (!coupon) {
      return NextResponse.json(
        { message: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Coupon updated successfully', coupon },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { message: 'Failed to update coupon', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete coupon
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const coupon = await Coupon.findByIdAndDelete(id);
    
    if (!coupon) {
      return NextResponse.json(
        { message: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Coupon deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { message: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
