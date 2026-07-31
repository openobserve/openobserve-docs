/**
 * §7.2 — `!!!` admonitions and `???` collapsibles.
 *
 *     !!! tip "Sizing the cluster"
 *         For recommended CPU, memory, and storage values, see
 *         [Capacity planning](../../enterprise-setup/capacity-planning.md).
 *
 * becomes a `<Callout type="idea" title="Sizing the cluster">` whose body is the
 * recursively-parsed markdown, and `???` becomes a `<Accordions>/<Accordion>`
 * pair (collapsed by default; `???+` opens by default).
 *
 * Why not the built-in? `fumadocs-core`'s `remarkAdmonition` targets Docusaurus'
 * *fenced* `:::note … :::` form and is deprecated. Its `tag` option cannot
 * express a construct that is indentation-delimited with no closing marker.
 *
 * This module owns the grammar and the JSX emission; the scanning and
 * recursive-parsing machinery is shared with §7.3 in `remark-mkdocs-blocks.ts`,
 * because the two constructs nest inside each other and cannot be separate
 * passes.
 */
import type { ContainerBlock } from './mkdocs-blocks';
import {
  booleanAttribute,
  jsxElement,
  stringAttribute,
  type MdxJsxFlowElement,
} from './mdx-nodes';
import type { RootContent } from 'mdast';

/**
 * MkDocs admonition class → fumadocs `Callout` type.
 *
 * `node` is a typo for `note` that appears twice in the content. Rule S-1 says
 * we absorb it here rather than fixing the source.
 */
const CALLOUT_TYPES: Record<string, string> = {
  note: 'info',
  info: 'info',
  abstract: 'info',
  summary: 'info',
  tldr: 'info',
  question: 'info',
  help: 'info',
  faq: 'info',
  quote: 'info',
  cite: 'info',
  example: 'info',
  node: 'info', // typo in source — absorbed, not fixed (S-1, risk R-11)
  tip: 'idea',
  hint: 'idea',
  important: 'idea',
  success: 'success',
  check: 'success',
  done: 'success',
  warning: 'warn',
  caution: 'warn',
  attention: 'warn',
  danger: 'error',
  error: 'error',
  bug: 'error',
  failure: 'error',
  fail: 'error',
  missing: 'error',
};

/** Python-Markdown's `str.capitalize()`: first character upper, rest lower. */
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/**
 * The title Material renders.
 *
 * Python-Markdown (`admonition.get_class_and_title`): an omitted title defaults
 * to the first class, capitalised; an explicit `""` suppresses the title
 * entirely. Unknown classes such as `!!! Configuration` therefore still render
 * with "Configuration" as the heading, which is why the class is not required
 * to be in `CALLOUT_TYPES`.
 */
export function admonitionTitle(block: ContainerBlock): string | undefined {
  if (block.title !== undefined) return block.title === '' ? undefined : block.title;
  const first = block.classes[0];
  return first ? capitalize(first) : undefined;
}

export function calloutType(block: ContainerBlock): string {
  for (const className of block.classes) {
    const mapped = CALLOUT_TYPES[className];
    if (mapped) return mapped;
  }
  // Material gives an unrecognised class the base admonition styling, which is
  // the same neutral box as `note`.
  return 'info';
}

export function isAdmonition(block: ContainerBlock): boolean {
  return block.marker === '!!!';
}

export function isCollapsible(block: ContainerBlock): boolean {
  return block.marker === '???' || block.marker === '???+';
}

export function renderAdmonition(
  block: ContainerBlock,
  children: RootContent[],
): MdxJsxFlowElement {
  const title = admonitionTitle(block);
  return jsxElement(
    'Callout',
    [
      stringAttribute('type', calloutType(block)),
      ...(title === undefined ? [] : [stringAttribute('title', title)]),
    ],
    children,
  );
}

/**
 * `???` becomes a native `<details>` / `<summary>`, not fumadocs' `Accordion`.
 *
 * This is both the more faithful and the safer mapping. `pymdownx.details`
 * literally emits `<details><summary>`, and Material styles that element — so
 * the semantics match exactly. More importantly, fumadocs' `Accordion` is a
 * Radix component that *unmounts* its panel while collapsed, which would take
 * 625 collapsible bodies out of the static HTML: their headings would lose
 * their anchors, their links would vanish from the page, and the text would not
 * be findable by in-page search or a crawler. `<details>` keeps every child in
 * the DOM. Styling is picked up from `app/global.css`.
 */
export function renderCollapsible(
  block: ContainerBlock,
  children: RootContent[],
  index: number,
): MdxJsxFlowElement {
  const summary = jsxElement('summary', [], [
    { type: 'text', value: collapsibleTitle(block, index) } as RootContent,
  ]);
  return jsxElement(
    'details',
    [
      stringAttribute('className', `mkdocs-details mkdocs-details-${calloutType(block)}`),
      // `???+` is the open-by-default variant.
      ...(block.marker === '???+' ? [booleanAttribute('open')] : []),
    ],
    [summary, ...children],
  );
}

function collapsibleTitle(block: ContainerBlock, index: number): string {
  return admonitionTitle(block) ?? `Details ${index + 1}`;
}
