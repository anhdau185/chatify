import clsx from 'clsx';

export default function MessagePhotosGrid({
  imageURLs,
}: {
  imageURLs: string[];
}) {
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
        {imageURLs.map((imgURL, idx) => (
          <div
            key={idx}
            className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"
          >
            <img
              src={imgURL}
              alt={`Image ${idx + 1}`}
              className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-90"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
