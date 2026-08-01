/**
 * Shared guard for anything that reports to a production endpoint: analytics
 * tags and the page-feedback widget.
 *
 * Local page views and stray feedback clicks would otherwise land in the real
 * dashboards, and the third-party tags reject a localhost origin anyway, which
 * shows up as "Failed to fetch" noise in the dev overlay.
 *
 * `?analytics=1` forces reporting on for local verification.
 *
 * Browser-only: call it from an effect or an event handler, never during render,
 * or the server and client will disagree on the first paint.
 */
export function isTelemetryEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  // The override must precede the NODE_ENV check, or it can never force
  // reporting from a dev server — which is its whole purpose.
  if (new URLSearchParams(window.location.search).get('analytics') === '1') return true;

  if (process.env.NODE_ENV !== 'production') return false;

  const { hostname } = window.location;
  const local =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.endsWith('.local');
  return !local;
}
