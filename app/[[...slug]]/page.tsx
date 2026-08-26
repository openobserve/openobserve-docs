import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DocsBody, DocsPage } from 'fumadocs-ui/layouts/docs/page';
import { getBreadcrumbItems } from 'fumadocs-core/breadcrumb';
import { findNeighbour } from 'fumadocs-core/page-tree';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/components/mdx-components';
import { Feedback } from '@/components/feedback';
import { LlmPageActions } from '@/components/llm-page-actions';
import { PageStructuredData } from '@/components/structured-data';
import { Landing } from '@/components/landing';
import { absoluteUrl, markdownUrl, SOCIAL_IMAGE } from '@/lib/constants';
import { composeTitle } from '@/lib/seo';

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const { body: MDX, toc, lastModified } = page.data;

  // Most pages open with their own SEO-tuned H1, carried over from MkDocs, and
  // that heading is rendered as authored. Around 135 pages have no `# H1` at
  // all, though — Material for MkDocs injected `<h1>{{ page.title }}</h1>` for
  // exactly those, so without this they would render with no heading whatsoever.
  const hasOwnHeading = toc.some((item) => item.depth === 1);

  // The same trail the rendered breadcrumb shows, reused for the BreadcrumbList
  // structured data so the two agree. `name` is a ReactNode in the general case,
  // but every node in this tree is a plain string from meta.json/frontmatter.
  const breadcrumbAncestors = getBreadcrumbItems(page.url, source.pageTree, {
    includeRoot: false,
    includePage: false,
  })
    .filter((item) => typeof item.name === 'string')
    .map((item) => ({ name: item.name as string, url: item.url }));

  // `/docs/` is the landing page. MkDocs rendered it from a theme override that
  // replaced the page body, so the markdown in docs/index.md was never shown;
  // that file still supplies the frontmatter title, description and the raw
  // Markdown served for LLM crawlers.
  if (page.url === '/') {
    return (
      <DocsPage toc={[]} full tableOfContent={{ enabled: false }}>
        <PageStructuredData
          title={page.data.title}
          pageUrl={page.url}
          description={page.data.description}
          lastModified={lastModified}
        />
        <Landing />
      </DocsPage>
    );
  }

  // Previous/next in page-tree order, so the pair matches the sidebar rather
  // than the order the files happen to sit in on disk.
  //
  // Without this the footer slot renders empty, and a leaf page's HTML carries
  // only the eight top-level sidebar links — collapsed folders are filled in on
  // the client, so nothing that crawls the static export ever sees them. These
  // two links are the only in-page path between neighbouring pages.
  //
  // One page is linked in a form that does not resolve: `/migration/v0.5.3`.
  // `trailingSlash: true` normally rewrites every internal href to its directory
  // form, but Next skips a last segment containing a dot, reading `v0.5.3` as a
  // filename — and the CloudFront Function in front of the bucket only rewrites
  // extension-less paths, so it passes that one through to a 404. Setting the
  // slash here does not help; next/link strips it straight back off. The page is
  // exported as `v0.5.3/index.html` and its canonical and sitemap entry both
  // carry the slash, so the fix is to rename the file to a dot-free slug and add
  // a redirect stub for the old URL — content work, tracked in the audit.
  const neighbours = findNeighbour(source.pageTree, page.url);

  return (
    <DocsPage toc={toc} full={false} footer={{ items: neighbours }}>
      <PageStructuredData
        title={page.data.title}
        pageUrl={page.url}
        description={page.data.description}
        lastModified={lastModified}
        ancestors={breadcrumbAncestors}
      />
      <div className="mb-4 flex justify-end">
        <LlmPageActions markdownPath={page.path} />
      </div>
      <DocsBody>
        {/*
          Rendered inside DocsBody, not as <DocsTitle>, so the fallback heading
          picks up the same prose styling as an authored one.
        */}
        {hasOwnHeading ? null : <h1>{page.data.title}</h1>}
        <MDX components={getMDXComponents()} />
      </DocsBody>
      <Feedback pageUrl={page.url} />
      {lastModified ? (
        <p className="mt-4 text-sm text-fd-muted-foreground">
          Last updated on{' '}
          <time dateTime={new Date(lastModified).toISOString()}>
            {new Date(lastModified).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC',
            })}
          </time>
        </p>
      ) : null}
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // `metaTitle` preserves the long MkDocs <title>; `title` is the short sidebar
  // label. See scripts/migration/convert-frontmatter.mjs. Pages that have only
  // the short label get the brand appended — see lib/seo.ts.
  const title = composeTitle(page.data.metaTitle ?? page.data.title);

  return {
    title,
    description: page.data.description,
    alternates: {
      canonical: absoluteUrl(page.url),
      // Point LLM crawlers at this page's Markdown source, published alongside
      // the HTML by scripts/copy-assets.mjs. This has to be set per page:
      // Next replaces the layout's `alternates` wholesale rather than merging it.
      types: { 'text/markdown': markdownUrl(page.path) },
    },
    openGraph: {
      title,
      description: page.data.description,
      url: absoluteUrl(page.url),
      siteName: 'OpenObserve Documentation',
      type: 'article',
      images: [SOCIAL_IMAGE],
      // `article:modified_time` is a freshness signal for search engines and AI
      // crawlers; overrides/main.html emitted it on every page under MkDocs.
      ...(page.data.lastModified
        ? { modifiedTime: new Date(page.data.lastModified).toISOString() }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: page.data.description,
      images: [SOCIAL_IMAGE.url],
    },
  };
}
