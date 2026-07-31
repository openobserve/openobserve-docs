import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { DOCS_DIR } from './paths.mts';

/**
 * One entry of a `.pages` `nav:` list.
 *
 * `.pages` (mkdocs-awesome-pages-plugin) entries take three shapes, all present
 * in this repo:
 *
 *   - Overview: index.md                  → { label, target }
 *   - OTEL Collector: /docs/x/y/          → { label, target } where target is a URL
 *   - Getting Started:                    → { label, children } (a virtual group
 *       - RUM Overview: overview.md          with no directory behind it)
 */
export type NavEntry =
  | { label: string; target: string }
  | { label: string; children: NavEntry[] };

export interface PagesFile {
  /** display title for this directory */
  title?: string;
  /** explicit ordering; when absent MkDocs falls back to its default order */
  nav?: NavEntry[];
}

export function isGroup(entry: NavEntry): entry is { label: string; children: NavEntry[] } {
  return 'children' in entry;
}

function parseNav(raw: unknown): NavEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: NavEntry[] = [];

  for (const item of raw) {
    if (typeof item === 'string') {
      // A bare entry: the label comes from the target page's own title.
      out.push({ label: '', target: item });
      continue;
    }
    if (item && typeof item === 'object') {
      for (const [label, value] of Object.entries(item as Record<string, unknown>)) {
        if (typeof value === 'string') out.push({ label, target: value });
        else if (Array.isArray(value)) out.push({ label, children: parseNav(value) });
      }
    }
  }
  return out;
}

/** Read `<docs>/<dir>/.pages`; returns null when the directory has none. */
export async function readPagesFile(dir: string): Promise<PagesFile | null> {
  const file = path.join(DOCS_DIR, dir, '.pages');
  let raw: string;
  try {
    raw = await fs.readFile(file, 'utf8');
  } catch {
    return null;
  }

  const doc = (YAML.parse(raw) ?? {}) as Record<string, unknown>;
  const result: PagesFile = {};
  if (typeof doc.title === 'string') result.title = doc.title;
  if (doc.nav !== undefined) result.nav = parseNav(doc.nav);
  return result;
}
