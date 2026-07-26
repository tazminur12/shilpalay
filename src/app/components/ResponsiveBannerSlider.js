"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImage from './ui/OptimizedImage';

/**
 * Mobile-first banner carousel.
 * - cover: crops to fill a fixed aspect box (editorial look)
 * - contain/full: shows the full designed image using a spacer (Looklify-style)
 */
export default function ResponsiveBannerSlider({
  banners = [],
  aspectClass = 'aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]',
  sizePreset = 'hero',
  imageFit = 'cover', // 'cover' | 'contain'
  imageClassName,
  titleClassName = 'text-3xl sm:text-4xl lg:text-6xl',
  overlayClassName,
  autoPlay = true,
  interval = 5000,
  showCta = true,
  ariaLabel = 'Promotional banner carousel',
  loading = false,
  backgroundClassName = 'bg-white',
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);
  const draggedRef = useRef(false);

  const count = banners.length;
  const showFullImage = imageFit === 'contain';
  const resolvedImageClass =
    imageClassName ||
    (showFullImage ? 'object-contain object-center' : 'object-cover object-center');
  const resolvedOverlay =
    overlayClassName !== undefined
      ? overlayClassName
      : showFullImage
        ? ''
        : 'bg-gradient-to-t from-black/45 via-black/10 to-black/10';

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (currentIndex >= count) setCurrentIndex(0);
  }, [count, currentIndex]);

  const goToNext = useCallback(() => {
    if (count > 1) setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const goToPrevious = useCallback(() => {
    if (count > 1) setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (!autoPlay || count <= 1 || isPaused || isDragging || reducedMotion) return;
    const timer = window.setInterval(goToNext, interval);
    return () => window.clearInterval(timer);
  }, [autoPlay, count, goToNext, interval, isDragging, isPaused, reducedMotion]);

  const handlePointerDown = (event) => {
    if (count <= 1) return;
    startXRef.current = event.clientX;
    startTimeRef.current = Date.now();
    draggedRef.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || count <= 1) return;
    const offset = event.clientX - startXRef.current;
    if (Math.abs(offset) > 6) draggedRef.current = true;
    setDragOffset(Math.max(-120, Math.min(120, offset)));
  };

  const finishDrag = (event) => {
    if (!isDragging) return;
    const offset = event.clientX - startXRef.current;
    const elapsed = Date.now() - startTimeRef.current;
    const shouldMove = Math.abs(offset) > 55 || (Math.abs(offset) > 30 && elapsed < 300);

    if (shouldMove) {
      if (offset < 0) goToNext();
      else goToPrevious();
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  const blockClickAfterDrag = (event) => {
    if (draggedRef.current) {
      event.preventDefault();
      draggedRef.current = false;
    }
  };

  if (loading) {
    return (
      <div
        className={`relative w-full ${showFullImage ? 'min-h-[180px] aspect-[16/9]' : aspectClass} ${backgroundClassName} animate-pulse`}
      />
    );
  }

  if (count === 0) return null;

  const firstImage = banners[0]?.image;

  return (
    <section
      className={`relative w-full overflow-hidden ${backgroundClassName} select-none touch-pan-y m-0 ${
        showFullImage ? '' : aspectClass
      }`}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={() => {
        setIsDragging(false);
        setDragOffset(0);
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      style={{
        cursor: count > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Looklify-style spacer: keeps natural image height so the full creative shows */}
      {showFullImage && firstImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={firstImage}
          alt=""
          aria-hidden="true"
          className="block w-full h-auto opacity-0 pointer-events-none select-none"
          draggable={false}
        />
      )}

      <div
        className={showFullImage ? 'absolute inset-0 w-full h-full' : 'absolute inset-0'}
        style={{
          transform: dragOffset ? `translate3d(${dragOffset}px,0,0)` : undefined,
          transition: isDragging || reducedMotion ? 'none' : 'transform 250ms ease-out',
        }}
      >
        {banners.map((banner, index) => {
          let opacity = 0;
          if (!isDragging) {
            opacity = index === currentIndex ? 1 : 0;
          } else if (index === currentIndex) {
            opacity = 1 - Math.abs(dragOffset) / 200;
          } else if (index === (currentIndex + 1) % count && dragOffset < 0) {
            opacity = Math.abs(dragOffset) / 200;
          } else if (index === (currentIndex - 1 + count) % count && dragOffset > 0) {
            opacity = Math.abs(dragOffset) / 200;
          }

          return (
            <div
              key={banner._id || index}
              className="absolute inset-0 overflow-hidden"
              style={{
                opacity,
                zIndex: index === currentIndex ? 10 : 5,
                transition: isDragging || reducedMotion ? 'none' : 'opacity 300ms ease-out',
                pointerEvents: index === currentIndex ? 'auto' : 'none',
              }}
              aria-hidden={index !== currentIndex}
            >
              {banner.image ? (
                <OptimizedImage
                  src={banner.image}
                  alt={banner.title || `Banner ${index + 1}`}
                  fill
                  sizePreset={sizePreset}
                  className={resolvedImageClass}
                  priority={index === 0}
                  quality={85}
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}

              {resolvedOverlay ? <div className={`absolute inset-0 ${resolvedOverlay}`} /> : null}

              {(banner.title || (showCta && banner.link)) && (
                <div
                  className={`absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-5 sm:px-8 ${
                    showFullImage ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  {banner.title && (
                    <h2
                      className={`${titleClassName} max-w-4xl font-bold tracking-tight ${
                        showFullImage ? '' : 'drop-shadow-lg'
                      }`}
                    >
                      {banner.title}
                    </h2>
                  )}
                  {showCta && banner.link && (
                    <Link
                      href={banner.link}
                      onClick={blockClickAfterDrag}
                      className={`mt-5 inline-flex min-h-11 items-center justify-center px-7 sm:px-9 py-2.5 text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold transition-colors ${
                        showFullImage
                          ? 'bg-black text-white hover:bg-gray-800'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      Shop Now
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className={`hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 min-w-11 min-h-11 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
              showFullImage
                ? 'bg-black/15 text-black hover:bg-black/25'
                : 'bg-black/25 text-white hover:bg-black/45'
            }`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className={`hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 min-w-11 min-h-11 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
              showFullImage
                ? 'bg-black/15 text-black hover:bg-black/25'
                : 'bg-black/25 text-white hover:bg-black/45'
            }`}
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                  index === currentIndex
                    ? showFullImage
                      ? 'w-7 bg-black'
                      : 'w-7 bg-white'
                    : showFullImage
                      ? 'w-2 bg-black/35 hover:bg-black/55'
                      : 'w-2 bg-white/55 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
