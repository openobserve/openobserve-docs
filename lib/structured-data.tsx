/**
 * Port of the JSON-LD block in `overrides/main.html`.
 *
 * The Jinja template emitted one `@graph` per page: Organization and WebSite are
 * constant, while BreadcrumbList gains a third item and a TechArticle node is
 * added on every page except the docs root. Reproduced exactly — these are live
 * SEO signals, and dropping or reshaping them is a silent regression.
 */
import { SITE_URL, BASE_PATH } from './base-path';

const ORGANISATION_ID = `${SITE_URL}/#org`;
const WEBSITE_ID = `${SITE_URL}${BASE_PATH}/#website`;

interface PageInfo {
  /** Page title, absent on the docs root. */
  title?: string;
  /** Page URL without the basePath, e.g. `/user-guide/logs`. Absent on the root. */
  url?: string;
  /** Last modified date from git, if known. */
  modified?: Date;
}

function absolute(url: string): string {
  const withSlash = url.endsWith('/') ? url : `${url}/`;
  return `${SITE_URL}${BASE_PATH}${withSlash}`;
}

export function structuredData(page: PageInfo = {}): string {
  const isChildPage = page.url !== undefined && page.url !== '/';

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': ORGANISATION_ID,
      name: 'OpenObserve',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/img/logo/logo.svg`,
      description:
        'OpenObserve is an open-source observability platform for logs, metrics, and traces, built in Rust, with SQL and PromQL.',
      sameAs: [
        'https://github.com/openobserve/openobserve',
        'https://short.openobserve.ai/community',
        'https://x.com/OpenObserve',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${SITE_URL}${BASE_PATH}/`,
      name: 'OpenObserve Documentation',
      publisher: { '@id': ORGANISATION_ID },
      inLanguage: 'en',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'OpenObserve', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Docs', item: `${SITE_URL}${BASE_PATH}/` },
        ...(isChildPage
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: page.title,
                item: absolute(page.url!),
              },
            ]
          : []),
      ],
    },
  ];

  if (isChildPage) {
    graph.push({
      '@type': 'TechArticle',
      headline: page.title,
      url: absolute(page.url!),
      isPartOf: { '@id': WEBSITE_ID },
      publisher: { '@id': ORGANISATION_ID },
      ...(page.modified ? { dateModified: page.modified.toISOString() } : {}),
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

/** `<script type="application/ld+json">`, rendered server-side. */
export function StructuredData(page: PageInfo = {}) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output; no user input reaches this.
      dangerouslySetInnerHTML={{ __html: structuredData(page) }}
    />
  );
}
