import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

// GET - Get dashboard statistics
export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30'; // days
    
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    // Total Statistics
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    
    // Revenue Statistics
    const allOrders = await Order.find({}).select('total createdAt status');
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Recent Period Statistics
    const recentOrders = await Order.find({
      createdAt: { $gte: startDate }
    }).select('total createdAt status');
    
    const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const recentOrdersCount = recentOrders.length;
    
    // Previous Period for Comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - parseInt(period));
    
    const previousOrders = await Order.find({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    }).select('total createdAt status');
    
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const previousOrdersCount = previousOrders.length;
    
    // Calculate percentage changes
    const revenueChange = previousRevenue > 0 
      ? ((recentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : recentRevenue > 0 ? 100 : 0;
    
    const ordersChange = previousOrdersCount > 0
      ? ((recentOrdersCount - previousOrdersCount) / previousOrdersCount * 100).toFixed(1)
      : recentOrdersCount > 0 ? 100 : 0;
    
    // Order Status Breakdown
    const orderStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusMap = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0
    };
    
    orderStatusBreakdown.forEach(item => {
      if (statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.count;
      }
    });
    
    // Revenue by Day (Last 30 days)
    const revenueByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Top Products (by order count)
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price.regularPrice', '$items.quantity'] } }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);
    
    // Recent Orders
    const recentOrdersList = await Order.find({})
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber customer total status createdAt paymentStatus')
      .lean();
    
    // Payment Method Breakdown
    const paymentMethodBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);
    
    // Monthly Revenue (Last 6 months)
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    return NextResponse.json({
      overview: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        recentRevenue,
        recentOrdersCount,
        revenueChange: parseFloat(revenueChange),
        ordersChange: parseFloat(ordersChange)
      },
      orderStatus: statusMap,
      revenueByDay,
      topProducts,
      recentOrders: recentOrdersList,
      paymentMethods: paymentMethodBreakdown,
      monthlyRevenue
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
