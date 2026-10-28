import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BASE_PATH } from '@/lib/constants';

/**
 * Shared chrome for the docs shell. The marketing site lives at the domain root,
 * so those links are written absolute and bypass `basePath` on purpose.
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${BASE_PATH}/images/logo_circle.png`}
          alt=""
          width={24}
          height={24}
          style={{ borderRadius: '50%' }}
        />
        <span style={{ fontWeight: 600 }}>OpenObserve Docs</span>
      </>
    ),
    url: '/',
  },
  links: [
    {
      type: 'icon',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7 0-.7 0-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.3 2.8.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.1.9 2.3v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3Z" />
        </svg>
      ),
      text: 'GitHub',
      url: 'https://github.com/openobserve/openobserve',
      external: true,
    },
  ],
};

/**
 * Cloud sign-up call to action. Passed as the docs sidebar's `banner`, which
 * fumadocs renders directly below the search trigger (and at the top of the
 * mobile drawer).
 */
export function SidebarGetStarted() {
  return (
    <a
      href="https://cloud.openobserve.ai/"
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg text-center bg-fd-primary px-4 py-2 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90"
    >
      Get Started Free
    </a>
  );
}
