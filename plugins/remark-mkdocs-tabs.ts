/**
 * §7.3 — `===` content tabs (`pymdownx.tabbed`).
 *
 *     === "OpenObserve Cloud (Recommended)"
 *
 *         …markdown…
 *
 *     === "Self-Hosted Installation"
 *
 *         …markdown…
 *
 * Adjacent `===` blocks form one tab group; anything between two of them starts
 * a new group. Labels are preserved verbatim, parentheses and all.
 *
 * The emitted form is fumadocs' explicit `Tabs`/`TabsList`/`TabsTrigger`/
 * `TabsContent` composition rather than the `<Tabs items={[…]}>` shorthand: the
 * shorthand needs a JS array prop, which in mdast means a hand-built estree
 * expression, and every prop here can be a plain string instead.
 *
 * Scanning and recursive body parsing are shared with §7.2 — see
 * `remark-mkdocs-blocks.ts` for why the two constructs cannot be separate passes.
 */
import type { ContainerBlock } from './mkdocs-blocks';
import {
  booleanAttribute,
  jsxElement,
  stringAttribute,
  type MdxJsxFlowElement,
} from './mdx-nodes';
import type { RootContent } from 'mdast';

export function isTab(block: ContainerBlock): boolean {
  return block.marker === '===';
}

export interface TabEntry {
  block: ContainerBlock;
  children: RootContent[];
}

export function renderTabGroup(entries: TabEntry[]): MdxJsxFlowElement {
  const values = uniqueValues(entries.map(({ block }, index) => block.title || `Tab ${index + 1}`));

  const list = jsxElement(
    'TabsList',
    [],
    entries.map(({ block }, index) =>
      jsxElement('TabsTrigger', [stringAttribute('value', values[index]!)], [
        { type: 'text', value: block.title || `Tab ${index + 1}` } as RootContent,
      ]),
    ),
  );

  // `forceMount` keeps every panel in the DOM, hidden by CSS rather than
  // unmounted. Without it Radix renders only the active panel, and the other
  // tabs' headings, links and text disappear from the static HTML — MkDocs'
  // CSS-only tabs put all of them in the page, and Rule S-3 covers the anchors
  // inside them. fumadocs already styles for this
  // (`data-[state=inactive]:hidden` on TabsContent).
  const panels = entries.map(({ children }, index) =>
    jsxElement(
      'TabsContent',
      [stringAttribute('value', values[index]!), booleanAttribute('forceMount')],
      children,
    ),
  );

  // First tab active by default, matching pymdownx.tabbed.
  return jsxElement('Tabs', [stringAttribute('defaultValue', values[0]!)], [list, ...panels]);
}

/** Radix keys panels by value, so two tabs with the same label must not collide. */
function uniqueValues(labels: string[]): string[] {
  const seen = new Map<string, number>();
  return labels.map((label) => {
    const count = seen.get(label) ?? 0;
    seen.set(label, count + 1);
    return count === 0 ? label : `${label} (${count + 1})`;
  });
}
