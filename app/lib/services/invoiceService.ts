// The standalone build embeds pdfkit's standard font metrics directly
// in the JS bundle, instead of reading them from a separate .afm file
// on disk at runtime. The regular "pdfkit" entry point does the latter
// via a path relative to its own location — which breaks under
// Turbopack's production bundling (the path gets rewritten to an
// internal virtual location, "/ROOT/...", that doesn't exist on the
// real filesystem). This avoids the problem instead of working around
// it with bundler config that Turbopack doesn't fully honor yet.
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { readFileSync } from "node:fs";
import path from "node:path";

import { StoreSettings } from "../types/settings";
import { formatInvoiceNumber } from "../invoiceNumber";

export { formatInvoiceNumber };

// pdfkit's built-in Helvetica has no ₹ glyph (it printed as "¹"), so the
// invoice embeds Noto Sans (OFL, /assets/fonts), which has it and
// matches the website's body font. Read once, on first use.
let fonts: { regular: Buffer; bold: Buffer } | null = null;

function invoiceFonts() {
  if (!fonts) {
    const dir = path.join(/*turbopackIgnore: true*/ process.cwd(), "assets", "fonts");
    fonts = {
      regular: readFileSync(path.join(/*turbopackIgnore: true*/ dir, "NotoSans-Regular.ttf")),
      bold: readFileSync(path.join(/*turbopackIgnore: true*/ dir, "NotoSans-Bold.ttf")),
    };
  }
  return fonts;
}

// GST as per the client's reference invoices (2026-10-14): one SAC for
// everything (4-digit heading, owner 2026-10-14), 5% on individual eBooks, 18% on the lifetime plan. Prices
// are GST-inclusive, so tax is carved out of the amount paid.
const SAC_CODE = "9984";
const EBOOK_GST_PERCENT = 5;
const LIFETIME_GST_PERCENT = 18;
const TAGLINE = "A Home for Devotional Reading";

interface InvoiceOrder {
  id: number;
  order_number: string;
  customer_name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gst_number: string | null;
  total_amount: number | string;
  created_at: string;
  invoice_no?: number | null;
  invoiced_at?: string | null;
  items: {
    book_title: string;
    quantity: number;
    price: number | string;
    subtotal: number | string;
  }[];
}

interface InvoiceSubscription {
  id: number;
  amount: number | string;
  plan_name: string;
  created_at: string;
  invoice_no?: number | null;
  invoiced_at?: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  /** From the customer's latest order, if any — subscribe collects no address. */
  customer_state: string | null;
}

interface InvoiceData {
  kind: "EB" | "LT";
  invoiceNo: number | null;
  date: string;
  billTo: {
    name: string;
    lines: string[];
    state: string | null;
    country: string | null;
    gstin: string | null;
  };
  /** GST-inclusive amounts, in rupees. */
  items: { description: string; amount: number }[];
  gstPercent: number;
  notes: string[];
}

export function generateInvoicePdf(
  order: InvoiceOrder,
  settings: StoreSettings
): Promise<Buffer> {
  return renderInvoice(
    {
      kind: "EB",
      invoiceNo: order.invoice_no ?? null,
      date: order.invoiced_at ?? order.created_at,
      billTo: {
        name: order.customer_name,
        lines: [
          order.address,
          `${order.city}, ${order.state} - ${order.pincode}, ${order.country}`,
          `Phone: ${order.mobile}`,
          `Email: ${order.email}`,
        ].filter(Boolean),
        state: order.state,
        country: order.country,
        gstin: order.gst_number,
      },
      items: order.items.map((item) => ({
        description:
          `Devotional eBook – ${item.book_title}` +
          (Number(item.quantity) > 1 ? ` × ${item.quantity}` : ""),
        amount: Number(item.subtotal),
      })),
      gstPercent: EBOOK_GST_PERCENT,
      notes: [
        "Digital product supplied electronically. No physical delivery.",
      ],
    },
    settings
  );
}

export function generateSubscriptionInvoicePdf(
  sub: InvoiceSubscription,
  settings: StoreSettings
): Promise<Buffer> {
  return renderInvoice(
    {
      kind: "LT",
      invoiceNo: sub.invoice_no ?? null,
      date: sub.invoiced_at ?? sub.created_at,
      billTo: {
        name: sub.customer_name || "Customer",
        lines: [
          sub.customer_phone ? `Phone: ${sub.customer_phone}` : "",
          sub.customer_email ? `Email: ${sub.customer_email}` : "",
        ].filter(Boolean),
        state: sub.customer_state,
        country: null,
        gstin: null,
      },
      items: [
        {
          description: "Lifetime Devotional eBook Library Access",
          amount: Number(sub.amount),
        },
      ],
      gstPercent: LIFETIME_GST_PERCENT,
      notes: [
        "Subscription Type: One-Time Lifetime Access",
        "Validity: As defined in the Lifetime Access Terms",
        "Digital product supplied electronically. No physical delivery.",
      ],
    },
    settings
  );
}

// ===== Tax maths, in paise so rounding never drifts =====

function isWithinSellerState(state: string | null, country: string | null) {
  if (country && !/^\s*(india|in|bharat)\s*$/i.test(country)) return false;
  // No state known -> place of supply is the supplier's location.
  if (!state || !state.trim()) return true;
  return /karn|^\s*ka\s*$/i.test(state);
}

function computeTax(data: InvoiceData) {
  const lines = data.items.map((item) => {
    const gross = Math.round(item.amount * 100);
    const taxable = Math.round((gross * 100) / (100 + data.gstPercent));
    return { description: item.description, gross, taxable };
  });

  const total = lines.reduce((s, l) => s + l.gross, 0);
  const taxable = lines.reduce((s, l) => s + l.taxable, 0);
  const tax = total - taxable;

  const intraState = isWithinSellerState(
    data.billTo.state,
    data.billTo.country
  );

  // Odd paisa goes to SGST — matches the reference (₹76.19 + ₹76.20).
  const cgst = Math.floor(tax / 2);

  return {
    lines,
    total,
    intraState,
    taxRows: intraState
      ? [
          { label: `CGST @ ${data.gstPercent / 2}%`, paise: cgst },
          { label: `SGST @ ${data.gstPercent / 2}%`, paise: tax - cgst },
        ]
      : [{ label: `IGST @ ${data.gstPercent}%`, paise: tax }],
  };
}

function rupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
  "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy",
  "Eighty", "Ninety",
];

function twoDigits(n: number) {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");
}

// Indian numbering: crore, lakh, thousand, hundred.
function numberToWords(n: number): string {
  if (n === 0) return "Zero";
  const parts: string[] = [];
  const units: [number, string][] = [
    [10000000, "Crore"],
    [100000, "Lakh"],
    [1000, "Thousand"],
    [100, "Hundred"],
  ];
  for (const [size, name] of units) {
    if (n >= size) {
      parts.push(`${numberToWords(Math.floor(n / size))} ${name}`);
      n %= size;
    }
  }
  if (n > 0) parts.push(twoDigits(n));
  return parts.join(" ");
}

function amountInWords(paise: number) {
  const r = Math.floor(paise / 100);
  const p = paise % 100;
  return (
    `Rupees ${numberToWords(r)}` +
    (p ? ` and ${twoDigits(p)} Paise` : "") +
    " Only"
  );
}

function renderInvoice(
  data: InvoiceData,
  settings: StoreSettings
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { regular, bold } = invoiceFonts();
    doc.registerFont("Body", regular);
    doc.registerFont("Bold", bold);
    doc.font("Body");

    const left = 50;
    const width = 495;
    const right = left + width;
    const bottomLimit = doc.page.height - 110;

    const ensureSpace = (needed: number) => {
      if (doc.y + needed > bottomLimit) {
        doc.addPage();
      }
    };

    const rule = (gap = 10) => {
      doc.y += gap;
      doc
        .moveTo(left, doc.y)
        .lineTo(right, doc.y)
        .lineWidth(0.7)
        .strokeColor("#ddd")
        .stroke();
      doc.y += gap;
    };

    const tax = computeTax(data);
    const invoiceNumber = formatInvoiceNumber(
      data.kind,
      data.invoiceNo,
      data.date
    );

    // ===== Header: store details (same as the pre-GST invoice) =====
    doc
      .font("Bold")
      .fontSize(20)
      .fillColor("#d97706")
      .text(settings.store_name, left, 50, { width });

    doc.font("Body").fontSize(9.5).fillColor("#777").text(TAGLINE);

    doc.moveDown(0.3);
    doc.font("Body").fontSize(9).fillColor("#555");

    if (settings.address) {
      doc.text(settings.address);
    }

    const contactLine = [settings.contact_phone, settings.contact_email]
      .filter(Boolean)
      .join("  •  ");

    if (contactLine) {
      doc.text(contactLine);
    }

    if (settings.gst_number) {
      doc
        .font("Bold")
        .fillColor("#111")
        .text(`GSTIN: ${settings.gst_number}`);
    }

    doc.moveDown(1.5);

    // ===== Title + invoice meta =====
    doc
      .font("Bold")
      .fontSize(14)
      .fillColor("#111")
      .text("TAX INVOICE", { align: "right" });

    doc
      .font("Body")
      .fontSize(9)
      .fillColor("#555")
      .text(`Invoice #: ${invoiceNumber ?? "Not issued — payment pending"}`, {
        align: "right",
      })
      .text(
        `Date: ${new Date(data.date).toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
        })}`,
        { align: "right" }
      );

    doc.moveDown(1.5);

    // ===== Bill to =====
    doc.font("Bold").fontSize(10).fillColor("#111").text("Bill To:", left);

    doc.font("Body").fontSize(9).fillColor("#333").text(data.billTo.name);
    for (const line of data.billTo.lines) {
      doc.text(line);
    }
    if (data.billTo.gstin) {
      doc.text(`Customer GSTIN: ${data.billTo.gstin}`);
    }

    rule(12);

    // ===== Description / Amount table =====
    const amountX = right - 120;

    const tableRow = (
      description: string,
      amount: string,
      opts: { bold?: boolean; size?: number; color?: string } = {}
    ) => {
      ensureSpace(30);
      const y = doc.y;
      doc
        .font(opts.bold ? "Bold" : "Body")
        .fontSize(opts.size ?? 10)
        .fillColor(opts.color ?? "#222");
      doc.text(description, left, y, { width: amountX - left - 10 });
      const end = doc.y;
      doc.text(amount, amountX, y, { width: 120, align: "right" });
      doc.y = Math.max(end, doc.y) + 6;
      doc
        .moveTo(left, doc.y)
        .lineTo(right, doc.y)
        .lineWidth(0.5)
        .strokeColor("#eee")
        .stroke();
      doc.y += 6;
    };

    tableRow("Description", "Amount", { bold: true, color: "#111" });

    for (const line of tax.lines) {
      tableRow(line.description, rupees(line.taxable));
    }

    tableRow(`SAC: ${SAC_CODE}`, "");

    for (const row of tax.taxRows) {
      tableRow(row.label, rupees(row.paise));
    }

    doc.y += 6;
    ensureSpace(40);
    const totalY = doc.y;
    doc
      .font("Bold")
      .fontSize(13)
      .fillColor("#111")
      .text("Total (Inclusive of GST)", left, totalY, {
        width: amountX - left - 10,
      });
    doc.text(rupees(tax.total), amountX - 40, totalY, {
      width: 160,
      align: "right",
    });

    doc
      .font("Body")
      .fontSize(9)
      .fillColor("#555")
      .text(`Amount in words: ${amountInWords(tax.total)}`, left, doc.y + 4, {
        width,
      });

    doc.moveDown(0.6);

    for (const note of [
      ...data.notes,
      `Payment Status: ${data.invoiceNo != null ? "Paid" : "Pending"}`,
    ]) {
      doc.text(note, left, doc.y, { width });
    }

    // Digital books unlock the moment payment succeeds — matches
    // section 4 (Refunds & Cancellations) of /terms-conditions.
    ensureSpace(130);
    doc.moveDown(1);

    doc
      .font("Bold")
      .fontSize(10)
      .fillColor("#8b1a1a")
      .text(
        "Note: The amount paid is non-refundable, except for billing errors.",
        left,
        doc.y,
        { width }
      );

    doc
      .font("Body")
      .fontSize(8.5)
      .fillColor("#555")
      .text(
        "Digital books are delivered instantly on payment, so purchases cannot be cancelled. If you were charged in error or cannot open your book, contact us within 7 days of purchase. See Terms & Conditions for details.",
        left,
        doc.y + 2,
        { width }
      );

    // Highlighted thank-you band (client request 2026-09-27)
    const thanksY = doc.y + 18;
    doc
      .roundedRect(left, thanksY, width, 34, 6)
      .fillAndStroke("#fff4e0", "#d97706");
    doc
      .font("Bold")
      .fontSize(13)
      .fillColor("#b45309")
      .text(`Thank you for shopping with ${settings.store_name}!`, left, thanksY + 9, {
        align: "center",
        width,
      });

    // ===== Footer =====
    doc
      .font("Body")
      .fontSize(8)
      .fillColor("#999")
      .text(
        "This is a computer-generated invoice and does not require a signature.",
        left,
        doc.page.height - 80,
        { align: "center", width }
      );

    doc.end();
  });
}
