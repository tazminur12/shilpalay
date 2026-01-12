"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import CategoryBanner from './CategoryBanner';

const PageLayout = ({ pageContent, categoryId, categorySlug }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Fetch categories or subcategories for category grid
  useEffect(() => {
    if (categoryId) {
      // For category pages, fetch subcategories
      fetch(`/api/sub-categories?category=${categoryId}`)
        .then(res => res.json())
        .then(data => setSubCategories(data.filter(sub => sub.status === 'Active')))
        .catch(err => console.error('Error fetching subcategories:', err));
    } else {
      // For homepage, fetch main categories
      fetch(`/api/categories`)
        .then(res => res.json())
        .then(data => setCategories(data.filter(cat => cat.status === 'Active')))
        .catch(err => console.error('Error fetching categories:', err));
    }
  }, [categoryId]);

  if (!pageContent) {
    return <div className="text-center py-20">Loading...</div>;
  }

  const {
    hero,
    categoryGrid,
    featuredCollections,
    recommended,
    trending,
    promoBanner,
    twoColumnBanners,
    newsletter,
  } = pageContent;

  // Hero Section
  const renderHero = () => {
    if (!hero || !hero.enabled) return null;

    return (
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-100 overflow-hidden">
        <div className="absolute inset-0">
          {hero.image ? (
            <Image
              src={hero.image}
              alt={hero.title || 'Hero'}
              fill
              className="object-cover object-top"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
          )}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          {hero.title && (
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 drop-shadow-md">
              {hero.title}
            </h2>
          )}
          {hero.subtitle && (
            <p className="text-sm md:text-base tracking-widest uppercase mb-8 drop-shadow-md">
              {hero.subtitle}
            </p>
          )}
          {hero.buttonText && (
            <Link
              href={hero.buttonLink || '#'}
              className="bg-black text-white px-8 py-3 text-xs md:text-sm tracking-widest uppercase font-medium hover:bg-gray-900 transition-colors"
            >
              {hero.buttonText}
            </Link>
          )}
        </div>
      </div>
    );
  };

  // Category Grid Section
  const renderCategoryGrid = () => {
    if (!categoryGrid || !categoryGrid.enabled) return null;
    
    // Use categories for homepage, subCategories for category pages
    const itemsToShow = categoryId ? subCategories : categories;
    if (!itemsToShow.length) return null;

    return (
      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10 uppercase tracking-wide">
            {categoryGrid.title || 'SHOP BY CATEGORY'}
          </h2>
          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${categoryId ? 'xl:grid-cols-5' : 'xl:grid-cols-4'} gap-4 md:gap-6`}>
            {itemsToShow.map((item) => {
              const linkHref = categoryId 
                ? `/category/${categorySlug}/${item.slug}` 
                : `/category/${item.slug}`;
              
              return (
                <Link
                  key={item._id}
                  href={linkHref}
                  className="group block text-center"
                >
                  <div className="relative aspect-[3/4] overflow-hidden mb-4 rounded-lg shadow-sm">
                    <Image
                      src={item.image || 'https://via.placeholder.com/300x400?text=No+Image'}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base text-gray-800 group-hover:text-[#e5c100] transition-colors">
                    {item.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // Featured Collections Section
  const renderFeaturedCollections = () => {
    if (!featuredCollections || !featuredCollections.enabled || !featuredCollections.items?.length) return null;

    return (
      <section className="py-8 bg-white">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          {featuredCollections.title && (
            <h2 className="text-2xl font-bold text-center mb-10 uppercase tracking-wide">
              {featuredCollections.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
            {featuredCollections.items.slice(0, 2).map((item, idx) => (
              <div key={idx} className="relative aspect-[16/9] group overflow-hidden">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title || 'Collection'}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
                  {item.title && (
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-md">
                      {item.title}
                    </h3>
                  )}
                  {item.subtitle && (
                    <p className="text-sm uppercase tracking-wider mb-6 drop-shadow-md">
                      {item.subtitle}
                    </p>
                  )}
                  <Link
                    href={item.buttonLink || '#'}
                    className="bg-transparent border border-white text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                  >
                    {item.buttonText || 'Shop Now'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Recommended/Trending Products Section
  const renderProductSection = (section, title) => {
    if (!section || !section.enabled) return null;

    // Placeholder products - will be replaced when Product model exists
    const products = Array(3).fill(null).map((_, i) => ({
      id: i,
      image: `https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=400&auto=format&fit=crop&random=${i}`,
      name: `Product ${i + 1}`,
    }));

    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10 uppercase tracking-wide">
            {title || section.title}
          </h2>
          <div className="relative px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <button className="absolute bottom-4 left-4 w-8 h-8 bg-gray-500/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="absolute left-0 top-1/2 -translate-y-1/2 p-1 hover:text-black text-gray-400 transition-colors">
              <ChevronLeft className="w-8 h-8 stroke-[1.5]" />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:text-black text-gray-400 transition-colors">
              <ChevronRight className="w-8 h-8 stroke-[1.5]" />
            </button>
          </div>
          <div className="flex justify-center mt-10">
            <button className="bg-black text-white px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition-colors">
              View More
            </button>
          </div>
        </div>
      </section>
    );
  };

  // Promotional Banner Section
  const renderPromoBanner = () => {
    if (!promoBanner || !promoBanner.enabled) return null;

    return (
      <section className="relative w-full aspect-[21/9] md:aspect-[21/7] overflow-hidden group">
        {promoBanner.image ? (
          <Image
            src={promoBanner.image}
            alt={promoBanner.title || 'Promotional Banner'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-400" />
        )}
        <div className="absolute inset-0 bg-black/10"></div>
        {promoBanner.title && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {promoBanner.title}
            </h2>
            {promoBanner.buttonText && (
              <Link
                href={promoBanner.buttonLink || '#'}
                className="bg-white text-black px-10 py-3 text-sm uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors"
              >
                {promoBanner.buttonText}
              </Link>
            )}
          </div>
        )}
      </section>
    );
  };

  // Two Column Banners Section
  const renderTwoColumnBanners = () => {
    if (!twoColumnBanners || !twoColumnBanners.enabled || !twoColumnBanners.items?.length) return null;

    return (
      <section className="grid grid-cols-1 md:grid-cols-2">
        {twoColumnBanners.items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="relative aspect-square md:aspect-[4/3] group overflow-hidden">
            {item.image && (
              <Image
                src={item.image}
                alt={item.title || 'Banner'}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-black/20"></div>
            {(item.title || item.buttonText) && (
              <div className="absolute bottom-12 left-0 right-0 text-center text-white">
                {item.title && <h3 className="text-3xl font-serif mb-2">{item.title}</h3>}
                {item.subtitle && (
                  <p className="text-sm uppercase tracking-wider mb-6">{item.subtitle}</p>
                )}
                {item.buttonText && (
                  <Link
                    href={item.buttonLink || '#'}
                    className="bg-black text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    {item.buttonText}
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </section>
    );
  };

  // Newsletter Section
  const renderNewsletter = () => {
    if (!newsletter || !newsletter.enabled) return null;

    return (
      <section className="bg-[#f5f5f5] py-10 border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-16">
            <div className="flex flex-col gap-2 max-w-md">
              <div className="flex items-center gap-3 mb-1">
                <svg
                  className="w-6 h-6 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-black">
                  {newsletter.title || 'STAY TUNED'}
                </h3>
              </div>
              {newsletter.description && (
                <p className="text-gray-500 text-sm leading-relaxed">
                  {newsletter.description}
                </p>
              )}
            </div>
            <div className="w-full lg:w-auto flex-1 max-w-3xl">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-0 w-full">
                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    className="bg-white/50 border border-gray-300 border-r-0 sm:border-r-0 py-3 px-4 text-sm outline-none focus:bg-white focus:border-gray-400 transition-all w-full sm:flex-1 placeholder:text-gray-400"
                  />
                  <input
                    type="tel"
                    placeholder="Enter Mobile Number"
                    className="bg-white/50 border border-gray-300 py-3 px-4 text-sm outline-none focus:bg-white focus:border-gray-400 transition-all w-full sm:flex-1 placeholder:text-gray-400"
                  />
                  <button className="bg-black text-white px-8 py-3 text-sm uppercase tracking-wider font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap mt-4 sm:mt-0">
                    Subscribe
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-6 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="region"
                        defaultChecked
                        className="peer appearance-none w-4 h-4 border-2 border-black rounded-full checked:bg-black checked:border-black transition-all"
                      />
                      <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-black transition-colors">
                      I live in Bangladesh
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="region"
                        className="peer appearance-none w-4 h-4 border-2 border-gray-400 rounded-full checked:bg-black checked:border-black transition-all"
                      />
                      <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-black transition-colors">
                      I live outside Bangladesh
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-white">
      {categoryId ? <CategoryBanner categoryId={categoryId} /> : renderHero()}
      {renderCategoryGrid()}
      {renderFeaturedCollections()}
      {renderProductSection(recommended, recommended?.title)}
      {renderProductSection(trending, trending?.title)}
      {renderPromoBanner()}
      {renderTwoColumnBanners()}
      {renderNewsletter()}
    </main>
  );
};

export default PageLayout;

