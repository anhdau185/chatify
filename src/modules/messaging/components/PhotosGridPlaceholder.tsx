import clsx from 'clsx';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

export default function PhotosGridPlaceholder({
  pendingUploads,
}: {
  pendingUploads: number;
}) {
  return (
    <div className="mb-2 max-w-lg">
      <div
        className={clsx([
          'grid gap-1',
          pendingUploads === 1 && 'grid-cols-1',
          pendingUploads === 2 && 'grid-cols-2',
          pendingUploads === 3 && 'grid-cols-3',
          pendingUploads === 4 && 'grid-cols-2',
          pendingUploads >= 5 && 'grid-cols-3',
        ])}
      >
        {Array.from({
          length: pendingUploads,
        }).map((_, idx) => (
          <div
            key={idx}
            className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-purple-100"
          >
            {/* Shimmer Effect */}
            <div
              className="animate-shimmer absolute inset-0"
              style={{
                animation: 'shimmer 2s infinite linear',
                animationDelay: `${idx * 0.3}s`,
              }}
            />
            <ImageIcon className="relative z-10 h-8 w-8 text-blue-400" />
            {/* Progress Bar */}
            <div className="absolute right-0 bottom-0 left-0 h-1 overflow-hidden bg-blue-200/30">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                style={{
                  animation: 'progress 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>
          {pendingUploads > 1
            ? `Uploading ${pendingUploads} photos...`
            : 'Uploading photo...'}
        </span>
      </div>
    </div>
  );
}
