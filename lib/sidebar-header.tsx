import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { withBasePath } from './base-path';

/**
 * The wordmark shown at the top of the sidebar.
 *
 * Passed as `nav.title`, which fumadocs renders into the sidebar's own header
 * row even when the navbar is disabled (Rule S-4). It deliberately does *not*
 * bring its own search trigger: the sidebar already renders one directly below.
 */
export function SidebarLogo() {
  return (
    // A raw <img> src is not rewritten by Next's basePath — §6.2.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={withBasePath('/assets/logo_horizontal.svg')}
      alt="OpenObserve"
      className="h-6 w-auto"
    />
  );
}

/**
 * The theme toggle, for the sidebar's top row.
 *
 * Fumadocs' own `themeSwitch` slot renders into the sidebar *footer*, inside a
 * bordered container it shares with icon links (GitHub, Discord…). With no icon
 * links configured — Rule S-4 leaves us none — that container renders as an
 * empty box with the toggle floated to one side, pinned to the bottom of the
 * sidebar. So the slot is disabled and the toggle is placed here instead, in
 * `nav.children`, which sits between the wordmark and the collapse button.
 */
export function SidebarThemeSwitch({ className }: { className?: string }) {
  return <ThemeSwitch mode="light-dark" className={className} />;
}
