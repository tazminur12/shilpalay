import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import mongoose from 'mongoose';

// GET - Get order tracking information
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Find order
    const order = await Order.findById(id)
      .populate('customer', 'name email')
      .select('orderNumber status trackingNumber trackingHistory estimatedDeliveryDate shippingAddress shippingMethod createdAt');

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order belongs to the customer (unless admin)
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin && order.customer?.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized - This order does not belong to you' },
        { status: 403 }
      );
    }

    // Format tracking history
    const trackingHistory = order.trackingHistory || [];
    
    // Add current status if not in history
    const hasCurrentStatus = trackingHistory.some(t => t.status === order.status);
    if (!hasCurrentStatus) {
      trackingHistory.push({
        status: order.status,
        message: getStatusMessage(order.status),
        timestamp: order.updatedAt || order.createdAt,
      });
    }

    // Sort by timestamp
    trackingHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
      trackingHistory: trackingHistory,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      shippingAddress: order.shippingAddress,
      shippingMethod: order.shippingMethod,
      createdAt: order.createdAt,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    return NextResponse.json(
      { message: 'Failed to fetch order tracking', error: error.message },
      { status: 500 }
    );
  }
}

function getStatusMessage(status) {
  const messages = {
    'pending': 'Order placed and awaiting confirmation',
    'processing': 'Order is being processed',
    'shipped': 'Order has been shipped',
    'delivered': 'Order has been delivered',
    'cancelled': 'Order has been cancelled',
    'returned': 'Order has been returned',
  };
  return messages[status] || 'Order status updated';
}
