'use client';

import type { ComponentProps } from 'react';
import { TOCScrollArea, useTOCItems } from 'fumadocs-ui/components/toc';
import { TOCItem, TOCItems } from 'fumadocs-ui/components/toc/default';
import { Container } from 'fumadocs-ui/layouts/docs/page/slots/container';
import { Footer, type FooterProps } from 'fumadocs-ui/layouts/docs/page/slots/footer';

/**
 * Landmark wrappers for DocsPage's `slots`. Fumadocs renders the page as a bare
 * <article> and the previous/next links as a <div>, so the static HTML had no
 * <main>, <nav> or <footer> for crawlers and assistive technology to find.
 *
 * <main> takes over the article's grid cell; the article inside it keeps its
 * own width and centring classes, which work the same in a flex column.
 */
export function PageContainer(props: ComponentProps<'article'>) {
  return (
    <main className="[grid-area:main] flex min-w-0 flex-col">
      <Container {...props} />
    </main>
  );
}

/**
 * The desktop table of contents, as Fumadocs draws it, except that the
 * "On this page" label is a <p> rather than an <h3>. As a heading it joined the
 * document outline, and on pages with no H2 it came straight after the H1 as an
 * H3, a skipped level. It is UI chrome, not part of the page's structure.
 * Mirrors fumadocs-ui/dist/layouts/docs/page/slots/toc.js (16.x); recheck it
 * on a Fumadocs upgrade.
 */
export function PageTOC() {
  const items = useTOCItems();
  if (items.length === 0) {
    return <div id="nd-toc-placeholder" className="hidden xl:layout:[--fd-toc-width:268px]" />;
  }
  return (
    <div
      id="nd-toc"
      className="sticky top-(--fd-docs-row-1) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] flex flex-col [grid-area:toc] w-(--fd-toc-width) pt-12 pe-4 pb-2 xl:layout:[--fd-toc-width:268px] max-xl:hidden"
    >
      <p id="toc-title" className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground">
        {/* Lucide's "text" icon, inlined: lucide-react is a dependency of
            fumadocs-ui, not of this repo, so it can't be imported here. */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M15 18H3" />
          <path d="M17 6H3" />
          <path d="M21 12H3" />
        </svg>
        On this page
      </p>
      <TOCScrollArea>
        <TOCItems>
          {items.map((item) => (
            <TOCItem key={item.url} item={item} />
          ))}
        </TOCItems>
      </TOCScrollArea>
    </div>
  );
}

export function PageFooter(props: FooterProps) {
  return (
    <footer>
      <nav aria-label="Previous and next pages">
        <Footer {...props} />
      </nav>
    </footer>
  );
}
