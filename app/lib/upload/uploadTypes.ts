export type UploadCategory =
  | "cover"
  | "sample"
  | "ebook";

export interface UploadRule {
  folder: string;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxSize: number;
}

export interface UploadResult {
  success: boolean;
  message: string;
  fileName?: string;
  relativePath?: string;
}

export const UploadRules: Record<UploadCategory, UploadRule> = {
  cover: {
    folder: "storage/covers",
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
    allowedExtensions: [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
    ],
    maxSize: 5 * 1024 * 1024,
  },

  sample: {
    folder: "storage/samples",
    allowedMimeTypes: [
      "application/pdf",
    ],
    allowedExtensions: [
      ".pdf",
    ],
    maxSize: 20 * 1024 * 1024,
  },

  ebook: {
    folder: "storage/ebooks",
    allowedMimeTypes: [
      "application/pdf",
    ],
    allowedExtensions: [
      ".pdf",
    ],
    maxSize: 100 * 1024 * 1024,
  },
};
