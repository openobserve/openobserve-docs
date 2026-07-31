'use client';

import { useState } from 'react';

/**
 * "Was this page helpful?" — the MkDocs Material feedback widget, reimplemented.
 *
 * The endpoint, event name and payload shape are kept identical to
 * `docs/js/segment.js` so existing analytics keep working.
 */
const SEGMENT_PROXY_URL =
  'https://swisspipe.dev.zinclabs.dev/api/v1/4e5cac41-4d34-46f9-b862-e7ac551b5a8f/trigger';

function anonymousId(): string {
  let id = localStorage.getItem('segment_anonymous_id');
  if (!id) {
    id = `anon_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`;
    localStorage.setItem('segment_anonymous_id', id);
  }
  return id;
}

function track(properties: Record<string, unknown>) {
  try {
    void fetch(SEGMENT_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        user: { anonymousId: anonymousId() },
        event: 'O2 Website Docs Feedback',
        properties,
        timestamp: new Date().toISOString(),
        type: 'track',
      }),
    }).catch(() => {});
  } catch {
    // Feedback is best-effort; never let it break the page.
  }
}

export function Feedback({ pageUrl }: { pageUrl: string }) {
  const [sent, setSent] = useState<null | 1 | 0>(null);

  if (sent !== null) {
    return (
      <div className="mt-12 border-t border-fd-border pt-6 text-sm text-fd-muted-foreground">
        {sent === 1
          ? 'Thank you for your feedback.'
          : 'Thank you, we will review this page.'}
      </div>
    );
  }

  const vote = (rating: 1 | 0) => {
    track({ rating, page: pageUrl, url: window.location.href, title: document.title });
    setSent(rating);
  };

  return (
    <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-fd-border pt-6">
      <span className="text-sm font-medium">Was this page helpful?</span>
      <button
        type="button"
        onClick={() => vote(1)}
        className="rounded-md border border-fd-border px-3 py-1.5 text-sm transition-colors hover:bg-fd-accent"
      >
        👍 Yes
      </button>
      <button
        type="button"
        onClick={() => vote(0)}
        className="rounded-md border border-fd-border px-3 py-1.5 text-sm transition-colors hover:bg-fd-accent"
      >
        👎 Could be improved
      </button>
    </div>
  );
}
