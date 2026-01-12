import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Discount from '@/models/Discount';

// GET - Fetch all discounts
export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    let query = {};
    
    if (type && type !== 'all') {
      query.discountType = type;
    }
    
    const discounts = await Discount.find(query)
      .populate('categoryIds', 'name')
      .populate('productIds', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(discounts, { status: 200 });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

// POST - Create new discount
export async function POST(req) {
  try {
    await connectDB();
    
    const data = await req.json();
    
    const discount = new Discount(data);
    await discount.save();
    
    return NextResponse.json(
      { message: 'Discount created successfully', discount },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating discount:', error);
    return NextResponse.json(
      { message: 'Failed to create discount', error: error.message },
      { status: 500 }
    );
  }
}
