import Script from 'next/script';
import { withBasePath } from './base-path';

/**
 * The client scripts `mkdocs.yml` loads, ported to `next/script`.
 *
 * Four of them are framework-agnostic and are loaded from their original URLs —
 * `docs/js/` is carried into the build verbatim by the asset sync, so these keep
 * working from the same paths and stay a single source of truth. Rule S-1 means
 * they cannot be edited anyway.
 *
 * Deliberately NOT ported:
 *
 * - `js/theme.js` — reads and writes Material's `data-md-color-scheme`. Theme
 *   state is now owned by fumadocs' `RootProvider` (next-themes), which also
 *   supplies its own flash-prevention script, so loading this would fight it.
 * - `js/search-close-minimal.js` — hooks Material's search dialog, which no
 *   longer exists. Fumadocs' dialog closes on select and on Escape already.
 * - `js/llm-page-actions.js` — mounts into `.md-sidebar--secondary`, Material's
 *   TOC rail. Replaced by fumadocs' own page actions, pointed at the same raw
 *   markdown URLs.
 * - `js/ms-clarity.js`, `js/zinc.js`, `js/vector_co.js`, `js/reo.js`,
 *   `js/toc-highlight.js` — commented out in `mkdocs.yml`; dead on the live site.
 */
export function Analytics() {
  return (
    <>
      {/* Google Tag Manager (GTM-5RDZ55LR) */}
      <Script src={withBasePath('/js/google-tag-manager.js')} strategy="afterInteractive" />
      {/* Defines window.trackFeedback, used by the feedback widget. */}
      <Script src={withBasePath('/js/segment.js')} strategy="afterInteractive" />
      <Script src={withBasePath('/js/openobserve-rum.js')} strategy="afterInteractive" />
      {/* Exposes trackSearchQuery / trackResultClick / trackPageFeedback. */}
      <Script src={withBasePath('/js/search-tracking.js')} strategy="afterInteractive" />
      {/*
        Keys off `.md-typeset p > img`; `DocsBody` keeps that class for exactly
        this reason — see app/[...slug]/page.tsx.
      */}
      <Script src={withBasePath('/js/image-lightbox.js')} strategy="afterInteractive" />
      <Script src="https://buttons.github.io/buttons.js" strategy="afterInteractive" async />
    </>
  );
}
