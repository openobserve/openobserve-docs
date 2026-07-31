/**
 * The site is served from https://openobserve.ai/docs, configured as Next's
 * `basePath`.
 *
 * Two different rules follow from that, and mixing them up produces `/docs/docs/...`:
 *
 *  - **Links** are rendered through `next/link`, which prepends `basePath`
 *    itself. Internal hrefs must therefore be site-root relative (`/getting-started`).
 *  - **Images** are rendered as plain `<img>` tags, which get no such treatment.
 *    Their `src` must include the prefix (`/docs/images/foo.png`).
 */
export const BASE_PATH = '/docs';

export const SITE_URL = 'https://openobserve.ai';

/** Canonical absolute URL for a page URL such as `/getting-started`. */
export function absoluteUrl(pageUrl: string): string {
  const path = pageUrl === '/' ? '/' : pageUrl.replace(/\/$/, '') + '/';
  return `${SITE_URL}${BASE_PATH}${path === '/' ? '/' : path}`;
}
