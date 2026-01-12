import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

// POST - Bulk update stock for multiple products
export async function POST(req) {
  try {
    await connectDB();
    
    const { updates } = await req.json(); // Array of { productId, totalStock, lowStockAlert }
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { message: 'Updates array is required' },
        { status: 400 }
      );
    }
    
    const results = [];
    const errors = [];
    
    for (const update of updates) {
      try {
        const { productId, totalStock, lowStockAlert, availability } = update;
        
        if (!productId) {
          errors.push({ productId, error: 'Product ID is required' });
          continue;
        }
        
        const updateData = {};
        
        if (totalStock !== undefined) {
          updateData['inventory.totalStock'] = Math.max(0, totalStock);
          // Auto-update availability
          updateData['inventory.availability'] = totalStock === 0 ? 'out_of_stock' : 'in_stock';
        }
        
        if (lowStockAlert !== undefined) {
          updateData['inventory.lowStockAlert'] = Math.max(0, lowStockAlert);
        }
        
        if (availability) {
          updateData['inventory.availability'] = availability;
        }
        
        const product = await Product.findByIdAndUpdate(
          productId,
          { $set: updateData },
          { new: true, runValidators: true }
        );
        
        if (product) {
          results.push({ productId, success: true, product });
        } else {
          errors.push({ productId, error: 'Product not found' });
        }
      } catch (error) {
        errors.push({ productId: update.productId, error: error.message });
      }
    }
    
    return NextResponse.json(
      { 
        message: `Updated ${results.length} products`,
        results,
        errors: errors.length > 0 ? errors : undefined
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error bulk updating inventory:', error);
    return NextResponse.json(
      { message: 'Failed to bulk update inventory', error: error.message },
      { status: 500 }
    );
  }
}
