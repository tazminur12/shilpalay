/**
 * CDN Configuration and Utilities
 *
 * Cloudinary transforms deliver resized WebP/AVIF from the CDN
 * so the browser never downloads full-resolution originals.
 */

/**
 * Get CDN URL for static assets
 * @param {string} path - Asset path
 * @returns {string} - Full CDN URL
 */
export function getCDNUrl(path) {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL || '';

  if (!cdnBase) {
    return `/${cleanPath}`;
  }

  const base = cdnBase.endsWith('/') ? cdnBase.slice(0, -1) : cdnBase;
  return `${base}/${cleanPath}`;
}

/**
 * Strip previously injected Cloudinary transforms so we can re-apply cleanly.
 */
function stripCloudinaryTransforms(imageUrl) {
  return imageUrl.replace(/\/upload\/([^/]+)\//, (match, segment) => {
    const isTransform =
      segment.includes(',') ||
      /^(f_|c_|w_|h_|q_|fl_)/.test(segment);
    return isTransform ? '/upload/' : match;
  });
}

/**
 * Get optimized image URL with Cloudinary transformations
 * @param {string} imageUrl - Original image URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export function getOptimizedImageUrl(imageUrl, options = {}) {
  if (!imageUrl) return '';

  if (!imageUrl.includes('res.cloudinary.com')) {
    return imageUrl;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options;

  const transformations = [];
  if (format) transformations.push(`f_${format}`);
  if (crop) transformations.push(`c_${crop}`);
  if (width) transformations.push(`w_${Math.round(width)}`);
  if (height) transformations.push(`h_${Math.round(height)}`);
  if (quality !== undefined && quality !== null) {
    transformations.push(`q_${quality}`);
  }

  if (transformations.length === 0) return imageUrl;

  const cleaned = stripCloudinaryTransforms(imageUrl);
  return cleaned.replace('/upload/', `/upload/${transformations.join(',')}/`);
}

/**
 * Next.js Image loader — builds responsive Cloudinary URLs for srcSet.
 * Non-Cloudinary URLs pass through unchanged.
 */
export function cloudinaryLoader({ src, width, quality }) {
  if (!src) return src;

  if (src.includes('res.cloudinary.com')) {
    return getOptimizedImageUrl(src, {
      width,
      quality: quality || 'auto',
      format: 'auto',
      crop: 'limit',
    });
  }

  return src;
}

/**
 * Generate responsive image sizes
 * @param {string} breakpoint - Breakpoint name
 * @returns {string} - Sizes attribute value
 */
export function getResponsiveSizes(breakpoint = 'default') {
  const sizes = {
    thumbnail: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px',
    card: '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 320px',
    category: '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 400px',
    half: '(max-width: 768px) 100vw, 50vw',
    hero: '100vw',
    banner: '100vw',
    gallery: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    default: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  };

  return sizes[breakpoint] || sizes.default;
}
