import type { NextConfig } from "next";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://scriviq.com",
  "https://www.scriviq.com",
];

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Keep native Node modules out of the webpack bundle
  serverExternalPackages: ["pdf-parse", "mammoth"],

  async headers() {
    return [
      {
        // Apply CORS headers to all /api/* routes
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: ALLOWED_ORIGINS.join(", "),
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
      {
        // Security headers for all pages
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options",        value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
