import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

import {
  UploadCategory,
  UploadResult,
  UploadRules,
} from "./uploadTypes";

function extension(name: string): string {
  return path.extname(name).toLowerCase();
}

export async function uploadFile(
  file: File,
  category: UploadCategory
): Promise<UploadResult> {
  const rule = UploadRules[category];

  if (!rule.allowedMimeTypes.includes(file.type)) {
    return {
      success: false,
      message: "Invalid file type.",
    };
  }

  const ext = extension(file.name);

  if (!rule.allowedExtensions.includes(ext)) {
    return {
      success: false,
      message: "Invalid file extension.",
    };
  }

  if (file.size > rule.maxSize) {
    return {
      success: false,
      message: "File exceeds maximum size.",
    };
  }

  await fs.mkdir(rule.folder, {
    recursive: true,
  });

  const fileName = `${uuid()}${ext}`;

  const destination = path.join(
    process.cwd(),
    rule.folder,
    fileName
  );

  const bytes = await file.arrayBuffer();

  await fs.writeFile(
    destination,
    Buffer.from(bytes)
  );

  return {
    success: true,
    message: "Upload successful.",
    fileName,
    relativePath: `${rule.folder}/${fileName}`,
  };
}
