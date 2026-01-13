"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Loading from '@/app/components/ui/Loading';

export default function StaticPageView({ params: routeParams }) {
  const params = use(routeParams);
  const slug = params.slug;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/static-pages?slug=${slug}&status=Active`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setPage(data[0]);
        } else {
          setError('Page not found');
        }
      } else {
        setError('Failed to load page');
      }
    } catch (err) {
      setError('Failed to load page');
      console.error('Error fetching page:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <Loading text="Loading page..." />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 mb-4">{error || 'Page not found'}</p>
            <Link href="/" className="text-black underline">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <nav className="text-xs text-gray-600 flex items-center gap-2">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black">{page.title}</span>
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{page.title}</h1>
        </div>

        <div 
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
