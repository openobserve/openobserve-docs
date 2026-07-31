'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Markdown images, rendered as plain <img> with click-to-zoom.
 *
 * Replaces the MkDocs `js/image-lightbox.js`. A plain tag is used rather than
 * `next/image` because Markdown images carry no width/height, which `next/image`
 * requires. Paths already include `basePath` (see lib/remark/docs-images.ts).
 */
export function ZoomableImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [zoomed, setZoomed] = useState(false);

  const close = useCallback(() => setZoomed(false), []);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    // Stop the page scrolling behind the overlay.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [zoomed, close]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...props}
        alt={props.alt ?? ''}
        loading={props.loading ?? 'lazy'}
        decoding="async"
        onClick={() => setZoomed(true)}
        className={`cursor-zoom-in rounded-lg ${props.className ?? ''}`}
      />
      {zoomed ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={props.alt || 'Expanded image'}
          onClick={close}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            {...props}
            alt={props.alt ?? ''}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      ) : null}
    </>
  );
}
