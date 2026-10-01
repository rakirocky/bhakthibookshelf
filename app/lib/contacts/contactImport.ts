import "server-only";

import ExcelJS from "exceljs";

/**
 * Reading the client's contact lists (Admin → Contacts → Import).
 *
 * Accepts .xlsx and .csv. The columns are found by their heading
 * (English or Kannada: "Name", "Mobile", "Phone", "ಹೆಸರು", "ಮೊಬೈಲ್",
 * "Language"…); a sheet with no heading row still works — the column
 * with the most phone-like values is taken as the phone column.
 */

export type ImportedContact = {
  phone: string;
  name: string | null;
  language: "en" | "kn" | null;
};

export type ParsedImport = {
  totalRows: number;
  contacts: ImportedContact[];
  invalid: { row: number; value: string }[];
  duplicatesInFile: number;
  columns: { phone: string; name: string | null; language: string | null };
};

/**
 * Indian mobile number → its 10 digits, the way customers.phone stores
 * them. Accepts +91 / 91 / 0 prefixes, spaces, dashes and brackets, and
 * numbers Excel turned into floats ("9876543210.0").
 */
export function normalizePhone(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).trim();
  if (/^\d+\.0+$/.test(s)) s = s.replace(/\.0+$/, "");
  let digits = s.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

function normalizeLanguage(raw: string): "en" | "kn" | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (s === "kn" || s.startsWith("kan") || s.includes("ಕನ್ನಡ")) return "kn";
  if (s === "en" || s.startsWith("eng") || s.includes("ಇಂಗ್ಲಿಷ್")) return "en";
  return null;
}

function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (value instanceof Date) return value.toISOString();
    if ("richText" in value) return value.richText.map((r) => r.text).join("");
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value) return value.result === undefined ? "" : String(value.result);
    return "";
  }
  return String(value);
}

async function readXlsx(buffer: ArrayBuffer): Promise<string[][]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets.find((ws) => ws.actualRowCount > 0);
  if (!sheet) return [];
  const rows: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = [];
    for (let c = 1; c <= row.cellCount; c++) cells.push(cellText(row.getCell(c).value).trim());
    rows.push(cells);
  });
  return rows;
}

/** Minimal RFC 4180 CSV reader (quoted fields, "" escapes, CRLF). */
function readCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field.trim()); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field.trim()); field = "";
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field.trim());
  if (row.some((c) => c !== "")) rows.push(row);
  return rows;
}

const PHONE_HEADER = /phone|mobile|mob\b|number|contact|whats ?app|cell|ಮೊಬೈಲ್|ಫೋನ್|ದೂರವಾಣಿ|ಸಂಖ್ಯೆ/i;
const NAME_HEADER = /name|ಹೆಸರು/i;
const LANG_HEADER = /lang|ಭಾಷೆ/i;

export async function parseContactFile(
  filename: string,
  data: ArrayBuffer
): Promise<ParsedImport> {
  const lower = filename.toLowerCase();
  let rows: string[][];
  if (lower.endsWith(".xlsx")) rows = await readXlsx(data);
  else if (lower.endsWith(".csv")) rows = readCsv(new TextDecoder().decode(data));
  else throw new Error("Please upload an Excel .xlsx or a .csv file. (Old .xls files: open in Excel and “Save As” .xlsx.)");

  if (rows.length === 0) throw new Error("The file has no rows.");

  // A heading row is one that names a phone column and has no phone number
  // in it. Look in the first 5 rows (some sheets have a title line first).
  let headerIndex = -1;
  for (let r = 0; r < Math.min(5, rows.length); r++) {
    const cells = rows[r];
    if (cells.some((c) => PHONE_HEADER.test(c)) && !cells.some((c) => normalizePhone(c))) {
      headerIndex = r;
      break;
    }
  }

  const width = Math.max(...rows.map((r) => r.length));
  let phoneCol = -1, nameCol = -1, langCol = -1;
  const header = headerIndex >= 0 ? rows[headerIndex] : [];
  if (headerIndex >= 0) {
    phoneCol = header.findIndex((c) => PHONE_HEADER.test(c));
    nameCol = header.findIndex((c, i) => i !== phoneCol && NAME_HEADER.test(c));
    langCol = header.findIndex((c, i) => i !== phoneCol && LANG_HEADER.test(c));
  }

  const body = rows.slice(headerIndex + 1);
  if (phoneCol < 0) {
    // No heading: the column with the most valid numbers in the first 200 rows.
    let best = 0;
    for (let c = 0; c < width; c++) {
      const hits = body.slice(0, 200).filter((r) => normalizePhone(r[c])).length;
      if (hits > best) { best = hits; phoneCol = c; }
    }
    if (phoneCol < 0) throw new Error("Couldn't find a column with mobile numbers in this file.");
    // Name = the first other column that is mostly text, not digits.
    for (let c = 0; c < width && nameCol < 0; c++) {
      if (c === phoneCol) continue;
      const sample = body.slice(0, 50).map((r) => r[c] ?? "").filter(Boolean);
      if (sample.length && sample.filter((v) => /[^\d\s+\-()]/.test(v)).length / sample.length > 0.6) nameCol = c;
    }
  }

  const contacts: ImportedContact[] = [];
  const invalid: { row: number; value: string }[] = [];
  const seen = new Set<string>();
  let duplicatesInFile = 0;
  let totalRows = 0;

  body.forEach((r, i) => {
    const rawPhone = r[phoneCol] ?? "";
    const rawName = nameCol >= 0 ? r[nameCol] ?? "" : "";
    if (!rawPhone && !rawName) return; // blank line
    totalRows++;
    const phone = normalizePhone(rawPhone);
    if (!phone) {
      invalid.push({ row: headerIndex + 2 + i, value: rawPhone || "(empty)" });
      return;
    }
    if (seen.has(phone)) { duplicatesInFile++; return; }
    seen.add(phone);
    contacts.push({
      phone,
      name: rawName ? rawName.slice(0, 150) : null,
      language: langCol >= 0 ? normalizeLanguage(r[langCol] ?? "") : null,
    });
  });

  const label = (c: number) =>
    c < 0 ? null : headerIndex >= 0 && header[c] ? header[c] : `Column ${String.fromCharCode(65 + c)}`;

  return {
    totalRows,
    contacts,
    invalid,
    duplicatesInFile,
    columns: { phone: label(phoneCol)!, name: label(nameCol), language: label(langCol) },
  };
}
