import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DocsBody, DocsPage } from 'fumadocs-ui/layouts/docs/page';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/components/mdx-components';
import { Feedback } from '@/components/feedback';
import { LlmPageActions } from '@/components/llm-page-actions';
import { PageStructuredData } from '@/components/structured-data';
import { absoluteUrl } from '@/lib/constants';

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const { body: MDX, toc, lastModified } = page.data;

  return (
    <DocsPage toc={toc} full={false}>
      <PageStructuredData
        title={page.data.title}
        pageUrl={page.url}
        lastModified={lastModified}
      />
      <div className="mb-4 flex justify-end">
        <LlmPageActions markdownPath={page.path} />
      </div>
      {/*
        The frontmatter title is deliberately NOT rendered as an <h1>: every page
        already opens with its own SEO-tuned H1 in the body, carried over from
        MkDocs. Rendering both would duplicate the heading.
      */}
      <DocsBody>
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
  // label. See scripts/migration/convert-frontmatter.mjs.
  const title = page.data.metaTitle ?? page.data.title;

  return {
    title,
    description: page.data.description,
    alternates: { canonical: absoluteUrl(page.url) },
    openGraph: {
      title,
      description: page.data.description,
      url: absoluteUrl(page.url),
      siteName: 'OpenObserve Documentation',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: page.data.description,
    },
  };
}
