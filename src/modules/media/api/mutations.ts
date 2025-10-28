import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { endpoint } from '@shared/lib/utils';
import type { GeneralApiError } from '@shared/types';
import type { UploadResponse } from '../types';

function useUploadSingleFile({
  onSuccess,
}: {
  onSuccess: (res: UploadResponse) => void;
}) {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(endpoint('/media/upload'), {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const { error: errorMsg } =
          await (res.json() as Promise<GeneralApiError>);
        throw new Error(errorMsg || 'Something went wrong on our end :(');
      }

      return res.json() as Promise<UploadResponse>;
    },

    onError({ message }) {
      toast.error(message);
    },

    onSuccess,
  });
}

export { useUploadSingleFile };
