import { NextResponse } from "next/server";

import { uploadEbook, uploadSamplePdf } from "@/app/lib/upload/pdfUpload";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const type = formData.get("type");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No file provided.",
        },
        {
          status: 400,
        }
      );
    }

    if (type !== "sample" && type !== "ebook") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid PDF type. Expected 'sample' or 'ebook'.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      type === "sample"
        ? await uploadSamplePdf(file)
        : await uploadEbook(file);

    if (!result.success) {
      return NextResponse.json(result, {
        status: 400,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed.",
      },
      {
        status: 500,
      }
    );
  }
}
