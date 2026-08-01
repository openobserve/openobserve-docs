/**
 * Search and reaction analytics carried over from `docs/js/search-tracking.js`
 * on the MkDocs site.
 *
 * The endpoint, credentials, event names (`doc-search`, `doc-search-click`,
 * `reaction`) and payload shapes are kept identical so the existing dashboards
 * keep working. The credentials shipped in the public MkDocs bundle already, so
 * carrying them here exposes nothing new.
 *
 * Gated by lib/telemetry.ts plus the `internal_user=1` opt-out cookie the
 * MkDocs script honoured. Browser-only: call from event handlers or effects.
 */
import { isTelemetryEnabled } from './telemetry';

const API_ENDPOINT =
  'https://introspection.dev.zinclabs.dev/api/328BSXphtxxMrgN41UUYA7Ll9ie/website_search/_json';
const USERNAME = 'vaidehi@openobserve.ai';
const PASSWORD = 'vaidehikiaratechx';

function isInternalUser(): boolean {
  try {
    return (
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('internal_user='))
        ?.split('=')[1] === '1'
    );
  } catch {
    return false;
  }
}

function send(type: string, payload: Record<string, unknown>) {
  if (!isTelemetryEnabled() || isInternalUser()) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[introspection] not sent (telemetry disabled):', type, payload);
    }
    return;
  }
  try {
    // keepalive: doc-search-click fires right before navigating away.
    void fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`),
      },
      keepalive: true,
      body: JSON.stringify({
        url: window.location.href,
        path: window.location.pathname,
        domain: window.location.hostname,
        type,
        ...payload,
      }),
    }).catch(() => {});
  } catch {
    // Analytics is best-effort; never let it break the page.
  }
}

export function trackDocSearch(query: string, resultCount: number) {
  const q = query.trim();
  if (!q) return;
  send('doc-search', { search_query: q, result_count: resultCount });
}

export function trackDocSearchClick(result: {
  url: string;
  title: string;
  rank: number;
  query: string;
  resultCount: number;
}) {
  send('doc-search-click', {
    result_url: result.url,
    result_rank: result.rank,
    result_title: result.title,
    search_query: result.query,
    result_count: result.resultCount,
  });
}

export function trackReaction(rating: 1 | 0, pageUrl: string) {
  send('reaction', {
    feedback_value: rating === 1 ? 'like' : 'dislike',
    page_url: pageUrl,
  });
}
