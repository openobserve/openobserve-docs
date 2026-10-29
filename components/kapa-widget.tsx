import Script from 'next/script';
import { BASE_PATH, KAPA_WEBSITE_ID, SITE_URL } from '@/lib/constants';

/**
 * kapa.ai "Ask AI" widget: a chat answered from these docs, with kapa's own
 * search tab alongside. kapa's floating launcher button is hidden; the modal is
 * opened from the sidebar instead (components/ask-ai-button.tsx).
 *
 * Renders nothing until NEXT_PUBLIC_KAPA_WEBSITE_ID is set (see lib/constants.ts).
 * Deliberately leaves `data-modal-open-on-command-k` off — Ctrl/Cmd+K already
 * opens the Fumadocs search (components/search-dialog.tsx).
 *
 * A server component on purpose: the empty check runs at build time, so with no
 * ID the export carries no trace of kapa. As a client component the script URL
 * would still ship in a JS chunk, since the bundler can't drop a branch guarded
 * by a constant imported from another module.
 *
 * The logo URL is absolute because the widget renders it as a plain image, which
 * gets no `basePath` treatment. The colour is `--oo-brand` from app/global.css.
 */
export function KapaWidget() {
  if (!KAPA_WEBSITE_ID) return null;

  return (
    <Script
      src="https://widget.kapa.ai/kapa-widget.bundle.js"
      strategy="afterInteractive"
      data-website-id={KAPA_WEBSITE_ID}
      data-project-name="OpenObserve"
      data-project-color="#7c3aed"
      data-project-logo={`${SITE_URL}${BASE_PATH}/images/logo_circle.png`}
      data-search-mode-enabled="true"
      data-button-hide="true"
    />
  );
}
