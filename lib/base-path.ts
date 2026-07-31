/**
 * §6.2 — the one place the `/docs` prefix is written by hand.
 *
 * Rule: hrefs produced anywhere in the pipeline — by `loader()`, by
 * `remark-mkdocs-links`, by the search index — never contain `/docs`. Next's
 * `basePath` adds it exactly once at render time.
 *
 * The exception is anything Next does *not* rewrite: a raw `<img src>` is passed
 * through untouched, unlike an `<a href>` (which fumadocs routes through
 * `next/link`). Those srcs get the prefix here, at render time, so the remark
 * output stays prefix-free and consistent with links.
 *
 * Keep in sync with `basePath` in next.config.mjs and `BASE_PATH` in
 * scripts/lib/paths.mts.
 */
export const BASE_PATH = '/docs';

/** Production origin, used for canonical URLs, JSON-LD and the sitemap. */
export const SITE_URL = 'https://openobserve.ai';

/** Prefix a root-relative path with the basePath. Other URLs pass through. */
export function withBasePath(url: string | undefined): string | undefined {
  if (!url) return url;
  if (!url.startsWith('/') || url.startsWith('//')) return url;
  if (url === BASE_PATH || url.startsWith(`${BASE_PATH}/`)) return url;
  return `${BASE_PATH}${url}`;
}
