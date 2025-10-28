interface UploadResponse {
  success: boolean;
  data: {
    fileUrl: string;
    filename: string;
    mimeType: string;
    size: number;
  };
}

export type { UploadResponse };
