import clsx from 'clsx';
import { AlertCircle } from 'lucide-react';
import { Fragment } from 'react';

import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog';

function FailedPhotoPlaceholder() {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
      <div className="flex h-full w-full flex-col items-center justify-center border-2 border-dashed border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-1.5">
        <AlertCircle className="mb-1 h-6 w-6 text-red-400" />
        <span className="text-xs font-medium text-red-500">Failed to load</span>
      </div>
    </div>
  );
}

export default function PhotosGrid({
  imageURLs,
  isMsgFailed = false,
}: {
  imageURLs: Array<string | null>;
  isMsgFailed?: boolean;
}) {
  if (isMsgFailed) {
    return (
      <div
        className={clsx([
          'mb-2',
          imageURLs.length === 1 && 'max-w-xs',
          imageURLs.length === 2 && 'max-w-sm',
          imageURLs.length === 3 && 'max-w-md',
          imageURLs.length >= 4 && 'max-w-lg',
        ])}
      >
        <div
          className={clsx([
            'grid gap-1',
            imageURLs.length === 1 && 'grid-cols-1',
            imageURLs.length === 2 && 'grid-cols-2',
            imageURLs.length === 3 && 'grid-cols-3',
            imageURLs.length === 4 && 'grid-cols-2',
            imageURLs.length >= 5 && 'grid-cols-3',
          ])}
        >
          {imageURLs.map((_, idx) => (
            <FailedPhotoPlaceholder key={idx} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Dialog>
      <div
        className={clsx([
          'mb-2',
          imageURLs.length === 1 && 'max-w-xs',
          imageURLs.length === 2 && 'max-w-sm',
          imageURLs.length === 3 && 'max-w-md',
          imageURLs.length >= 4 && 'max-w-lg',
        ])}
      >
        <div
          className={clsx([
            'grid gap-1',
            imageURLs.length === 1 && 'grid-cols-1',
            imageURLs.length === 2 && 'grid-cols-2',
            imageURLs.length === 3 && 'grid-cols-3',
            imageURLs.length === 4 && 'grid-cols-2',
            imageURLs.length >= 5 && 'grid-cols-3',
          ])}
        >
          {imageURLs.map((url, idx) => (
            <Fragment key={`${url}-${idx}`}>
              {url ? (
                <>
                  <DialogTrigger>
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={url}
                        alt={`Image ${idx + 1}`}
                        className="h-full w-full cursor-pointer object-cover transition-all hover:brightness-95"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <img
                      src={url}
                      alt={`Image ${idx + 1}`}
                      className="h-full w-full"
                    />
                  </DialogContent>
                </>
              ) : (
                <FailedPhotoPlaceholder />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
