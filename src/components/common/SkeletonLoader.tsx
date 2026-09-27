import React from 'react';

export const SkeletonLoader: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="w-full space-y-4 animate-pulse p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm" />
      </div>
      <div className="h-56 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg flex items-end p-4 gap-3">
        <div className="h-32 w-full bg-slate-200 dark:bg-slate-700/50 rounded-sm" />
        <div className="h-44 w-full bg-slate-200 dark:bg-slate-700/50 rounded-sm" />
        <div className="h-28 w-full bg-slate-200 dark:bg-slate-700/50 rounded-sm" />
        <div className="h-48 w-full bg-slate-200 dark:bg-slate-700/50 rounded-sm" />
        <div className="h-36 w-full bg-slate-200 dark:bg-slate-700/50 rounded-sm" />
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-7 w-full bg-slate-100 dark:bg-slate-800/40 rounded-sm" />
        ))}
      </div>
    </div>
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded-sm" />
      </div>
      <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
      <div className="h-3 w-36 bg-slate-100 dark:bg-slate-800/70 rounded-sm" />
    </div>
  );
};
