"use client";

import Image from 'next/image';
import { useState } from 'react';

/**
 * Optimized Image Component
 * Wrapper around Next.js Image with better defaults and loading states
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  sizes,
  className = '',
  quality = 85,
  loading = 'lazy',
  placeholder = 'blur',
  blurDataURL,
  onError,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate default sizes if not provided
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = blurDataURL || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = (e) => {
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? {} : { width, height }}
        role="img"
        aria-label={alt || 'Image failed to load'}
      >
        <span className="text-gray-400 text-xs">Image not available</span>
      </div>
    );
  }

  const imageProps = {
    src,
    alt: alt || '',
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onLoad: handleLoad,
    onError: handleError,
    quality,
    loading: priority ? undefined : loading,
    priority,
    ...props,
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        sizes={defaultSizes}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
      sizes={defaultSizes}
      placeholder={placeholder}
      blurDataURL={defaultBlurDataURL}
    />
  );
}
