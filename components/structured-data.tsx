import { SITE_URL, BASE_PATH, absoluteUrl } from '@/lib/constants';

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
 */
export function PageStructuredData({
  title,
  pageUrl,
  lastModified,
}: {
  title: string;
  pageUrl: string;
  lastModified?: Date;
}) {
  const isRoot = pageUrl === '/' || pageUrl === '';
  const url = absoluteUrl(pageUrl);

  const itemListElement: unknown[] = [
    { '@type': 'ListItem', position: 1, name: 'OpenObserve', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Docs', item: DOCS_URL },
  ];
  if (!isRoot) {
    itemListElement.push({ '@type': 'ListItem', position: 3, name: title, item: url });
  }

  const graph: Record<string, unknown>[] = [{ '@type': 'BreadcrumbList', itemListElement }];

  if (!isRoot) {
    graph.push({
      '@type': 'TechArticle',
      headline: title,
      url,
      isPartOf: { '@id': `${DOCS_URL}#website` },
      publisher: { '@id': `${SITE_URL}/#org` },
      ...(lastModified ? { dateModified: lastModified.toISOString() } : {}),
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
