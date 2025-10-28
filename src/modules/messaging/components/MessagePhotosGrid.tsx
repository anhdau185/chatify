import clsx from 'clsx';
import { Fragment } from 'react';

import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog';

export default function MessagePhotosGrid({
  imageURLs,
}: {
  imageURLs: string[];
}) {
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
            </Fragment>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
