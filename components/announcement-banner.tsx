'use client';

import { useEffect, useState } from 'react';
import { Banner } from 'fumadocs-ui/components/banner';

/**
 * Site-wide announcement banner, mirroring the one above the marketing site's
 * header (website5 `HeroBanner.vue`).
 *
 * The docs are a static export, so the banner can't be baked in at build time
 * without going stale. Instead it is fetched in the browser on every page load
 * from `/banner.json`, which website5 publishes from the same CMS data its own
 * banner renders. Plain `fetch` ignores Next's `basePath`, so the root-relative
 * URL resolves to the site root the docs are served under (openobserve.ai, or
 * staging) — same origin, so no CORS. Don't make it absolute: CloudFront doesn't
 * key its cache on `Origin`, so the CORS header on that file comes and goes.
 * In `next dev` the path is proxied to openobserve.ai (see next.config.mjs).
 */
const BANNER_URL = '/banner.json';

type BannerData = {
  tag: string | null;
  title: string;
  link: string | null;
  date: string;
  time: string;
  /** ISO instant the event finishes; null for announcements with no end. */
  endsAt: string | null;
  primaryButton: { text: string; link: string; target: string | null } | null;
};

/**
 * `/banner.json` lists every candidate soonest first (the recurring
 * "Getting Started" webinar is already excluded there). It is only regenerated
 * when the marketing site builds, so the choice of which one is still current
 * has to be made here, against the visitor's clock.
 */
function pickCurrent(candidates: unknown): BannerData | null {
  if (!Array.isArray(candidates)) return null;
  const now = Date.now();
  return (
    candidates.find(
      (c: BannerData) => c?.title && (!c.endsAt || new Date(c.endsAt).getTime() > now),
    ) ?? null
  );
}

/** Stable per-announcement id: a dismissed banner stays dismissed until the CMS entry changes. */
function bannerId(title: string) {
  return `oo-banner-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

/*
 * Dismissal lasts for the browser session only, so it lives in sessionStorage.
 * Fumadocs' `Banner` hard-codes localStorage when given an `id`, so it gets no
 * `id` here and the close button is ours. Storage can throw (blocked site data),
 * in which case the banner just isn't remembered as dismissed.
 */
function isDismissed(id: string) {
  try {
    return sessionStorage.getItem(id) === 'true';
  } catch {
    return false;
  }
}

function rememberDismissed(id: string) {
  try {
    sessionStorage.setItem(id, 'true');
  } catch {}
}

export function AnnouncementBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(BANNER_URL, { cache: 'no-store', signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const current = pickCurrent(json?.data);
        // Checked before rendering, so a dismissed banner never flashes.
        if (current && !isDismissed(bannerId(current.title))) setBanner(current);
      })
      // Decorative: a failed fetch just means no banner.
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!banner) return null;

  const button = banner.primaryButton;
  const external = button?.target === '_blank';

  function dismiss() {
    rememberDismissed(bannerId(banner!.title));
    setBanner(null);
  }

  return (
    <Banner
      height="3rem"
      className="z-50 gap-3 bg-[#1f0a4b] pe-10 text-xs text-white md:text-sm [&>button]:text-white/70 [&>button:hover]:text-white"
    >
      {button ? (
        <>
          <span className="truncate">
            {banner.tag && <span className="font-semibold">{banner.tag}</span>}
            {banner.title}
          </span>
          {(banner.date || banner.time) && (
            <span className="hidden shrink-0 text-white/80 lg:inline">
              {[banner.date, banner.time].filter(Boolean).join(' · ')}
            </span>
          )}
          <a
            href={button.link}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="shrink-0 rounded-md bg-white px-3 py-1 text-xs font-semibold text-[#1f0a4b] transition-opacity hover:opacity-90"
          >
            {button.text} →
          </a>
        </>
      ) : (
        <a href={banner.link ?? 'https://openobserve.ai/'} className="truncate hover:underline">
          {banner.title} →
        </a>
      )}
      <button
        type="button"
        aria-label="Close Banner"
        onClick={dismiss}
        className="absolute inset-e-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md hover:bg-white/10"
      >
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
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </Banner>
  );
}
