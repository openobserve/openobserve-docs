import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  // Static HTML export -> `out/`, synced to s3://<bucket>/docs as before.
  output: 'export',
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
