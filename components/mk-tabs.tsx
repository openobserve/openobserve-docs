'use client';

import { Children, isValidElement, type ReactNode } from 'react';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';

/**
 * Wrappers for the tabbed blocks migrated from `pymdownx.tabbed`.
 *
 * Fumadocs' `Tabs` takes its labels as an `items` array prop. Deriving that
 * array from the children here keeps the remark plugin emitting nothing but
 * plain string attributes, which is all a Markdown-format MDX file can carry.
 */
export function MkTabs({ children }: { children?: ReactNode }) {
  const items = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => String((child.props as { title?: string }).title ?? ''));

  // `oo-tabs` is a stable hook for the styling in app/global.css, which restores
  // the coloured active tab and drops the heavy grey container Fumadocs wraps
  // tab sets in. Relying on Fumadocs' utility classes would break on upgrade.
  return (
    <Tabs items={items} className="oo-tabs">
      {children}
    </Tabs>
  );
}

export function MkTab({ title, children }: { title: string; children?: ReactNode }) {
  // `forceMount` keeps every panel in the DOM instead of mounting only the
  // active one. MkDocs' tabbed blocks rendered all panels and hid them with CSS,
  // and content that never renders is invisible to crawlers — these panels hold
  // whole installation paths, not just alternate one-liners.
  return (
    <Tab value={title} forceMount className="data-[state=inactive]:hidden">
      {children}
    </Tab>
  );
}
