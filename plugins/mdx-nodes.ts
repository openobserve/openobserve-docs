/**
 * Minimal constructors for the MDX JSX mdast nodes the compatibility layer
 * emits.
 *
 * These node types are what `fumadocs-core`'s own plugins (`remark-code-tab`,
 * `remark-admonition`) produce, and the MDX compiler handles them in
 * `format: 'md'` mode as well as in MDX mode — the format only governs what the
 * *parser* accepts, not what the tree may contain.
 *
 * Every attribute is a plain string: no `mdxJsxAttributeValueExpression`, and so
 * no hand-built estree. That is deliberate — the components chosen in
 * `lib/mdx-components.tsx` all accept string props, which keeps this layer free
 * of a JS-AST dependency.
 */
import type { RootContent } from 'mdast';

export interface MdxJsxAttribute {
  type: 'mdxJsxAttribute';
  name: string;
  /** `null` is a valueless attribute — i.e. a boolean prop set to true. */
  value: string | null;
}

export interface MdxJsxFlowElement {
  type: 'mdxJsxFlowElement';
  name: string;
  attributes: MdxJsxAttribute[];
  children: RootContent[];
}

export function stringAttribute(name: string, value: string): MdxJsxAttribute {
  return { type: 'mdxJsxAttribute', name, value };
}

/** A valueless JSX attribute, e.g. `forceMount` / `open`. */
export function booleanAttribute(name: string): MdxJsxAttribute {
  return { type: 'mdxJsxAttribute', name, value: null };
}

export function jsxElement(
  name: string,
  attributes: MdxJsxAttribute[],
  children: (RootContent | MdxJsxFlowElement)[],
): MdxJsxFlowElement {
  return { type: 'mdxJsxFlowElement', name, attributes, children: children as RootContent[] };
}
