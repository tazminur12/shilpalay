"use client";

import { Loader2 } from 'lucide-react';

export default function Loading({ 
  text = 'Loading...', 
  size = 'md',
  fullScreen = false,
  className = '' 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerClass = fullScreen 
    ? 'flex items-center justify-center min-h-screen bg-white'
    : 'flex items-center justify-center py-12';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-gray-400 mx-auto mb-4`} />
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}
