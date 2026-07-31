'use client';

import type { ImgHTMLAttributes } from 'react';

/**
 * The source-tile icons on the landing page.
 *
 * The Jinja template wrote these as `<img … onerror="this.style.display='none'">`
 * — half of them are pulled from `cdn.simpleicons.org`, and the handler hides the
 * broken-image glyph when the CDN does not have one. An inline handler cannot
 * cross a Server Component boundary, so it lives here instead; this is the only
 * interactive part of an otherwise static page.
 */
export function RemoteIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={props.alt ?? ''}
      onError={(event) => {
        event.currentTarget.style.display = 'none';
      }}
    />
  );
}
