/**
 * Shared helpers for reading the MkDocs `awesome-pages` `.pages` files.
 *
 * A `.pages` file looks like:
 *
 *   title: Enterprise Setup
 *   nav:
 *     - Overview: index.md
 *     - Amazon EKS: amazon-eks.md
 *     - Some Group:
 *         - Nested: nested.md
 *     - External: /docs/somewhere/else/
 *
 * `nav` entries are ordered; each is either `Label: target`, a bare target, or a
 * nested group (`Label:` followed by a list).
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export const DOCS_DIR = path.resolve('docs');

/** Recursively list every `.pages` file under `docs/`. */
export function findPagesFiles(dir = DOCS_DIR, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findPagesFiles(full, out);
    else if (entry.name === '.pages') out.push(full);
  }
  return out;
}

/** Recursively list every markdown file under `docs/`. */
export function findMarkdownFiles(dir = DOCS_DIR, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findMarkdownFiles(full, out);
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

/**
 * Normalise one `nav:` list into `{ label, target, children }` entries.
 * `label` is null for bare entries (MkDocs derives the title from the page).
 */
function parseNavList(list) {
  const entries = [];
  for (const item of list ?? []) {
    if (typeof item === 'string') {
      entries.push({ label: null, target: item, children: null });
      continue;
    }
    if (item && typeof item === 'object') {
      for (const [label, value] of Object.entries(item)) {
        if (Array.isArray(value)) {
          entries.push({ label, target: null, children: parseNavList(value) });
        } else {
          entries.push({ label, target: String(value), children: null });
        }
      }
    }
  }
  return entries;
}

/** Parse a `.pages` file into `{ title, nav }`. */
export function parsePagesFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  let data;
  try {
    data = YAML.parse(raw) ?? {};
  } catch (err) {
    throw new Error(`Failed to parse ${file}: ${err.message}`);
  }
  return {
    title: typeof data.title === 'string' ? data.title : null,
    nav: data.nav ? parseNavList(data.nav) : null,
  };
}

/**
 * Map every `.pages` nav label onto the doc file it points at, so the label can
 * become that page's short frontmatter `title`.
 *
 * Returns a Map of absolute-md-path -> label.
 */
export function buildLabelMap() {
  const labels = new Map();

  const walk = (dirAbs, entries) => {
    for (const entry of entries) {
      if (entry.children) {
        walk(dirAbs, entry.children);
        continue;
      }
      if (!entry.label || !entry.target) continue;
      // Absolute URLs (`/docs/...`) are cross-links, not local files.
      if (entry.target.startsWith('/') || /^https?:/.test(entry.target)) continue;
      if (!entry.target.endsWith('.md')) continue; // directory entry
      const abs = path.join(dirAbs, entry.target);
      if (fs.existsSync(abs)) labels.set(abs, entry.label);
    }
  };

  for (const file of findPagesFiles()) {
    const { nav } = parsePagesFile(file);
    if (nav) walk(path.dirname(file), nav);
  }
  return labels;
}

/**
 * Map a directory onto the title MkDocs gave it, which comes from either the
 * directory's own `.pages` `title:` or the parent's nav label for that folder.
 *
 * Returns a Map of absolute-dir-path -> title.
 */
export function buildDirTitleMap() {
  const titles = new Map();

  for (const file of findPagesFiles()) {
    const dirAbs = path.dirname(file);
    const { title, nav } = parsePagesFile(file);
    if (title) titles.set(dirAbs, title);
    if (!nav) continue;
    const walk = (entries) => {
      for (const entry of entries) {
        if (entry.children) {
          walk(entry.children);
          continue;
        }
        if (!entry.label || !entry.target) continue;
        if (entry.target.startsWith('/') || /^https?:/.test(entry.target)) continue;
        if (entry.target.endsWith('.md')) continue;
        const abs = path.join(dirAbs, entry.target);
        // A parent nav label wins only when the child has no `title:` of its own,
        // matching awesome-pages precedence.
        if (fs.existsSync(abs) && !titles.has(abs)) titles.set(abs, entry.label);
      }
    };
    walk(nav);
  }

  // Second pass so an explicit `title:` always beats an inherited parent label.
  for (const file of findPagesFiles()) {
    const { title } = parsePagesFile(file);
    if (title) titles.set(path.dirname(file), title);
  }
  return titles;
}
