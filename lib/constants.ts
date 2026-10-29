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

/**
 * kapa.ai "Ask AI" widget integration ID, from app.kapa.ai → Integrations →
 * "Copy integration ID". Public by design: kapa only serves it on allow-listed
 * domains. Empty disables the widget (components/kapa-widget.tsx).
 *
 * Read at build time from NEXT_PUBLIC_KAPA_WEBSITE_ID: `.env` locally, the
 * `KAPA_WEBSITE_ID` repository variable in the deploy workflows.
 */
export const KAPA_WEBSITE_ID = process.env.NEXT_PUBLIC_KAPA_WEBSITE_ID ?? '';

/**
 * Card shown when a docs page is shared. Reuses the marketing site's existing
 * social image so docs links look the same as every other openobserve.ai link;
 * the MkDocs site had no og:image at all.
 */
export const SOCIAL_IMAGE = {
  url: `${SITE_URL}/o2-seo-image.png`,
  width: 1200,
  height: 630,
  alt: 'OpenObserve',
};

/** Canonical absolute URL for a page URL such as `/getting-started`. */
export function absoluteUrl(pageUrl: string): string {
  const path = pageUrl === '/' ? '/' : pageUrl.replace(/\/$/, '') + '/';
  return `${SITE_URL}${BASE_PATH}${path === '/' ? '/' : path}`;
}

/**
 * Absolute URL of a page's published Markdown source, e.g.
 * `overview/guiding-principles.md`.
 *
 * Absolute rather than root-relative on purpose: Next resolves `alternates`
 * against `metadataBase`, which already ends in `/docs`, so a `/docs/...` value
 * would come out as `/docs/docs/...`.
 */
export function markdownUrl(docPath: string): string {
  return `${SITE_URL}${BASE_PATH}/${docPath.replace(/^\//, '')}`;
}
