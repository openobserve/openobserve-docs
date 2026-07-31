/**
 * Maps the remark directives produced by the MkDocs migration onto Fumadocs
 * components.
 *
 *   :::note[Title]        -> <CalloutContainer type="info"><CalloutTitle>…
 *   :::accordion[Title]   -> <Details title="Title">      (a native <details>)
 *   ::::tabs / :::tab[X]  -> <MkTabs><MkTab title="X">
 *
 * Callouts are emitted as the CalloutContainer/Title/Description trio rather
 * than the shorthand `<Callout title>` so that a title containing Markdown
 * (`**No** data`) still renders as Markdown.
 *
 * Requires `remark-directive` to run first.
 */
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

/** Directive name -> Fumadocs Callout `type`. */
const CALLOUT_TYPES: Record<string, string> = {
  note: 'info',
  info: 'info',
  tip: 'idea',
  question: 'info',
  success: 'success',
  warning: 'warn',
  danger: 'error',
};

type AnyNode = any;

function attr(name: string, value: string | null) {
  return { type: 'mdxJsxAttribute', name, value };
}

/** Pull the `[Label]` out of a directive's children. */
function takeLabel(node: AnyNode): { label: AnyNode[] | null; rest: AnyNode[] } {
  const label: AnyNode[] = [];
  const rest: AnyNode[] = [];
  for (const child of node.children ?? []) {
    if (child.type === 'paragraph' && child.data?.directiveLabel) label.push(...child.children);
    else rest.push(child);
  }
  return { label: label.length ? label : null, rest };
}

/** Flatten label nodes to plain text, for props typed as `string`. */
function toText(nodes: AnyNode[] | null): string {
  if (!nodes) return '';
  let out = '';
  const walk = (n: AnyNode) => {
    if (typeof n.value === 'string') out += n.value;
    if (Array.isArray(n.children)) n.children.forEach(walk);
  };
  nodes.forEach(walk);
  return out;
}

export const remarkMkdocsDirectives: Plugin<[], Root> = () => {
  return (tree, file) => {
    const unknown = new Set<string>();

    visit(tree, (node: AnyNode) => {
      if (node.type !== 'containerDirective') return;
      const name = node.name as string;

      // ----- callouts -------------------------------------------------------
      if (name in CALLOUT_TYPES) {
        const { label, rest } = takeLabel(node);
        const children: AnyNode[] = [];
        if (label) {
          children.push({
            type: 'mdxJsxFlowElement',
            name: 'CalloutTitle',
            attributes: [],
            // Inline nodes go in directly: CalloutTitle renders a <p>, so
            // wrapping them in a paragraph would nest <p> inside <p> and break
            // hydration. (CalloutDescription renders a <div>, so blocks are fine.)
            children: label,
          });
        }
        if (rest.length) {
          children.push({
            type: 'mdxJsxFlowElement',
            name: 'CalloutDescription',
            attributes: [],
            children: rest,
          });
        }
        Object.assign(node, {
          type: 'mdxJsxFlowElement',
          name: 'CalloutContainer',
          attributes: [attr('type', CALLOUT_TYPES[name])],
          children,
        });
        return;
      }

      // ----- accordions -----------------------------------------------------
      if (name === 'accordion') {
        const { label, rest } = takeLabel(node);
        Object.assign(node, {
          type: 'mdxJsxFlowElement',
          name: 'Details',
          attributes: [attr('title', toText(label) || 'Details')],
          children: rest,
        });
        return;
      }

      // ----- tabs -----------------------------------------------------------
      if (name === 'tabs') {
        Object.assign(node, {
          type: 'mdxJsxFlowElement',
          name: 'MkTabs',
          attributes: [],
          children: node.children ?? [],
        });
        return;
      }

      if (name === 'tab') {
        const { label, rest } = takeLabel(node);
        Object.assign(node, {
          type: 'mdxJsxFlowElement',
          name: 'MkTab',
          attributes: [attr('title', toText(label))],
          children: rest,
        });
        return;
      }

      unknown.add(name);
    });

    if (unknown.size) {
      console.warn(
        `[mkdocs-directives] ${file.path}: unhandled directive(s): ${[...unknown].join(', ')}`,
      );
    }
  };
};
