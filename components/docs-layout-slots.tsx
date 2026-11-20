'use client';

import type { ComponentProps } from 'react';
import { Header } from 'fumadocs-ui/layouts/docs/slots/header';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  type SidebarProps,
} from 'fumadocs-ui/layouts/docs/slots/sidebar';

/**
 * <nav> landmarks around Fumadocs' docs chrome, for DocsLayout's `slots`.
 * Fumadocs renders the sidebar as an <aside> and the mobile top bar as a
 * <header>, so none of the menu sat in a <nav>. Crawlers that score
 * readability skip <nav> and <footer> text; without these, every page's
 * hundreds of sidebar labels were read as one run-on sentence ahead of the
 * article.
 *
 * Each wrapper is `display: contents`, so it generates no box: the elements
 * Fumadocs renders stay direct grid items of #nd-docs-layout, and their sticky
 * positioning, grid areas and scrolling are exactly as before. Rendered by
 * React, so the server HTML and the hydrated tree match.
 *
 * Wraps, rather than copies, the stock slots (fumadocs-ui 16.x
 * dist/layouts/docs/slots/{sidebar,header}.js), so they track upgrades.
 */
export function DocsSidebar(props: SidebarProps) {
  return (
    <nav aria-label="Docs navigation" className="contents">
      <Sidebar {...props} />
    </nav>
  );
}

/** The top bar shown below the `md` breakpoint: logo, search, menu button. */
export function DocsHeader(props: ComponentProps<'header'>) {
  return (
    <nav aria-label="Docs header" className="contents">
      <Header {...props} />
    </nav>
  );
}

// Re-exported so app/layout.tsx can assemble `slots.sidebar` from one module.
export { SidebarProvider, SidebarTrigger, useSidebar };
