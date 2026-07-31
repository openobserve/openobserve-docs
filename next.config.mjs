import { readFileSync } from 'node:fs';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** The six §6.1 redirects, shared with scripts/emit-redirects.mts. */
const { redirects } = JSON.parse(
  readFileSync(new URL('./redirects.json', import.meta.url), 'utf8'),
);

/** `enterprise-setup/index.md` → `/enterprise-setup` (no basePath — Next adds it). */
function toPath(docsRelPath) {
  const slug = docsRelPath.replace(/\.md$/i, '').replace(/(^|\/)index$/, '');
  return slug === '' ? '/' : `/${slug}`;
}

/** @type {import('next').NextConfig} */
const config = {
  // S-6 + S-3: dev and prod both serve under /docs.
  // basePath also prefixes _next/ asset URLs — required for the S3 sub-path deploy.
  basePath: '/docs',

  // Matches MkDocs' use_directory_urls: true → /foo/index.html
  trailingSlash: true,

  // Static export → S3, same deployment model as today.
  output: 'export',

  // Required by output: 'export' — no Next image optimizer at runtime.
  images: { unoptimized: true },

  /**
   * Dev-only redirects.
   *
   * `output: 'export'` has no server, so production serves the six redirects as
   * meta-refresh stub pages written into `out/` by `scripts/emit-redirects.mts`
   * — the same mechanism `mkdocs-redirects` used. Those stubs only exist after a
   * build, so `next dev` would otherwise answer an old URL like
   * `/docs/quickstart/` with a missing-static-param error instead of a redirect.
   *
   * This closes that dev/prod gap. It is gated on the dev server because Next
   * warns (rightly) that `redirects` cannot work under `output: 'export'`; the
   * exported build is unaffected and still relies on the stubs.
   */
  ...(process.env.NODE_ENV === 'development'
    ? {
        async redirects() {
          return Object.entries(redirects).map(([from, to]) => ({
            source: toPath(from),
            destination: toPath(to),
            permanent: true,
          }));
        },
      }
    : {}),
};

export default withMDX(config);
