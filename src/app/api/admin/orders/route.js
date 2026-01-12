import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

// GET - Fetch all orders
export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order and decrease stock
export async function POST(req) {
  try {
    await connectDB();
    
    const data = await req.json();
    
    // Validate stock availability before creating order
    for (const item of data.items) {
      const product = await Product.findById(item._id || item.product);
      
      if (!product) {
        return NextResponse.json(
          { message: `Product ${item.name} not found` },
          { status: 404 }
        );
      }
      
      const currentStock = product.inventory?.totalStock || 0;
      const requestedQuantity = item.quantity || 1;
      
      if (currentStock < requestedQuantity) {
        return NextResponse.json(
          { 
            message: `Insufficient stock for ${item.name}. Available: ${currentStock}, Requested: ${requestedQuantity}` 
          },
          { status: 400 }
        );
      }
    }
    
    // Create order
    const order = new Order(data);
    await order.save();
    
    // Decrease stock for each item
    for (const item of data.items) {
      const product = await Product.findById(item._id || item.product);
      
      if (product) {
        const currentStock = product.inventory?.totalStock || 0;
        const newStock = Math.max(0, currentStock - (item.quantity || 1));
        
        await Product.findByIdAndUpdate(
          item._id || item.product,
          {
            $set: {
              'inventory.totalStock': newStock,
              'inventory.availability': newStock === 0 ? 'out_of_stock' : 'in_stock'
            }
          }
        );
      }
    }
    
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('items.product', 'name images');
    
    return NextResponse.json(
      { message: 'Order created successfully', order: populatedOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'Failed to create order', error: error.message },
      { status: 500 }
    );
  }
}
