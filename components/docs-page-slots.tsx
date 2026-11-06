'use client';

import type { ComponentProps } from 'react';
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

export function PageFooter(props: FooterProps) {
  return (
    <footer>
      <nav aria-label="Previous and next pages">
        <Footer {...props} />
      </nav>
    </footer>
  );
}
