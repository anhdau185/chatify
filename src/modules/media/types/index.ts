interface UploadMultipleResponse {
  totalFiles: number;
  successful: number;
  failed: number;
  results: Array<
    | {
        success: true;
        data: {
          fileUrl: string;
          originalFilename: string;
          storedFilename: string;
          mimeType: string;
          encoding: string;
        };
      }
    | {
        success: false;
        data: {
          filename: string;
          errors: string[];
        };
      }
  >;
  uploadTime: number;
}

export type { UploadMultipleResponse };
