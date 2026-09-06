// pdfkit's bundled type declarations (@types/pdfkit) only cover the
// main "pdfkit" entry point, not this specific deep import path. The
// standalone build has the exact same API/shape as the regular one —
// this just tells TypeScript that the module exists, rather than
// failing the build with "could not find a declaration file."
declare module "pdfkit/js/pdfkit.standalone.js" {
  import PDFDocument from "pdfkit";
  export default PDFDocument;
}
