import Link from 'next/link';
import { source } from '@/lib/source';
import type * as PageTree from 'fumadocs-core/page-tree';

/**
 * The child pages of a section index, each with its own description.
 *
 * Rendered from `::child-pages` — see lib/remark/child-pages.ts.
 *
 * Order comes from the page tree, which is the order the sidebar shows and the
 * order `meta.json` declares, so the list cannot drift from the navigation. The
 * descriptions come from each child's frontmatter, which
 * `scripts/check-seo.mjs` already requires on every page, so no entry can be
 * blank.
 */
export function ChildPages({ url }: { url: string }) {
  const folder = findFolder(source.pageTree, url);
  if (!folder) return null;

  // Descriptions live on the page, not on the tree node.
  const byUrl = new Map(source.getPages().map((page) => [page.url, page]));

  const children = folder.children
    .map((node) => toEntry(node, byUrl))
    .filter((entry): entry is Entry => entry !== null)
    // A folder's own index page is the page rendering this list.
    .filter((entry) => entry.url !== url);

  if (children.length === 0) return null;

  return (
    <ul className="not-prose my-6 grid gap-3 sm:grid-cols-2">
      {children.map((child) => (
        <li key={child.url}>
          <Link
            href={child.url}
            className="block h-full rounded-lg border border-fd-border p-4 transition-colors hover:bg-fd-accent"
          >
            <span className="block font-medium text-fd-foreground">{child.name}</span>
            {child.description ? (
              <span className="mt-1 block text-sm text-fd-muted-foreground">
                {child.description}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

interface Entry {
  url: string;
  name: string;
  description?: string;
}

/**
 * Maps a tree node to a linkable entry.
 *
 * A folder is represented by its index page: linking to a folder that has none
 * would point at a URL the export never wrote. Separators have no URL at all.
 */
function toEntry(
  node: PageTree.Node,
  byUrl: Map<string, { data: { description?: string } }>,
): Entry | null {
  const item = node.type === 'folder' ? node.index : node.type === 'page' ? node : undefined;
  if (!item?.url) return null;
  return {
    url: item.url,
    name: typeof item.name === 'string' ? item.name : item.url,
    description:
      (typeof item.description === 'string' ? item.description : undefined) ??
      byUrl.get(item.url)?.data.description,
  };
}

/**
 * The folder that `url` is the index of.
 *
 * Two shapes have to be handled, because `meta.json` decides which one a folder
 * gets. Where the file does not name `index` in its `pages` array, Fumadocs
 * attaches the index page as the folder's `index`. Where it does — as
 * `ingestion/traces/meta.json` and roughly half the others do — the index page
 * is instead an ordinary `page` child, and `folder.index` is undefined. Matching
 * only the first shape found the folder for 2 of the 7 pages using this
 * component and silently rendered nothing for the rest.
 */
function findFolder(
  node: PageTree.Root | PageTree.Folder,
  url: string,
): PageTree.Folder | null {
  for (const child of node.children) {
    if (child.type !== 'folder') continue;
    if (child.index?.url === url) return child;
    if (child.children.some((n) => n.type === 'page' && n.url === url)) return child;
    const found = findFolder(child, url);
    if (found) return found;
  }
  return null;
}
