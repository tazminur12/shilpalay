import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';

// GET - Fetch all coupons
export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    let query = {};
    
    if (status === 'active') {
      query = {
        enabled: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      };
    } else if (status === 'expired') {
      query = { endDate: { $lt: new Date() } };
    } else if (status === 'disabled') {
      query = { enabled: false };
    }
    
    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(coupons, { status: 200 });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { message: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST - Create new coupon
export async function POST(req) {
  try {
    await connectDB();
    
    const data = await req.json();
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { message: 'Coupon code already exists' },
        { status: 400 }
      );
    }
    
    const coupon = new Coupon({
      ...data,
      code: data.code.toUpperCase(),
    });
    
    await coupon.save();
    
    return NextResponse.json(
      { message: 'Coupon created successfully', coupon },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { message: 'Failed to create coupon', error: error.message },
      { status: 500 }
    );
  }
}
