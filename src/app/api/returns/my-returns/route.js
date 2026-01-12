import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

// GET - Fetch return requests for logged-in user
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
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    
    let query = { 
      customer: session.user.id,
      returnStatus: { $ne: null } // Only orders with return status
    };
    
    if (status && status !== 'all') {
      query.returnStatus = status;
    }
    
    if (type && type !== 'all') {
      query.returnType = type;
    }
    
    const orders = await Order.find(query)
      .populate('items.product', 'name images slug')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching user returns:', error);
    return NextResponse.json(
      { message: 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}

// POST - Create a new return/exchange request
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
    
    const body = await req.json();
    const { orderId, returnType, reason, items, notes } = body;
    
    if (!orderId || !returnType || !reason) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find the order
    const order = await Order.findOne({
      _id: orderId,
      customer: session.user.id,
      status: 'delivered' // Only delivered orders can be returned
    });
    
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found or not eligible for return' },
        { status: 404 }
      );
    }
    
    // Check if return already exists
    if (order.returnStatus) {
      return NextResponse.json(
        { message: 'Return request already exists for this order' },
        { status: 400 }
      );
    }
    
    // Update order with return information
    order.returnType = returnType;
    order.returnStatus = 'pending';
    order.notes = notes || order.notes;
    
    // Store return reason in notes if not already there
    if (reason) {
      order.notes = order.notes 
        ? `${order.notes}\n\nReturn Reason: ${reason}`
        : `Return Reason: ${reason}`;
    }
    
    await order.save();
    
    return NextResponse.json(
      { message: 'Return request created successfully', order },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating return request:', error);
    return NextResponse.json(
      { message: 'Failed to create return request' },
      { status: 500 }
    );
  }
}
