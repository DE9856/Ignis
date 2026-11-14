import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Files read at request time must ship with the function that reads them. Pages are
  // prerendered and do not need them at runtime.
  // - knowledge/: /api/health, and the evidence routes when Supabase is not configured
  //   (they then search the local verified records).
  // - models/: the q8 query embedder, fetched by `npm run fetch:model` before every build.
  // - onnxruntime-node: transformers.js loads it through createRequire and it loads its
  //   native binding from a path built at runtime, so the tracer finds neither on its own.
  //   Only the Linux x64 CPU runtime, named file by file: on linux-x64 the package's
  //   postinstall also drops CUDA/TensorRT libraries into that folder, and a glob would ship
  //   them (outputFileTracingExcludes does not remove included files).
  // `scripts/check-bundle.ts` (postbuild) fails the build if any of this regresses.
  outputFileTracingIncludes: {
    "/api/health": ["./knowledge/**/*.md"],
    "/api/evidence/search": [
      "./knowledge/**/*.md",
      "./models/**/*",
      "./node_modules/onnxruntime-node/package.json",
      "./node_modules/onnxruntime-node/dist/**/*.js",
      // onnxruntime-node is CommonJS and requires the CJS build of onnxruntime-common; the
      // tracer only follows transformers.js's ESM import, so it ships the ESM build alone.
      // dist/cjs/package.json marks that folder as CommonJS; without it Node loads it as ESM.
      "./node_modules/onnxruntime-common/package.json",
      "./node_modules/onnxruntime-common/dist/cjs/package.json",
      "./node_modules/onnxruntime-common/dist/cjs/**/*.js",
      "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/onnxruntime_binding.node",
      "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime.so.1",
    ],
    "/api/evidence/synthesize": ["./knowledge/**/*.md"],
  },
  // The tracer picks these up on its own: a developer's transformers.js download cache
  // (the old fp32 model, 134 MB) and the browser runtime. Neither is used on the server.
  outputFileTracingExcludes: {
    "/*": ["./node_modules/@huggingface/transformers/.cache/**", "./node_modules/onnxruntime-web/**"],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Pin the root to this project. Without it Next.js looks upward for a lockfile and
    // warns about one in a parent folder that belongs to an unrelated project.
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
