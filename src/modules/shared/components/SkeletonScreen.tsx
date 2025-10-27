import clsx from 'clsx';

import { Skeleton } from '@components/ui/skeleton';

export default function SkeletonScreen() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Skeleton */}
      <div className="flex w-80 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        <div className="flex-1 space-y-3 p-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area Skeleton */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <div className="flex-1 space-y-4 p-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className={clsx([
                'flex',
                i % 2 === 0 ? 'justify-end' : 'justify-start',
              ])}
            >
              <div
                className={clsx([
                  'flex gap-2',
                  i % 2 === 0 && 'flex-row-reverse',
                ])}
              >
                {i % 2 !== 0 && (
                  <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
                )}
                <div>
                  <Skeleton
                    className={clsx([
                      'h-16',
                      i % 2 === 0 ? 'w-72' : 'w-56',
                      'rounded-2xl',
                    ])}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 bg-white p-4">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
