import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import ChildCategory from '@/models/ChildCategory';

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({ status: 'Active' }).sort({ createdAt: 1 });
    const subCategories = await SubCategory.find({ status: 'Active' });
    const childCategories = await ChildCategory.find({ status: 'Active' });

    const navigation = categories.map(category => {
      const categorySubs = subCategories.filter(sub => 
        sub.category.toString() === category._id.toString()
      );

      const sections = categorySubs.map(sub => {
        const items = childCategories.filter(child => 
          child.subCategory.toString() === sub._id.toString()
        ).map(child => ({
          label: child.name,
          slug: child.slug
        }));

        return {
          title: sub.name,
          items: items
        };
      });

      return {
        name: category.name,
        slug: category.slug,
        sections: sections
      };
    });

    return NextResponse.json(navigation);
  } catch (error) {
    console.error('Navigation API Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch navigation' },
      { status: 500 }
    );
  }
}
