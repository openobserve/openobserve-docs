'use client';

import { useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

/**
 * The "Was this page helpful?" widget.
 *
 * Material rendered this from the `extra.analytics.feedback` block in
 * `mkdocs.yml`; Fumadocs has no equivalent, so it is a small component here,
 * wired to the *existing* tracking functions rather than a new implementation:
 *
 *   window.trackPageFeedback(value, url, title)  — docs/js/search-tracking.js
 *   window.trackFeedback(payload)                — docs/js/segment.js
 *
 * Both are loaded by `lib/analytics.tsx` from their original URLs, so the events
 * and payloads stay byte-identical to what the site emits today (Rule S-5).
 *
 * Titles, ratings and thank-you notes are transcribed from `mkdocs.yml`.
 */
const RATINGS = [
  { value: 1, label: 'This page was helpful', note: 'Thank you for your feedback.', Icon: ThumbsUp },
  {
    value: 0,
    label: 'This page could be improved',
    note: 'Thank you, we will review this page.',
    Icon: ThumbsDown,
  },
] as const;

declare global {
  interface Window {
    trackPageFeedback?: (value: number, pageUrl: string, pageTitle: string) => void;
    trackFeedback?: (payload: Record<string, unknown>) => void;
  }
}

export function PageFeedback({ title }: { title: string }) {
  const [submitted, setSubmitted] = useState<(typeof RATINGS)[number] | null>(null);

  const submit = (rating: (typeof RATINGS)[number]) => {
    setSubmitted(rating);
    const pageUrl = window.location.href;
    window.trackPageFeedback?.(rating.value, pageUrl, title);
    window.trackFeedback?.({
      feedback_value: rating.value === 1 ? 'like' : 'dislike',
      page_url: pageUrl,
      page_title: title,
    });
  };

  return (
    <section className="mt-12 border-t pt-6" aria-labelledby="page-feedback-title">
      <p id="page-feedback-title" className="mb-3 text-sm font-medium">
        Was this page helpful?
      </p>
      {submitted ? (
        <p className="text-sm text-fd-muted-foreground">{submitted.note}</p>
      ) : (
        <div className="flex gap-2">
          {RATINGS.map((rating) => (
            <button
              key={rating.value}
              type="button"
              title={rating.label}
              aria-label={rating.label}
              onClick={() => submit(rating)}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              <rating.Icon className="size-4" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
