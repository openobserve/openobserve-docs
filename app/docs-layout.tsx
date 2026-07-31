import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { SidebarLogo, SidebarThemeSwitch } from '@/lib/sidebar-header';
import { MobileSidebarTrigger } from '@/lib/mobile-sidebar-trigger';

/**
 * Rule S-4 — docs pages render content and navigation only.
 *
 * The marketing header (3,286 lines) and footer (1,521 lines) are not ported,
 * and Fumadocs' own navbar is disabled. The navbar normally hosts the search
 * trigger, the theme toggle and the mobile sidebar button, so all three are
 * relocated (decision D-1, option A) — removing them outright would break
 * search (S-5) and mobile navigation.
 *
 * ── Where each control ends up ──────────────────────────────────────────────
 *
 * With `nav.enabled: false`, fumadocs' sidebar renders the search trigger in its
 * header block by itself, so only the wordmark and the theme toggle need
 * placing:
 *
 *   nav.title      the wordmark, in the sidebar's title slot
 *   nav.children   the theme toggle, beside it in the same top row
 *
 * `themeSwitch.enabled: false` turns off fumadocs' own placement, which would
 * otherwise put the toggle in the sidebar *footer* inside a bordered container
 * shared with icon links — and with no icon links to share it with, that renders
 * as an empty box at the bottom of the sidebar. Disabling it also removes the
 * footer block entirely, since nothing else was in it.
 *
 * `nav.children` is desktop-only (the mobile drawer does not render it), so the
 * drawer gets its own copy through `sidebar.banner`, hidden at `md` and above.
 */
export function SiteDocsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        enabled: false,
        title: <SidebarLogo />,
        children: <SidebarThemeSwitch />,
      }}
      themeSwitch={{ enabled: false }}
      sidebar={{
        collapsible: true,
        banner: <SidebarThemeSwitch className="self-start md:hidden" />,
      }}
    >
      <MobileSidebarTrigger />
      {children}
    </DocsLayout>
  );
}
