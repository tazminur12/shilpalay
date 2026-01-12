import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

// GET - Get inventory statistics
export async function GET(req) {
  try {
    await connectDB();
    
    const products = await Product.find({})
      .select('inventory price');
    
    let totalProducts = 0;
    let inStockProducts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let totalStockValue = 0;
    let totalStockQuantity = 0;
    
    products.forEach(product => {
      totalProducts++;
      const stock = product.inventory?.totalStock || 0;
      const lowStockAlert = product.inventory?.lowStockAlert || 10;
      const price = product.price?.regularPrice || 0;
      
      totalStockQuantity += stock;
      totalStockValue += stock * price;
      
      if (stock === 0) {
        outOfStockProducts++;
      } else if (stock <= lowStockAlert) {
        lowStockProducts++;
        inStockProducts++;
      } else {
        inStockProducts++;
      }
    });
    
    // Low stock products (stock > 0 but <= alert)
    const lowStockCount = products.filter(p => {
      const stock = p.inventory?.totalStock || 0;
      const alert = p.inventory?.lowStockAlert || 10;
      return stock > 0 && stock <= alert;
    }).length;
    
    return NextResponse.json({
      totalProducts,
      inStockProducts,
      lowStockProducts: lowStockCount,
      outOfStockProducts,
      totalStockQuantity,
      totalStockValue,
      averageStockValue: totalProducts > 0 ? totalStockValue / totalProducts : 0
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch inventory statistics' },
      { status: 500 }
    );
  }
}
