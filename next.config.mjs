	/** @type {import('next').NextConfig} */
const nextConfig = {
  // nginx on prod (certbot-managed TLS) sets no security headers of its
  // own beyond the cert — these are the safe, no-CSP baseline. CSP is
  // deliberately left out: Razorpay's checkout widget loads an external
  // script + iframe, and getting an allowlist right needs a careful
  // pass of its own rather than risking checkout breakage here.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // On-device testing loads the app from https://<lan-ip>:3010 (Capacitor
  // server.url), so dev-only HMR/_next requests come from that origin.
  // Add whatever LAN IP the dev machine currently has.
  allowedDevOrigins: ["192.168.1.150", "10.10.20.142"],

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
