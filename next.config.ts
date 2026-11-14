import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // /api/health reads knowledge/ at request time, so the files must ship with
  // that function. Pages are prerendered and do not need them at runtime.
  outputFileTracingIncludes: {
    "/api/health": ["./knowledge/**/*.md"],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
