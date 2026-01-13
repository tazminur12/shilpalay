"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react';

export default function BlogDetailPage({ params: routeParams }) {
  const params = use(routeParams);
  const slug = params.slug;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/blogs?slug=${slug}&status=published`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setBlog(data[0]);
        } else {
          setError('Blog not found');
        }
      } else {
        setError('Failed to load blog');
      }
    } catch (err) {
      setError('Failed to load blog');
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 mb-4">{error || 'Blog not found'}</p>
            <Link href="/" className="text-black underline">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const publishedDate = new Date(blog.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <nav className="text-xs text-gray-600 flex items-center gap-2">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blogs" className="hover:text-black transition-colors">Blogs</Link>
            <span>/</span>
            <span className="text-black">{blog.title}</span>
          </nav>
        </div>
      </div>

      {/* Blog Content */}
      <article className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>
        </div>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
          
          {blog.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{blog.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{publishedDate}</span>
            </div>
            {blog.views > 0 && (
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{blog.views} views</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </div>
  );
}
