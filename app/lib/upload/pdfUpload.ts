import { uploadFile } from "./fileUpload";
import { UploadResult } from "./uploadTypes";

/**
 * Upload sample PDF.
 *
 * Max Size:
 * 20 MB
 */
export async function uploadSamplePdf(
  file: File
): Promise<UploadResult> {
  return uploadFile(file, "sample");
}

/**
 * Upload full eBook PDF.
 *
 * Max Size:
 * 100 MB
 */
export async function uploadEbook(
  file: File
): Promise<UploadResult> {
  return uploadFile(file, "ebook");
}
