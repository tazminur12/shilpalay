import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

// GET - Get single product inventory
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const product = await Product.findById(id)
      .populate('category', 'name')
      .select('name sku images category inventory price');
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Error fetching product inventory:', error);
    return NextResponse.json(
      { message: 'Failed to fetch product inventory' },
      { status: 500 }
    );
  }
}

// PUT - Update product stock
export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const { totalStock, lowStockAlert, availability } = await req.json();
    
    const updateData = {};
    
    if (totalStock !== undefined) {
      updateData['inventory.totalStock'] = Math.max(0, totalStock);
    }
    
    if (lowStockAlert !== undefined) {
      updateData['inventory.lowStockAlert'] = Math.max(0, lowStockAlert);
    }
    
    if (availability) {
      updateData['inventory.availability'] = availability;
    }
    
    // Auto-update availability based on stock
    if (totalStock !== undefined) {
      if (totalStock === 0) {
        updateData['inventory.availability'] = 'out_of_stock';
      } else {
        updateData['inventory.availability'] = 'in_stock';
      }
    }
    
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .select('name sku images category inventory price');
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Stock updated successfully', product },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { message: 'Failed to update stock', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Bulk update stock
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const { action, quantity } = await req.json(); // action: 'add', 'subtract', 'set'
    
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    const currentStock = product.inventory?.totalStock || 0;
    let newStock;
    
    switch (action) {
      case 'add':
        newStock = currentStock + (quantity || 0);
        break;
      case 'subtract':
        newStock = Math.max(0, currentStock - (quantity || 0));
        break;
      case 'set':
        newStock = Math.max(0, quantity || 0);
        break;
      default:
        return NextResponse.json(
          { message: 'Invalid action. Use "add", "subtract", or "set"' },
          { status: 400 }
        );
    }
    
    const updateData = {
      'inventory.totalStock': newStock,
      'inventory.availability': newStock === 0 ? 'out_of_stock' : 'in_stock'
    };
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .select('name sku images category inventory price');
    
    return NextResponse.json(
      { 
        message: 'Stock updated successfully', 
        product: updatedProduct,
        previousStock: currentStock,
        newStock: newStock
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { message: 'Failed to update stock', error: error.message },
      { status: 500 }
    );
  }
}
