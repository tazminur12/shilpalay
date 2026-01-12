import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import ChildCategory from '@/models/ChildCategory';

export async function GET() {
  try {
    await connectDB();

    // Fetch active categories
    const categories = await Category.find({ status: 'Active' })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    
    // Fetch active subcategories
    const subCategories = await SubCategory.find({ status: 'Active' }).lean();
    
    // Fetch active child categories
    const childCategories = await ChildCategory.find({ status: 'Active' }).lean();

    // Build navigation structure
    const navigation = categories.map(category => {
      const categoryId = category._id.toString();
      
      // Find subcategories for this category
      const categorySubs = subCategories.filter(sub => {
        if (!sub.category) return false;
        const subCategoryId = sub.category.toString ? sub.category.toString() : sub.category;
        return subCategoryId === categoryId;
      });

      // Build sections with child categories
      const sections = categorySubs.map(sub => {
        const subId = sub._id.toString();
        
        const items = childCategories
          .filter(child => {
            if (!child.subCategory) return false;
            const childSubId = child.subCategory.toString ? child.subCategory.toString() : child.subCategory;
            return childSubId === subId;
          })
          .map(child => ({
            label: child.name,
            slug: child.slug || child.name.toLowerCase().replace(/\s+/g, '-')
          }));

        return {
          title: sub.name,
          slug: sub.slug,
          items: items
        };
      });

      return {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        sections: sections
      };
    });

    return NextResponse.json(navigation, { status: 200 });
  } catch (error) {
    console.error('Navigation API Error:', error);
    
    // Return empty array instead of error to prevent UI breakage
    return NextResponse.json(
      [], 
      { status: 200 }
    );
  }
}
