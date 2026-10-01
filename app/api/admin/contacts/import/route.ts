import { NextResponse } from "next/server";

import { parseContactFile } from "@/app/lib/contacts/contactImport";
import { MarketingContactRepository } from "@/app/lib/repositories/marketingContactRepository";

const MAX_BYTES = 20 * 1024 * 1024;

// Two steps with the same file: without `confirm` it only reads the file
// and reports what would happen (columns found, valid/invalid/duplicate
// counts, numbers already known); with confirm=1 it saves the contacts.
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const confirm = form.get("confirm") === "1";

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, message: "Choose an Excel or CSV file." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, message: "File is larger than 20 MB." }, { status: 400 });
    }

    let parsed;
    try {
      parsed = await parseContactFile(file.name, await file.arrayBuffer());
    } catch (e) {
      return NextResponse.json(
        { success: false, message: e instanceof Error ? e.message : "Couldn't read this file." },
        { status: 400 }
      );
    }

    const summary = {
      columns: parsed.columns,
      totalRows: parsed.totalRows,
      valid: parsed.contacts.length,
      invalid: parsed.invalid.length,
      invalidSamples: parsed.invalid.slice(0, 5),
      duplicatesInFile: parsed.duplicatesInFile,
      sample: parsed.contacts.slice(0, 5),
    };

    if (!confirm) {
      const known = await MarketingContactRepository.alreadyKnown(parsed.contacts.map((c) => c.phone));
      return NextResponse.json({ success: true, preview: true, ...summary, alreadyImported: known.contacts, siteUsers: known.siteUsers });
    }

    if (parsed.contacts.length === 0) {
      return NextResponse.json({ success: false, message: "No valid mobile numbers to import." }, { status: 400 });
    }

    const result = await MarketingContactRepository.importContacts(file.name, parsed.contacts, {
      totalRows: parsed.totalRows,
      invalid: parsed.invalid.length,
      duplicatesInFile: parsed.duplicatesInFile,
    });
    return NextResponse.json({ success: true, preview: false, ...summary, ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Import failed." }, { status: 500 });
  }
}
