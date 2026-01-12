"use client";

import { useEffect, useState, use } from 'react';
import PageLayout from '@/app/components/PageLayout';
import ProductListing from '@/app/components/ProductListing';

const DynamicCategoryPage = ({ params }) => {
  const { slug } = use(params);
  const [pageContent, setPageContent] = useState(null);
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [childCategory, setChildCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProducts, setShowProducts] = useState(false);

  useEffect(() => {
    if (slug && slug.length > 0) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch category by slug
          const categoryRes = await fetch(`/api/categories`);
          if (!categoryRes.ok) throw new Error('Failed to fetch categories');
          const categories = await categoryRes.json();
          const foundCategory = categories.find(cat => cat.slug === slug[0]);
          
          if (!foundCategory) {
            throw new Error('Category not found');
          }
          
          setCategory(foundCategory);
          
          // If sub-category slug exists
          if (slug.length > 1) {
            const subCategoryRes = await fetch(`/api/sub-categories?category=${foundCategory._id}`);
            if (subCategoryRes.ok) {
              const subCategories = await subCategoryRes.json();
              const foundSubCategory = subCategories.find(sub => sub.slug === slug[1]);
              if (foundSubCategory) {
                setSubCategory(foundSubCategory);
                
                // If child-category slug exists
                if (slug.length > 2) {
                  const childCategoryRes = await fetch(`/api/child-categories?subCategory=${foundSubCategory._id}`);
                  if (childCategoryRes.ok) {
                    const childCategories = await childCategoryRes.json();
                    const foundChildCategory = childCategories.find(child => child.slug === slug[2]);
                    if (foundChildCategory) {
                      setChildCategory(foundChildCategory);
                    }
                  }
                }
              }
            }
          }
          
          // Fetch page content for this category
          const contentRes = await fetch(`/api/page-content/by-slug?slug=${slug[0]}&pageType=category`);
          if (!contentRes.ok) throw new Error('Failed to fetch page content');
          const content = await contentRes.json();
          setPageContent(content);
        } catch (err) {
          setError(err.message);
          console.error("Failed to fetch page data", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [slug]);

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }

  if (!pageContent || !category) {
    return <div className="text-center py-20">Category not found.</div>;
  }

  return (
    <PageLayout 
      pageContent={pageContent}
      categoryId={category._id?.toString() || category._id}
      categorySlug={category.slug}
    />
  );
};

export default DynamicCategoryPage;