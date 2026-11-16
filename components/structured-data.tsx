import { SITE_URL, BASE_PATH, absoluteUrl, SOCIAL_IMAGE } from '@/lib/constants';

const DOCS_URL = `${SITE_URL}${BASE_PATH}/`;

/**
 * Organization + WebSite JSON-LD, ported from `overrides/main.html`.
 */
export function SiteStructuredData() {
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
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
      '@id': `${DOCS_URL}#website`,
      url: DOCS_URL,
      name: 'OpenObserve Documentation',
      publisher: { '@id': `${SITE_URL}/#org` },
      inLanguage: 'en',
    },
  ];

  return <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />;
}

/**
 * Per-page BreadcrumbList + TechArticle, ported from `overrides/main.html`.
 *
 * The breadcrumb lists the page's real ancestors rather than a flat
 * OpenObserve > Docs > Page. Google expects structured data to match what the
 * reader sees, and the rendered breadcrumb already shows the full trail
 * (User Guide > Analytics > Alerts), so the flat version contradicted it.
 */
export function PageStructuredData({
  title,
  pageUrl,
  description,
  lastModified,
  published,
  ancestors = [],
}: {
  title: string;
  pageUrl: string;
  description?: string;
  lastModified?: Date;
  /** First-commit date of the page, from lib/published-time.ts. */
  published?: Date;
  /** Ancestor trail from the page tree, nearest root first, excluding the page. */
  ancestors?: { name: string; url?: string }[];
}) {
  const isRoot = pageUrl === '/' || pageUrl === '';
  const url = absoluteUrl(pageUrl);

  const trail: { name: string; item: string }[] = [
    { name: 'OpenObserve', item: `${SITE_URL}/` },
    { name: 'Docs', item: DOCS_URL },
    // Google requires `item` on every element but the last, so sections
    // without a landing page (no URL) are dropped rather than listed with a
    // dangling name-only entry.
    ...ancestors.filter((a) => a.url).map((a) => ({ name: a.name, item: absoluteUrl(a.url!) })),
  ];
  if (!isRoot) trail.push({ name: title, item: url });

  const itemListElement = trail.map((entry, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: entry.name,
    item: entry.item,
  }));

  const graph: Record<string, unknown>[] = [{ '@type': 'BreadcrumbList', itemListElement }];

  if (!isRoot) {
    // Google's Article structured data expects `datePublished`. The page's
    // first commit is the real value; without git history, fall back to the
    // last-modified date so the TechArticle still validates.
    const datePublished = published ?? lastModified;
    graph.push({
      '@type': 'TechArticle',
      headline: title,
      url,
      ...(description ? { description } : {}),
      image: SOCIAL_IMAGE.url,
      inLanguage: 'en',
      isPartOf: { '@id': `${DOCS_URL}#website` },
      author: { '@id': `${SITE_URL}/#org` },
      publisher: { '@id': `${SITE_URL}/#org` },
      ...(datePublished ? { datePublished: new Date(datePublished).toISOString() } : {}),
      ...(lastModified ? { dateModified: new Date(lastModified).toISOString() } : {}),
    });
  }

  return <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />;
}

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Content is built from our own data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
