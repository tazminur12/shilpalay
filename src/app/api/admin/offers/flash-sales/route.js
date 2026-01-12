import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FlashSale from '@/models/FlashSale';

// GET - Fetch all flash sales
export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    let query = {};
    
    const now = new Date();
    
    if (status === 'active') {
      query = {
        enabled: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      };
    } else if (status === 'upcoming') {
      query = {
        enabled: true,
        startDate: { $gt: now }
      };
    } else if (status === 'ended') {
      query = { endDate: { $lt: now } };
    } else if (status === 'disabled') {
      query = { enabled: false };
    }
    
    const flashSales = await FlashSale.find(query)
      .populate('productIds', 'name images')
      .sort({ startDate: -1 });
    
    return NextResponse.json(flashSales, { status: 200 });
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    return NextResponse.json(
      { message: 'Failed to fetch flash sales' },
      { status: 500 }
    );
  }
}

// POST - Create new flash sale
export async function POST(req) {
  try {
    await connectDB();
    
    const data = await req.json();
    
    // Combine date and time for startDate and endDate
    if (data.startDate && data.startTime) {
      data.startDate = new Date(`${data.startDate}T${data.startTime}`);
    }
    if (data.endDate && data.endTime) {
      data.endDate = new Date(`${data.endDate}T${data.endTime}`);
    }
    
    const flashSale = new FlashSale(data);
    await flashSale.save();
    
    return NextResponse.json(
      { message: 'Flash sale created successfully', flashSale },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating flash sale:', error);
    return NextResponse.json(
      { message: 'Failed to create flash sale', error: error.message },
      { status: 500 }
    );
  }
}
