"use client";

import Image from 'next/image';
import { useState } from 'react';
import { cloudinaryLoader, getResponsiveSizes } from '@/lib/cdn';

const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

/**
 * Optimized Image — Cloudinary CDN transforms + Next.js responsive srcSet.
 * Hero/LCP images: pass priority. Below-fold: lazy by default.
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  sizes,
  sizePreset,
  className = '',
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onError,
  ...props
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
        role="img"
        aria-label={alt || 'Image not available'}
      >
        <span className="text-gray-400 text-xs">Image not available</span>
      </div>
    );
  }

  const isCloudinary = typeof src === 'string' && src.includes('res.cloudinary.com');
  const resolvedSizes = sizes || getResponsiveSizes(sizePreset || 'default');

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  const imageProps = {
    src,
    alt: alt || '',
    className,
    onError: handleError,
    quality,
    sizes: resolvedSizes,
    placeholder,
    blurDataURL: blurDataURL || BLUR_DATA_URL,
    ...(isCloudinary ? { loader: cloudinaryLoader } : {}),
    ...(priority
      ? { priority: true, fetchPriority: 'high' }
      : { loading: 'lazy', decoding: 'async' }),
    ...props,
  };

  if (fill) {
    return <Image {...imageProps} fill />;
  }

  return <Image {...imageProps} width={width} height={height} />;
}
