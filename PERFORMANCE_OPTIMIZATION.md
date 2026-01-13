# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Shilpalay e-commerce platform.

## 1. Image Optimization

### Next.js Image Configuration

The `next.config.mjs` has been configured with:
- **AVIF and WebP formats** - Modern image formats for better compression
- **Responsive image sizes** - Multiple device sizes for optimal loading
- **Minimum cache TTL** - 60 seconds for image caching
- **Remote patterns** - Configured for Cloudinary and other CDNs

### OptimizedImage Component

Use the `OptimizedImage` component instead of regular `Image`:

```jsx
import OptimizedImage from '@/app/components/ui/OptimizedImage';

<OptimizedImage
  src={product.images.thumbnail}
  alt={product.name}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  quality={85}
  priority={isAboveFold}
/>
```

**Benefits:**
- Automatic blur placeholder
- Error handling
- Loading states
- Better defaults

### Image Best Practices

1. **Use appropriate sizes**
   - Thumbnails: 200-400px
   - Product cards: 400-600px
   - Hero images: 1200-1920px

2. **Set priority for above-fold images**
   ```jsx
   <OptimizedImage priority src="..." />
   ```

3. **Use lazy loading for below-fold images**
   ```jsx
   <OptimizedImage loading="lazy" src="..." />
   ```

## 2. Caching Strategy

### In-Memory Cache

The `src/lib/cache.js` provides in-memory caching:

```jsx
import { getCache, setCache, generateCacheKey } from '@/lib/cache';

// In API route
const cacheKey = generateCacheKey('products', { category: 'fashion' });
const cached = getCache(cacheKey);

if (cached) {
  return NextResponse.json(cached);
}

// Fetch from database
const products = await Product.find(query).lean();
setCache(cacheKey, products, 300); // Cache for 5 minutes
```

### HTTP Caching Headers

API routes return appropriate cache headers:

```jsx
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },
});
```

**Cache TTL Guidelines:**
- **Static data** (categories, navigation): 10 minutes
- **Product listings**: 5 minutes
- **User-specific data**: No cache
- **Frequently changing data**: 1-2 minutes

### Cache Invalidation

When data changes, invalidate cache:

```jsx
import { deleteCache, generateCacheKey } from '@/lib/cache';

// After updating category
deleteCache(generateCacheKey('categories', {}));
deleteCache('navigation'); // Clear navigation cache
```

## 3. Database Indexing

### Indexes Added

All models now have proper indexes for common queries:

**Product Model:**
- `slug`, `sku`, `category`, `status`
- `flags.featured`, `flags.trending`, `flags.recommended`
- Compound indexes for common query patterns

**Order Model:**
- `orderNumber`, `customer`, `status`, `createdAt`
- `trackingNumber` (for tracking queries)

**Category Models:**
- `slug`, `status`, `sortOrder`
- Compound indexes for filtering

**User Model:**
- `email`, `role`
- Compound index for email + role queries

### Query Optimization

1. **Use `.lean()` for read-only queries**
   ```jsx
   const products = await Product.find(query).lean();
   ```

2. **Select only needed fields**
   ```jsx
   const products = await Product.find(query)
     .select('name slug price images')
     .lean();
   ```

3. **Use compound indexes for filtered queries**
   ```jsx
   // This uses the compound index: { status: 1, category: 1 }
   const products = await Product.find({
     status: 'published',
     category: categoryId
   });
   ```

## 4. CDN Setup

### Configuration

Add to `.env.local`:
```env
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
```

### Using CDN Utilities

```jsx
import { getCDNUrl, getOptimizedImageUrl } from '@/lib/cdn';

// Get CDN URL for static assets
const logoUrl = getCDNUrl('/logo/logo.png');

// Get optimized Cloudinary image
const optimizedImage = getOptimizedImageUrl(imageUrl, {
  width: 800,
  height: 600,
  quality: 85,
  format: 'webp',
  crop: 'fill'
});
```

### CDN Providers

**Recommended:**
- **Cloudinary** - Already integrated for images
- **Vercel** - Automatic CDN for static assets
- **AWS CloudFront** - For custom CDN setup
- **Cloudflare** - Free CDN option

### Static Assets

Next.js automatically serves static assets from `/public` with CDN:
- Images: `/public/images/*`
- Fonts: `/public/fonts/*`
- Icons: `/public/logo/*`

## 5. Performance Monitoring

### Cache Statistics

Check cache performance:

```jsx
import { getCacheStats } from '@/lib/cache';

const stats = getCacheStats();
console.log('Cache stats:', stats);
// { total: 50, active: 45, expired: 5 }
```

### API Response Headers

Check cache status:
- `X-Cache: HIT` - Served from cache
- `X-Cache: MISS` - Fetched from database

## 6. Best Practices

### Do's ✅

1. **Cache frequently accessed data**
   - Categories, navigation, static pages
   - Product listings (with appropriate TTL)

2. **Use indexes for filtered queries**
   - Always index fields used in `find()` queries
   - Use compound indexes for multiple filters

3. **Optimize images**
   - Use `OptimizedImage` component
   - Set appropriate sizes
   - Use WebP/AVIF formats

4. **Use `.lean()` for read-only queries**
   - Faster queries
   - Less memory usage

### Don'ts ❌

1. **Don't cache user-specific data**
   - User orders, cart, wishlist
   - Personal information

2. **Don't over-index**
   - Only index fields used in queries
   - Too many indexes slow down writes

3. **Don't use large images**
   - Optimize before upload
   - Use appropriate dimensions

4. **Don't forget to invalidate cache**
   - Clear cache when data changes
   - Use appropriate TTL

## 7. Performance Metrics

### Target Metrics

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1

### Monitoring Tools

- **Lighthouse** - Built into Chrome DevTools
- **WebPageTest** - Online performance testing
- **Vercel Analytics** - Built-in analytics (if using Vercel)

## 8. Future Optimizations

- [ ] Implement Redis for distributed caching
- [ ] Add service worker for offline support
- [ ] Implement code splitting for routes
- [ ] Add image CDN for all static images
- [ ] Implement database query result caching
- [ ] Add response compression (gzip/brotli)

---

**Last Updated**: $(date)
**Version**: 1.0
