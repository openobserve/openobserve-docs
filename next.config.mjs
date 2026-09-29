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

// Dev only: the announcement banner fetches `/banner.json` from the site root,
// which the marketing site publishes and `next dev` doesn't have. Proxy it so
// local dev shows the live banner. Rewrites don't apply to a static export, so
// production is untouched and serves the real file from the same origin.
if (process.env.NODE_ENV === 'development') {
  config.rewrites = async () => [
    {
      source: '/banner.json',
      destination: 'https://openobserve.ai/banner.json',
      basePath: false,
    },
  ];
}

export default withMDX(config);
