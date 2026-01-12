import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';
import Order from '@/models/Order';

// POST - Validate and apply coupon code
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();
    
    const { code, subtotal } = await req.json();
    
    if (!code || !code.trim()) {
      return NextResponse.json(
        { message: 'Coupon code is required' },
        { status: 400 }
      );
    }
    
    // Find coupon by code
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim(),
      enabled: true 
    });
    
    if (!coupon) {
      return NextResponse.json(
        { message: 'Invalid coupon code' },
        { status: 404 }
      );
    }
    
    // Check if coupon is active (date range)
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return NextResponse.json(
        { message: 'This coupon is not yet active' },
        { status: 400 }
      );
    }
    
    if (coupon.endDate && now > coupon.endDate) {
      return NextResponse.json(
        { message: 'This coupon has expired' },
        { status: 400 }
      );
    }
    
    // Check minimum purchase amount
    if (subtotal && coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
      return NextResponse.json(
        { 
          message: `Minimum purchase amount of Tk ${coupon.minPurchaseAmount.toFixed(2)} required`,
          minPurchaseAmount: coupon.minPurchaseAmount
        },
        { status: 400 }
      );
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { message: 'This coupon has reached its usage limit' },
        { status: 400 }
      );
    }
    
    // Check per-user usage limit (if user is logged in)
    if (session?.user?.id && coupon.usageLimitPerUser) {
      const userOrderCount = await Order.countDocuments({
        customer: session.user.id,
        'couponCode': coupon.code,
        status: { $in: ['pending', 'processing', 'shipped', 'delivered'] }
      });
      
      if (userOrderCount >= coupon.usageLimitPerUser) {
        return NextResponse.json(
          { message: 'You have already used this coupon' },
          { status: 400 }
        );
      }
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      // Apply max discount limit if set
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }
    
    // Return coupon details
    return NextResponse.json({
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        discountAmount: discountAmount
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { message: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
