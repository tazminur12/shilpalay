import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

// GET - Fetch inventory with filters
export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const stockFilter = searchParams.get('stockFilter');
    const category = searchParams.get('category');
    
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const products = await Product.find(query)
      .populate('category', 'name')
      .select('name sku images category inventory price')
      .sort({ createdAt: -1 });
    
    // Apply stock filter after fetching (since we need to calculate)
    let filteredProducts = products;
    
    if (stockFilter && stockFilter !== 'all') {
      filteredProducts = products.filter(product => {
        const stock = product.inventory?.totalStock || 0;
        const lowStockAlert = product.inventory?.lowStockAlert || 10;
        
        switch (stockFilter) {
          case 'in_stock':
            return stock > 0;
          case 'low_stock':
            return stock > 0 && stock <= lowStockAlert;
          case 'out_of_stock':
            return stock === 0;
          default:
            return true;
        }
      });
    }
    
    return NextResponse.json(filteredProducts, { status: 200 });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { message: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}
