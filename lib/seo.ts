/**
 * Search-result limits for the `<title>` and `<meta name="description">` tags.
 *
 * Google renders both as pixel widths, not character counts, and the exact
 * cutoff moves. These are the conventional character proxies: titles are
 * truncated around 580px (~60 characters) and descriptions around 920px
 * (~160 characters). `scripts/check-seo.mjs` enforces them at build time.
 */
export const TITLE_MAX = 60;
export const DESCRIPTION_MIN = 70;
export const DESCRIPTION_MAX = 160;

/** Appended to unbranded titles, and the cost in characters of doing so. */
const BRAND_SUFFIX = ' | OpenObserve';

/**
 * Builds the `<title>` for a docs page.
 *
 * Roughly half the pages carry only the short sidebar `title` ("Alerts",
 * "Azure AKS") and no SEO-tuned `metaTitle`. On its own that makes a title tag
 * with no brand and no topic context, which competes badly in search results
 * and reads as ambiguous when shared. Those get the brand appended.
 *
 * Two guards keep the suffix from doing harm:
 *
 *  - Titles that already say "OpenObserve" anywhere are left alone, so nothing
 *    ends up as "... | OpenObserve | OpenObserve".
 *  - The suffix is only added when the result still fits in `TITLE_MAX`. A
 *    hand-written `metaTitle` near the limit keeps its own wording rather than
 *    being pushed past the truncation point.
 */
export function composeTitle(title: string): string {
  if (/openobserve/i.test(title)) return title;
  if (title.length + BRAND_SUFFIX.length > TITLE_MAX) return title;
  return title + BRAND_SUFFIX;
}
