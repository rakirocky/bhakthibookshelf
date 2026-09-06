// The standalone build embeds pdfkit's standard font metrics directly
// in the JS bundle, instead of reading them from a separate .afm file
// on disk at runtime. The regular "pdfkit" entry point does the latter
// via a path relative to its own location — which breaks under
// Turbopack's production bundling (the path gets rewritten to an
// internal virtual location, "/ROOT/...", that doesn't exist on the
// real filesystem). This avoids the problem instead of working around
// it with bundler config that Turbopack doesn't fully honor yet.
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";

import { StoreSettings } from "../types/settings";

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
  total_amount: number;
  created_at: string;
  items: {
    book_title: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
}

export function generateInvoicePdf(
  order: InvoiceOrder,
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

    // ===== Header: store details =====
    doc
      .fontSize(20)
      .fillColor("#d97706")
      .text(settings.store_name, { continued: false });

    doc.fontSize(9).fillColor("#555");

    if (settings.address) {
      doc.text(settings.address);
    }

    const contactLine = [
      settings.contact_phone,
      settings.contact_email,
    ]
      .filter(Boolean)
      .join("  •  ");

    if (contactLine) {
      doc.text(contactLine);
    }

    if (settings.gst_number) {
      doc.text(`GSTIN: ${settings.gst_number}`);
    }

    doc.moveDown(1.5);

    // ===== Title + invoice meta =====
    doc
      .fontSize(14)
      .fillColor("#111")
      .text("TAX INVOICE", { align: "right" });

    doc
      .fontSize(9)
      .fillColor("#555")
      .text(`Invoice / Order #: ${order.order_number}`, {
        align: "right",
      })
      .text(
        `Date: ${new Date(
          order.created_at
        ).toLocaleDateString("en-IN")}`,
        { align: "right" }
      );

    doc.moveDown(1.5);

    // ===== Bill to =====
    doc.fontSize(10).fillColor("#111").text("Bill To:");

    doc
      .fontSize(9)
      .fillColor("#333")
      .text(order.customer_name)
      .text(order.address)
      .text(
        `${order.city}, ${order.state} - ${order.pincode}, ${order.country}`
      )
      .text(order.mobile)
      .text(order.email);

    if (order.gst_number) {
      doc.text(`Customer GSTIN: ${order.gst_number}`);
    }

    doc.moveDown(1.5);

    // ===== Items table (manual layout — pdfkit has no built-in table) =====
    const tableTop = doc.y;
    const colBook = 50;
    const colQty = 330;
    const colPrice = 390;
    const colSubtotal = 470;

    doc
      .fontSize(9)
      .fillColor("#fff")
      .rect(50, tableTop, 495, 20)
      .fill("#0B1B3B");

    doc
      .fillColor("#fff")
      .text("Book", colBook + 5, tableTop + 6)
      .text("Qty", colQty, tableTop + 6)
      .text("Price", colPrice, tableTop + 6)
      .text("Subtotal", colSubtotal, tableTop + 6);

    let y = tableTop + 25;

    doc.fontSize(9).fillColor("#222");

    for (const item of order.items) {
      doc
        .text(item.book_title, colBook + 5, y, {
          width: 270,
        })
        .text(String(item.quantity), colQty, y)
        .text(`₹${item.price}`, colPrice, y)
        .text(`₹${item.subtotal}`, colSubtotal, y);

      y += 22;
    }

    doc
      .moveTo(50, y)
      .lineTo(545, y)
      .strokeColor("#ddd")
      .stroke();

    y += 10;

    doc
      .fontSize(11)
      .fillColor("#111")
      .text("Total", colPrice, y, { continued: false })
      .text(`₹${order.total_amount}`, colSubtotal, y);

    doc.moveDown(4);

    // ===== Footer =====
    doc
      .fontSize(8)
      .fillColor("#999")
      .text(
        "This is a computer-generated invoice and does not require a signature.",
        50,
        doc.page.height - 80,
        { align: "center", width: 495 }
      )
      .text(`Thank you for shopping with ${settings.store_name}.`, {
        align: "center",
        width: 495,
      });

    doc.end();
  });
}
