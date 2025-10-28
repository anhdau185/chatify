import { useEffect, useMemo } from 'react';

export default function PhotoThumbnail({ file }: { file: File }) {
  const imgURL = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imgURL); // clean up the object URL when component unmounts
    };
  }, [imgURL]);

  return (
    <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
      <img
        src={imgURL}
        alt={`Photo Preview`}
        className="h-14 w-14 object-cover"
      />
    </div>
  );
}
