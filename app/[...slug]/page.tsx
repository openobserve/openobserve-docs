import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
  PageLastUpdate,
} from 'fumadocs-ui/layouts/docs/page';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/lib/mdx-components';
import { StructuredData } from '@/lib/structured-data';
import { PageFeedback } from '@/lib/feedback';
import { SiteDocsLayout } from '../docs-layout';

/**
 * The docs catch-all lives at the ROOT of `app/`, not under `app/docs/`.
 * `basePath: '/docs'` is a *serving* prefix — it does not change the App Router
 * tree, so `app/docs/[...slug]` would serve at `/docs/docs/<slug>` (risk R-1).
 *
 * It is `[...slug]` and not `[[...slug]]` because `app/page.tsx` (the landing
 * page) already claims the root; two routes of equal specificity collide.
 */
export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const hide = page.data.hide ?? [];
  // `lastModified: true` on the collection exports the git commit date; it
  // replaces the git-revision-date-localized plugin.
  const lastModified = (page.data._exports as { lastModified?: Date } | undefined)?.lastModified;

  return (
    <SiteDocsLayout>
      {StructuredData({ title: page.data.title, url: page.url, modified: lastModified })}
      <DocsPage
        toc={hide.includes('toc') ? [] : page.data.toc}
        full={hide.includes('navigation')}
        // Rule S-4: no per-page prev/next footer.
        footer={{ enabled: false }}
      >
        <DocsTitle>{page.data.title}</DocsTitle>
        {page.data.description ? <DocsDescription>{page.data.description}</DocsDescription> : null}
        {/*
          `md-typeset` is Material's content class. It is kept because
          `docs/js/image-lightbox.js` selects `.md-typeset p > img`, and Rule S-1
          means that file cannot be edited — so the class comes to the script
          rather than the other way round.
        */}
        <DocsBody className="md-typeset">
          <MDX components={getMDXComponents()} />
        </DocsBody>
        {lastModified ? <PageLastUpdate date={new Date(lastModified)} /> : null}
        <PageFeedback title={page.data.title} />
      </DocsPage>
    </SiteDocsLayout>
  );
}

export function generateStaticParams() {
  // `source.generateParams()` includes the root page (slug: []), which belongs to
  // app/page.tsx. Emitting it here would collide with that route.
  return source.generateParams().filter((param) => param.slug.length > 0);
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const lastModified = (page.data._exports as { lastModified?: Date } | undefined)?.lastModified;

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
    // Content-freshness signal, ported from overrides/main.html.
    ...(lastModified
      ? { other: { 'article:modified_time': new Date(lastModified).toISOString() } }
      : {}),
  };
}
