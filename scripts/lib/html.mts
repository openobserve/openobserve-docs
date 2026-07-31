import * as cheerio from 'cheerio';

export type Dom = cheerio.CheerioAPI;

/**
 * Parse an HTML document.
 *
 * cheerio (parse5) rather than a regex or a lightweight parser: several built
 * pages nest raw HTML from the markdown deeply enough that non-spec parsers drop
 * the whole `<article>` silently, which would make the baseline under-report and
 * the harness pass vacuously.
 */
export function parseHtml(html: string): Dom {
  return cheerio.load(html);
}

/**
 * Resolve an href/src found on `pageUrl` to a site-absolute path.
 * External, protocol-relative, mailto and data URLs are returned untouched.
 */
export function resolveUrl(pageUrl: string, href: string): string {
  const trimmed = href.trim();
  if (trimmed === '') return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith('//')) return trimmed;
  if (trimmed.startsWith('#')) return pageUrl + trimmed;
  if (trimmed.startsWith('/')) return normaliseDots(trimmed);

  const hashIndex = trimmed.indexOf('#');
  const hash = hashIndex === -1 ? '' : trimmed.slice(hashIndex);
  const pathPart = hashIndex === -1 ? trimmed : trimmed.slice(0, hashIndex);

  const base = pageUrl.endsWith('/') ? pageUrl : pageUrl.replace(/[^/]*$/, '');
  const segments = base.split('/').filter(Boolean);
  for (const segment of pathPart.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') segments.pop();
    else segments.push(segment);
  }
  const trailing = pathPart !== '' && pathPart.endsWith('/') ? '/' : '';
  return `/${segments.join('/')}${trailing}${hash}`;
}

function normaliseDots(p: string): string {
  if (!p.includes('./')) return p;
  const [pathPart, ...rest] = p.split('#');
  const hash = rest.length ? `#${rest.join('#')}` : '';
  const segments: string[] = [];
  for (const segment of pathPart.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') segments.pop();
    else segments.push(segment);
  }
  const trailing = pathPart.endsWith('/') ? '/' : '';
  return `/${segments.join('/')}${trailing}${hash}`;
}

/** Collapse whitespace so text lengths are comparable across renderers. */
export function normaliseText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}
