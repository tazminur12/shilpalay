import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import mongoose from 'mongoose';
import { getCache, setCache, generateCacheKey } from '@/lib/cache';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const inStock = searchParams.get('inStock');
    const tags = searchParams.get('tags');
    
    // Check cache
    const cacheKey = generateCacheKey('product-search', {
      q: query,
      category,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
      inStock,
      tags,
    });
    
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'X-Cache': 'HIT',
        },
      });
    }
    
    // Build search query
    let searchQuery = {
      status: 'published',
    };
    
    // Text search
    if (query && query.trim()) {
      const searchRegex = { $regex: query.trim(), $options: 'i' };
      searchQuery.$or = [
        { name: searchRegex },
        { slug: searchRegex },
        { sku: searchRegex },
        { 'description.shortDescription': searchRegex },
        { 'description.fullDescription': searchRegex },
        { brand: searchRegex },
        { tags: { $in: [new RegExp(query.trim(), 'i')] } },
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        searchQuery.category = new mongoose.Types.ObjectId(category);
      } else {
        // Try to find category by slug
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          searchQuery.category = cat._id;
        }
      }
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : 999999999;
      
      // Price filter: use salePrice if available, otherwise regularPrice
      searchQuery.$and = searchQuery.$and || [];
      searchQuery.$and.push({
        $or: [
          // Product has sale price within range
          {
            $and: [
              { 'price.salePrice': { $ne: null, $exists: true } },
              { 'price.salePrice': { $gte: min, $lte: max } }
            ]
          },
          // Product has no sale price, check regular price
          {
            $and: [
              { $or: [{ 'price.salePrice': null }, { 'price.salePrice': { $exists: false } }] },
              { 'price.regularPrice': { $gte: min, $lte: max } }
            ]
          }
        ]
      });
    }
    
    // Stock filter
    if (inStock === 'true') {
      searchQuery['inventory.availability'] = 'in_stock';
      searchQuery['inventory.totalStock'] = { $gt: 0 };
    }
    
    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      searchQuery.tags = { $in: tagArray };
    }
    
    // Build sort query
    let sortQuery = {};
    switch (sortBy) {
      case 'price-low':
        sortQuery = { 'price.salePrice': 1, 'price.regularPrice': 1 };
        break;
      case 'price-high':
        sortQuery = { 'price.salePrice': -1, 'price.regularPrice': -1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'name-asc':
        sortQuery = { name: 1 };
        break;
      case 'name-desc':
        sortQuery = { name: -1 };
        break;
      case 'relevance':
      default:
        // Relevance: featured first, then by name
        sortQuery = { 'flags.featured': -1, name: 1 };
        break;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const [products, total] = await Promise.all([
      Product.find(searchQuery)
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug')
        .populate('childCategory', 'name slug')
        .select('name slug sku price images inventory flags tags category subCategory childCategory')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(searchQuery),
    ]);
    
    // Format products
    const formattedProducts = products.map(product => ({
      _id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      images: product.images,
      inventory: product.inventory,
      flags: product.flags,
      tags: product.tags,
      category: product.category ? {
        _id: product.category._id?.toString(),
        name: product.category.name,
        slug: product.category.slug,
      } : null,
      subCategory: product.subCategory ? {
        _id: product.subCategory._id?.toString(),
        name: product.subCategory.name,
        slug: product.subCategory.slug,
      } : null,
      childCategory: product.childCategory ? {
        _id: product.childCategory._id?.toString(),
        name: product.childCategory.name,
      } : null,
    }));
    
    const result = {
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      filters: {
        query,
        category,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        sortBy,
        inStock: inStock === 'true',
        tags: tags ? tags.split(',') : [],
      },
    };
    
    // Cache for 1 minute (search results change frequently)
    setCache(cacheKey, result, 60);
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { 
        message: 'Failed to search products', 
        error: error.message,
        products: [],
        pagination: { page: 1, limit: 24, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      },
      { status: 500 }
    );
  }
}
