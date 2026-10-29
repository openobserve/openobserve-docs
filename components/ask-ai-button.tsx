'use client';

interface KapaApi {
  open: (options?: { mode?: 'ai' | 'search' }) => void;
}

declare global {
  interface Window {
    Kapa?: KapaApi;
  }
}

/**
 * Sidebar "Ask AI" button that opens the kapa.ai modal loaded by
 * components/kapa-widget.tsx (whose own floating button is hidden). The widget
 * script loads after hydration, so a click that beats it opens the modal once
 * the script finishes loading.
 */
export function AskAiButton() {
  function open() {
    const show = () => window.Kapa?.open({ mode: 'ai' });
    if (window.Kapa) {
      show();
      return;
    }
    document
      .querySelector('script[src*="widget.kapa.ai"]')
      ?.addEventListener('load', show, { once: true });
  }

  return (
    <button
      type="button"
      onClick={open}
      className="inline-flex items-center justify-center gap-2 rounded-lg border bg-fd-secondary px-4 py-2 text-sm font-semibold text-fd-secondary-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
    >
      <svg
        viewBox="0 0 24 24"
        width={16}
        height={16}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.9 2.6 8.6 7.2a2 2 0 0 1-1.4 1.4L2.6 9.9l4.6 1.3a2 2 0 0 1 1.4 1.4l1.3 4.6 1.3-4.6a2 2 0 0 1 1.4-1.4l4.6-1.3-4.6-1.3a2 2 0 0 1-1.4-1.4Z" />
        <path d="M19 14v4M17 16h4M18 3v3M16.5 4.5h3" />
      </svg>
      Ask AI
    </button>
  );
}
