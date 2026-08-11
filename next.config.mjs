import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  // Static HTML export -> `out/`, synced to s3://<bucket>/docs as before.
  output: 'export',
  // `next build` and `next dev` share `.next` by default, so a build run
  // while the dev server is up corrupts its incremental state — the dev
  // overlay then shows "(stale)" and bogus errors like `missing param
  // "/[[...slug]]"` until a restart. The build script sets NEXT_DIST_DIR
  // so the two never touch the same directory.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // The site is served from https://openobserve.ai/docs
  basePath: '/docs',
  // MkDocs used directory-style URLs (/docs/getting-started/). Keep them.
  trailingSlash: true,
  images: {
    // next/image optimisation needs a server; export serves the files as-is.
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default withMDX(config);
