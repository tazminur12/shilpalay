/**
 * CDN Configuration and Utilities
 * 
 * This file contains utilities for CDN setup and asset optimization
 */

/**
 * Get CDN URL for static assets
 * @param {string} path - Asset path
 * @returns {string} - Full CDN URL
 */
export function getCDNUrl(path) {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Get CDN base URL from environment or use default
  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL || '';
  
  if (!cdnBase) {
    // If no CDN configured, return relative path
    return `/${cleanPath}`;
  }
  
  // Ensure CDN base doesn't end with slash
  const base = cdnBase.endsWith('/') ? cdnBase.slice(0, -1) : cdnBase;
  
  return `${base}/${cleanPath}`;
}

/**
 * Get optimized image URL with Cloudinary transformations
 * @param {string} imageUrl - Original image URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export function getOptimizedImageUrl(imageUrl, options = {}) {
  if (!imageUrl) return '';
  
  // If already a Cloudinary URL, add transformations
  if (imageUrl.includes('res.cloudinary.com')) {
    const url = new URL(imageUrl);
    const transformations = [];
    
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    
    if (transformations.length > 0) {
      const pathParts = url.pathname.split('/');
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1) {
        pathParts.splice(uploadIndex + 1, 0, transformations.join(','));
        url.pathname = pathParts.join('/');
      }
    }
    
    return url.toString();
  }
  
  // For non-Cloudinary images, return as-is (Next.js will optimize)
  return imageUrl;
}

/**
 * Generate responsive image sizes
 * @param {string} breakpoint - Breakpoint name
 * @returns {string} - Sizes attribute value
 */
export function getResponsiveSizes(breakpoint = 'default') {
  const sizes = {
    thumbnail: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px',
    card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    hero: '100vw',
    gallery: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    default: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  };
  
  return sizes[breakpoint] || sizes.default;
}
