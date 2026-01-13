import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// PUT - Cancel order by customer
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
    const { reason } = await req.json().catch(() => ({}));

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Find order
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order belongs to the customer
    if (order.customer?.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized - This order does not belong to you' },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      return NextResponse.json(
        { message: 'Order is already cancelled' },
        { status: 400 }
      );
    }

    if (order.status === 'delivered') {
      return NextResponse.json(
        { message: 'Cannot cancel delivered order. Please request a return instead.' },
        { status: 400 }
      );
    }

    if (order.status === 'shipped') {
      return NextResponse.json(
        { message: 'Order is already shipped. Please contact customer support for cancellation.' },
        { status: 400 }
      );
    }

    // Restore stock for each item
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      
      if (product) {
        const currentStock = product.inventory?.totalStock || 0;
        const restoredQuantity = item.quantity || 1;
        const newStock = currentStock + restoredQuantity;
        
        await Product.findByIdAndUpdate(
          item.product,
          {
            $set: {
              'inventory.totalStock': newStock,
              'inventory.availability': newStock > 0 ? 'in_stock' : 'out_of_stock'
            }
          }
        );
      }
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by customer';
    order.cancelledBy = 'customer';
    
    // Add to tracking history
    order.trackingHistory.push({
      status: 'cancelled',
      message: 'Order cancelled by customer',
      timestamp: new Date(),
    });

    // Update payment status if paid
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('items.product', 'name images');

    return NextResponse.json(
      { 
        message: 'Order cancelled successfully',
        order: populatedOrder 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { message: 'Failed to cancel order', error: error.message },
      { status: 500 }
    );
  }
}
