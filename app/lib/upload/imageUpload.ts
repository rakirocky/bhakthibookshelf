import { uploadFile } from "./fileUpload";
import { UploadResult } from "./uploadTypes";

/**
 * Upload a book cover image.
 *
 * Supported:
 * - jpg
 * - jpeg
 * - png
 * - webp
 *
 * Max Size:
 * 5 MB
 */
export async function uploadCoverImage(
  file: File
): Promise<UploadResult> {
  return uploadFile(file, "cover");
}
