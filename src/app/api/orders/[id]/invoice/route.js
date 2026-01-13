import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import mongoose from 'mongoose';

// GET - Generate invoice data for order
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
      .populate('customer', 'firstName lastName email mobile')
      .populate('items.product', 'name sku');

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

    // Generate invoice data
    const invoiceData = {
      invoiceNumber: `INV-${order.orderNumber}`,
      orderNumber: order.orderNumber,
      invoiceDate: new Date().toISOString(),
      orderDate: order.createdAt,
      customer: {
        name: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        email: order.customer?.email || order.shippingAddress.email,
        mobile: order.customer?.mobile || order.shippingAddress.mobile,
      },
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress || order.shippingAddress,
      items: order.items.map(item => ({
        name: item.name,
        sku: item.product?.sku || 'N/A',
        quantity: item.quantity,
        unitPrice: item.price.salePrice || item.price.regularPrice,
        total: (item.price.salePrice || item.price.regularPrice) * item.quantity,
        variation: item.selectedVariation,
      })),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      vat: order.vat,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,
      company: {
        name: 'Shilpalay',
        address: 'Dhaka, Bangladesh',
        phone: '+880-XXX-XXXXXXX',
        email: 'info@shilpalay.com',
      },
    };

    return NextResponse.json(invoiceData, { status: 200 });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { message: 'Failed to generate invoice', error: error.message },
      { status: 500 }
    );
  }
}
