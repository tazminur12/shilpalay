import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Banner from '@/models/Banner';
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    let query = {};
    if (category) {
      // For category-specific banners - try both ObjectId and string formats
      try {
        // Check if it's a valid ObjectId string
        const isValidObjectId = mongoose.Types.ObjectId.isValid(category);
        
        // Try querying with both ObjectId and string format
        if (isValidObjectId) {
          const categoryObjectId = new mongoose.Types.ObjectId(category);
          // Query with $or to match both ObjectId and string formats
          query.$or = [
            { category: categoryObjectId },
            { category: category },
            { category: category.toString() }
          ];
        } else {
          query.category = category;
        }
      } catch (e) {
        query.category = category;
      }
      query.position = 'Category Banner';
      query.status = 'Active';
    }
    // If no category param, return all banners (for dashboard)
    
    const banners = await Banner.find(query)
      .populate({
        path: 'category',
        select: 'name slug',
        strictPopulate: false
      })
      .sort({ sortOrder: 1, createdAt: -1 });
    
    // Convert to plain objects for JSON serialization
    const bannersData = banners.map(banner => ({
      _id: banner._id.toString(),
      title: banner.title,
      image: banner.image,
      link: banner.link,
      status: banner.status,
      sortOrder: banner.sortOrder,
      position: banner.position,
      category: banner.category ? {
        _id: banner.category._id?.toString() || banner.category.toString(),
        name: banner.category.name,
        slug: banner.category.slug
      } : null,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt
    }));
    
    // Always return an array
    return NextResponse.json(Array.isArray(bannersData) ? bannersData : []);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const { title, image, link, status, sortOrder, position, category } = await req.json();
    await connectDB();

    // Convert category to ObjectId if provided and valid
    let categoryId = null;
    if (category && category.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryId = new mongoose.Types.ObjectId(category);
      }
    }

    const banner = new Banner({ 
      title: title || '', 
      image, 
      link: link || '',
      status: status || 'Active',
      sortOrder: sortOrder || 0,
      position: position || 'Homepage Banner',
      category: categoryId
    });
    
    const savedBanner = await banner.save();

    // Populate category before returning
    await savedBanner.populate({
      path: 'category',
      select: 'name slug',
      strictPopulate: false
    });

    return NextResponse.json(savedBanner, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create banner', error: error.message },
      { status: 500 }
    );
  }
}

