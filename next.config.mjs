	/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfkit loads its standard font metrics (.afm files) dynamically at
  // runtime, not via a normal import — Next.js's production bundler
  // can't detect that through static analysis, so without this it
  // silently gets left out of the deployed build, and invoice
  // generation crashes with ENOENT the moment it's actually used.
  outputFileTracingIncludes: {
    "/api/admin/orders/[id]/invoice": [
      "./node_modules/pdfkit/js/data/**",
    ],
    "/api/admin/orders/[id]/email-invoice": [
      "./node_modules/pdfkit/js/data/**",
    ],
  },
};

export default nextConfig;
