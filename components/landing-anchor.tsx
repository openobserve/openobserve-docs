'use client';

import Link from 'next/link';

/**
 * Landing-page link. Internal hrefs go through next/link; absolute ones open in
 * a new tab.
 *
 * `clarityTitle` opts a card into the Microsoft Clarity click event that
 * `docs/js/landing-individual-card-ms-tracking.js` fired on the MkDocs landing
 * page (event name and metadata keys unchanged). Clarity itself is loaded by
 * the GTM container, so `window.clarity` can be absent — locally, or with the
 * container blocked — and the click then simply navigates.
 */
export function Anchor({
  href,
  className,
  clarityTitle,
  children,
}: {
  href: string;
  className?: string;
  clarityTitle?: string;
  children: React.ReactNode;
}) {
  const onClick = clarityTitle
    ? () => {
        const clarity = (window as { clarity?: (...args: unknown[]) => void }).clarity;
        if (typeof clarity !== 'function') return;
        clarity('event', 'docs_landing_page_card_click');
        clarity('set', 'cardTitle', clarityTitle);
        clarity('set', 'cardUrl', href);
      }
    : undefined;

  if (/^https?:/.test(href)) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noreferrer noopener"
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
