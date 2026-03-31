import React from 'react';

const Skeleton = ({ className = '', style }) => (
  <div
    className={`animate-pulse bg-[var(--border)] rounded ${className}`}
    style={style}
  />
);

export const StatsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-end">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-9 w-32 ml-2" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <Skeleton className="h-16 w-48" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-[300px]" />
      <Skeleton className="h-[300px]" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-[300px]" />
      <Skeleton className="h-[300px]" />
    </div>
    <Skeleton className="h-[300px]" />
  </div>
);

export default Skeleton;
