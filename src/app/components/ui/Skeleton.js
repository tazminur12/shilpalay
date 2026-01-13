"use client";

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Skeleton className="w-full h-64" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ProductListSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="space-y-3 mb-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-16 h-16 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-4 border-t">
        <Skeleton className="h-9 w-24 rounded" />
        <Skeleton className="h-9 w-24 rounded" />
      </div>
    </div>
  );
}

export function OrderListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <OrderCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, idx) => (
              <th key={idx} className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
