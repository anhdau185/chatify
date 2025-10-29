import { useMutation } from '@tanstack/react-query';

import { endpoint } from '@shared/lib/utils';
import type { GeneralApiError } from '@shared/types';
import type { UploadMultipleResponse } from '../types';

function useUploadMultiple() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const res = await fetch(endpoint('/media/upload/multiple'), {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const { error: errorMsg } =
          await (res.json() as Promise<GeneralApiError>);
        throw new Error(errorMsg || 'Something went wrong on our end :(');
      }

      return res.json() as Promise<UploadMultipleResponse>;
    },
  });
}

export { useUploadMultiple };
