/**
 * Turns `::child-pages` into `<ChildPages url="/user-guide" />`.
 *
 * Section index pages are the hubs of the docs: `user-guide/index.md`,
 * `reference/api/search/index.md` and ~30 others exist mainly to hold a folder
 * together. Several carry almost no body at all — `user-guide/analytics/
 * dashboards/filters/index.md` is zero words — so they are indexable pages that
 * say nothing and link nowhere. This directive gives one a real body: its child
 * pages, each with the description already in that page's frontmatter.
 *
 * Written as a directive rather than plain JSX because the content is `.md`, not
 * `.mdx`. Markdown format does not parse JSX, and rehype-raw would lowercase a
 * literal `<ChildPages />` into an unknown `<childpages>` element. Emitting the
 * JSX node from the AST is how lib/remark/mkdocs-directives.ts supplies
 * `Details`, `MkTabs` and the callouts too.
 *
 * The page's own URL is resolved here, at compile time, from `file.path` — the
 * component is rendered by the MDX pipeline and has no other way to know which
 * page it is on.
 *
 * Requires `remark-directive` to run first.
 */
import path from 'node:path';
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

const DOCS_DIR = path.resolve('docs');

type AnyNode = any;

/** Site-root-relative URL for a docs file, matching lib/remark/mkdocs-links.ts. */
function pageUrl(filePath: string): string | null {
  const rel = path.relative(DOCS_DIR, filePath).replace(/\\/g, '/');
  if (rel.startsWith('..')) return null;
  const slug = rel
    .replace(/\.md$/, '')
    .replace(/(^|\/)index$/, '')
    .replace(/^\//, '');
  return `/${slug}`.replace(/\/$/, '') || '/';
}

export const remarkChildPages: Plugin<[], Root> = () => {
  return (tree, file) => {
    const filePath = file.path ? path.resolve(file.path) : null;
    if (!filePath) return;
    const url = pageUrl(filePath);
    if (!url) return;

    visit(tree, (node: AnyNode, index, parent: AnyNode) => {
      if (node.type !== 'leafDirective' || node.name !== 'child-pages') return;
      if (!parent || index === null || index === undefined) return;

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'ChildPages',
        attributes: [{ type: 'mdxJsxAttribute', name: 'url', value: url }],
        children: [],
      };
    });
  };
};
