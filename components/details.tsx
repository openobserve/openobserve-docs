import type { ReactNode } from 'react';

/**
 * Collapsible block for the `???` admonitions migrated from MkDocs.
 *
 * Deliberately a native <details> rather than Fumadocs' `Accordion`: Radix
 * unmounts collapsed panels, so their content never reaches the rendered HTML —
 * invisible to crawlers and to in-page find. MkDocs' `pymdownx.details` emitted
 * <details>, which keeps the content in the DOM, and these blocks hold a large
 * share of the site's prose (installation steps, prerequisites, troubleshooting).
 */
export function Details({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <details className="group my-4 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <summary className="cursor-pointer list-none px-4 py-3 font-medium transition-colors hover:bg-fd-accent [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="mr-2 inline-block transition-transform group-open:rotate-90"
        >
          ›
        </span>
        {title ?? 'Details'}
      </summary>
      <div className="border-t border-fd-border px-4 py-3 prose-no-margin">{children}</div>
    </details>
  );
}
