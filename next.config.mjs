	/** @type {import('next').NextConfig} */
const nextConfig = {
  // On-device testing loads the app from http://<lan-ip>:3010 (Capacitor
  // server.url), so dev-only HMR/_next requests come from that origin.
  allowedDevOrigins: ["192.168.1.150"],

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
