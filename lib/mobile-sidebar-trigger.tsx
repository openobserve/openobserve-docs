'use client';

import { Menu } from 'lucide-react';
import { SidebarTrigger } from 'fumadocs-ui/layouts/docs/slots/sidebar';

/**
 * Without a navbar (Rule S-4) there is nowhere for the mobile drawer button to
 * live, so it floats. Desktop keeps the sidebar permanently visible and hides it.
 */
export function MobileSidebarTrigger() {
  return (
    <SidebarTrigger
      aria-label="Toggle navigation"
      className="fixed bottom-4 right-4 z-30 flex size-11 items-center justify-center rounded-full border bg-fd-secondary text-fd-secondary-foreground shadow-lg md:hidden"
    >
      <Menu className="size-5" />
    </SidebarTrigger>
  );
}
