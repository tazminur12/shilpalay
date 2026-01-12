import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('childCategory', 'name slug');

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch product', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const data = await req.json();
    await connectDB();

    // Convert category to ObjectId if provided
    let categoryId = null;
    if (data.category) {
      const mongoose = await import('mongoose');
      if (mongoose.default.Types.ObjectId.isValid(data.category)) {
        categoryId = new mongoose.default.Types.ObjectId(data.category);
      }
    }

    const updateData = {
      ...data,
      category: categoryId || data.category,
    };

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('category', 'name slug')
     .populate('subCategory', 'name slug')
     .populate('childCategory', 'name slug');

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update product', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete product', error: error.message },
      { status: 500 }
    );
  }
}
