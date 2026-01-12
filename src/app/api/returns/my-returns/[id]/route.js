import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

// GET - Fetch a specific return request
export async function GET(req, { params: routeParams }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { id } = await routeParams;
    
    const order = await Order.findOne({
      _id: id,
      customer: session.user.id,
      returnStatus: { $ne: null }
    })
      .populate('items.product', 'name images slug');
    
    if (!order) {
      return NextResponse.json(
        { message: 'Return request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('Error fetching return request:', error);
    return NextResponse.json(
      { message: 'Failed to fetch return request' },
      { status: 500 }
    );
  }
}

// PUT - Cancel a return request
export async function PUT(req, { params: routeParams }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { id } = await routeParams;
    const body = await req.json();
    const { action } = body;
    
    if (action === 'cancel') {
      const order = await Order.findOne({
        _id: id,
        customer: session.user.id,
        returnStatus: 'pending'
      });
      
      if (!order) {
        return NextResponse.json(
          { message: 'Return request not found or cannot be cancelled' },
          { status: 404 }
        );
      }
      
      // Remove return status
      order.returnType = null;
      order.returnStatus = null;
      await order.save();
      
      return NextResponse.json(
        { message: 'Return request cancelled successfully', order },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating return request:', error);
    return NextResponse.json(
      { message: 'Failed to update return request' },
      { status: 500 }
    );
  }
}
