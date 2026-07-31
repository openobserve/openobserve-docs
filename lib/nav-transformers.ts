import type { Folder, Item, Node } from 'fumadocs-core/page-tree';

import navLabels from '@/.fumadocs-gen/nav-labels.json';
import navGroups from '@/.fumadocs-gen/nav-groups.json';

export interface NavGroup {
  dir: string;
  name: string;
  members: string[];
}

const labels = navLabels as Record<string, string>;
const groups = navGroups as NavGroup[];

const groupsByDir = new Map<string, NavGroup[]>();
for (const group of groups) {
  const list = groupsByDir.get(group.dir) ?? [];
  list.push(group);
  groupsByDir.set(group.dir, list);
}

/**
 * `.pages` carries a display label per nav entry; `meta.json` carries only a
 * reference, so the label would otherwise fall back to the page's own title.
 * `scripts/gen-nav.mts` records the differences and they are re-applied here,
 * keyed by page URL. No `.md` file is touched to fix a label — Rule S-1.
 *
 * Deliberately not annotated as `PageTreeTransformer`: that type is generic over
 * the content storage, and naming it pins the generic to its default, which
 * erases the page data types everywhere `source` is consumed.
 */
export const applyNavLabels = {
  file(node: Item) {
    const label = node.url ? labels[node.url] : undefined;
    return label ? { ...node, name: label } : node;
  },
};

/**
 * `.pages` can declare a nested section with no directory behind it:
 *
 *     nav:
 *       - Getting Started:
 *           - RUM Overview: overview.md
 *
 * `meta.json` has no syntax for that, so gen-nav flattens the members into the
 * folder's `pages` array and records the grouping. Here the flat children are
 * folded back into synthetic folder nodes, in place, preserving order.
 */
export const applyNavGroups = {
  folder(node: Folder, folderPath: string) {
    const dirGroups = groupsByDir.get(folderPath);
    if (!dirGroups?.length) return node;

    const byUrl = new Map<string, Node>();
    for (const child of node.children) {
      if (child.type === 'page' && child.url) byUrl.set(child.url, child);
    }

    const consumed = new Set<Node>();
    const wrappers = new Map<Node, Folder>();

    for (const group of dirGroups) {
      const members = group.members
        .map((url) => byUrl.get(url))
        .filter((child): child is Node => child !== undefined);
      if (!members.length) continue;

      wrappers.set(members[0]!, {
        $id: `${folderPath}#${group.name}`,
        type: 'folder',
        name: group.name,
        children: members as Item[],
      });
      for (const member of members) consumed.add(member);
    }

    const children: Node[] = [];
    for (const child of node.children) {
      const wrapper = wrappers.get(child);
      if (wrapper) children.push(wrapper);
      else if (!consumed.has(child)) children.push(child);
    }

    return { ...node, children: children as Folder['children'] };
  },
};

export const navTransformers = [applyNavLabels, applyNavGroups];
