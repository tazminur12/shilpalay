import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PageContent from '@/models/PageContent';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import ChildCategory from '@/models/ChildCategory';

// GET page content by category slug
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const pageType = searchParams.get('pageType') || 'category';

    if (!slug && pageType !== 'home') {
      return NextResponse.json(
        { message: 'Slug is required for category pages' },
        { status: 400 }
      );
    }

    let pageContentDoc = null;
    let category = null;

    if (pageType === 'home') {
      // Get homepage content
      pageContentDoc = await PageContent.findOne({ pageType: 'home' });
    } else {
      // Get category by slug
      category = await Category.findOne({ slug });
      if (!category) {
        return NextResponse.json(
          { message: 'Category not found' },
          { status: 404 }
        );
      }

      // Get page content for this category
      pageContentDoc = await PageContent.findOne({ category: category._id });
    }

    // Default page content structure
    const defaultPageContent = {
      hero: {
        title: '',
        subtitle: '',
        image: '',
        buttonText: 'Shop Now',
        buttonLink: '#',
        enabled: true,
      },
      categoryGrid: {
        title: 'SHOP BY CATEGORY',
        enabled: true,
      },
      featuredCollections: {
        title: 'FEATURED COLLECTIONS',
        enabled: true,
        items: [],
      },
      recommended: {
        title: 'RECOMMENDED FOR YOU',
        enabled: true,
        products: [],
      },
      trending: {
        title: 'TRENDING',
        enabled: true,
        products: [],
      },
      promoBanner: {
        title: '',
        image: '',
        buttonText: 'Shop Now',
        buttonLink: '#',
        enabled: false,
      },
      twoColumnBanners: {
        enabled: true,
        items: [],
      },
      newsletter: {
        enabled: true,
        title: 'STAY TUNED',
        description: "Don't miss the opportunity to get daily updates on all that's new at Shilpalay.",
      },
    };

    // If no page content exists, return default structure
    if (!pageContentDoc) {
      return NextResponse.json({
        ...defaultPageContent,
        category: pageType === 'home' ? null : category ? { _id: category._id, name: category.name, slug: category.slug } : null,
      });
    }

    // Convert Mongoose document to plain object
    const pageContent = pageContentDoc.toObject ? pageContentDoc.toObject() : pageContentDoc;
    
    // Include category info for category pages
    if (pageType !== 'home' && category) {
      pageContent.category = {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
      };
    }

    return NextResponse.json(pageContent);
  } catch (error) {
    console.error('Error fetching page content by slug:', error);
    return NextResponse.json(
      { message: 'Failed to fetch page content', error: error.message },
      { status: 500 }
    );
  }
}

