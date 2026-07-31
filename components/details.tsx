import type { ReactNode } from 'react';

/**
 * Collapsible block for the `???` admonitions migrated from MkDocs.
 *
 * A native <details> rather than Fumadocs' `Accordion`: Radix unmounts collapsed
 * panels, so their content never reaches the rendered HTML — invisible to
 * crawlers and to in-page find. These blocks hold a large share of the site's
 * prose (installation steps, prerequisites, troubleshooting).
 *
 * Styling mirrors what Material for MkDocs gave an untyped `???` block: a blue
 * accent border, tinted and bolded summary bar, a round icon on the left and a
 * chevron on the right. Fumadocs' neutral default rendered these as a grey box
 * barely distinguishable from the page, which read as inert rather than
 * clickable. See `.oo-details` in app/global.css.
 */
export function Details({
  title,
  id,
  children,
}: {
  title?: string;
  /** Slug of the title, so `#some-block` links to this collapsible. */
  id?: string;
  children?: ReactNode;
}) {
  return (
    <details className="oo-details" id={id}>
      <summary>
        <span className="oo-details-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25Z" />
          </svg>
        </span>
        <span className="oo-details-title">{title ?? 'Details'}</span>
        <svg
          className="oo-details-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </summary>
      <div className="oo-details-body prose-no-margin">{children}</div>
    </details>
  );
}
