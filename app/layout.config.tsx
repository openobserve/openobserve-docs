import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SidebarItem } from 'fumadocs-ui/components/sidebar/base';
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
 * Marketing-site links. Passed as the docs sidebar's `footer` rather than as
 * `baseOptions.links` so they sit *below* the page tree instead of above it —
 * fumadocs renders text link items at the top of the sidebar viewport. Absolute
 * URLs for the same reason as `nav` above: they leave the docs `basePath`.
 */
const siteLinks = [
  { text: 'Home', url: 'https://openobserve.ai/', external: true },
  { text: 'Blog', url: 'https://openobserve.ai/blog/', external: true },
  { text: 'Downloads', url: 'https://openobserve.ai/downloads/', external: true },
  { text: 'Cloud', url: 'https://cloud.openobserve.ai/', external: true },
];

/**
 * Copy of the classes fumadocs' own `SidebarItem` applies to a top-level link
 * (`itemVariants({ variant: 'link' })` in `layouts/docs/slots/sidebar`), so
 * these render identically to the page-tree entries above them.
 */
const sidebarItemClass =
  'relative flex flex-row items-center gap-2 rounded-lg p-2 text-start ' +
  'text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0 ' +
  'transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none';

export function SidebarSiteLinks() {
  return (
    // `order-first` lifts this above the icon-links / theme-switch row that
    // fumadocs renders in the same flex column of the sidebar footer.
    <nav className="flex flex-col order-first mb-2">
      {siteLinks.map((link) => (
        // `SidebarItem` is what the page tree uses, so `external` still draws
        // the same external-link icon these entries had as `baseOptions.links`.
        <SidebarItem key={link.url} href={link.url} external={link.external} className={sidebarItemClass}>
          {link.text}
        </SidebarItem>
      ))}
    </nav>
  );
}
