"use client";

import { useEffect, useState, use } from 'react';
import PageLayout from '@/app/components/PageLayout';

const MainCategoryPage = ({ params }) => {
  const { slug } = use(params);
  const [category, setCategory] = useState(null);
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only process if slug is not a reserved route
    const reservedRoutes = ['product', 'cart', 'checkout', 'my-account', 'login', 'signup', 'recommended', 'trending', 'whats-new', 'dashboard', 'api'];
    if (slug && !reservedRoutes.includes(slug.toLowerCase())) {
      fetchCategoryAndPageContent();
    } else if (slug && reservedRoutes.includes(slug.toLowerCase())) {
      setError('Invalid route');
      setLoading(false);
    }
  }, [slug]);

  const fetchCategoryAndPageContent = async () => {
    setLoading(true);
    try {
      // Fetch category by slug
      const categoryRes = await fetch(`/api/categories`);
      if (!categoryRes.ok) throw new Error('Failed to fetch categories');
      const categories = await categoryRes.json();
      const foundCategory = categories.find(cat => cat.slug === slug);
      
      if (!foundCategory) {
        throw new Error('Category not found');
      }
      
      setCategory(foundCategory);
      
      // Fetch page content for this category
      const contentRes = await fetch(`/api/page-content/by-slug?slug=${slug}&pageType=category`);
      if (contentRes.ok) {
        const content = await contentRes.json();
        setPageContent(content);
      } else {
        // Use default page content if not found
        setPageContent({
          hero: { enabled: false },
          categoryGrid: { enabled: true, title: 'SHOP BY CATEGORY' },
          featuredCollections: { enabled: false },
          recommended: { enabled: true },
          trending: { enabled: true },
          promoBanner: { enabled: false },
          twoColumnBanners: { enabled: false },
          newsletter: { enabled: true }
        });
      }
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch page data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="text-center text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!category || !pageContent) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="text-center text-gray-500">Category not found.</div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout 
      pageContent={pageContent}
      categoryId={category._id?.toString() || category._id}
      categorySlug={category.slug}
    />
  );
};

export default MainCategoryPage;
