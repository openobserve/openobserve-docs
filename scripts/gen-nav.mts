/**
 * §7.1 — `.pages` → generated `meta.json` tree.
 *
 * Reads the 82 `docs/**\/.pages` files (mkdocs-awesome-pages-plugin) and writes a
 * mirrored `meta.json` tree under `.fumadocs-gen/meta/`. Nothing is ever written
 * into `docs/` — Rule S-1.
 *
 * Three artefacts are produced:
 *
 *   .fumadocs-gen/meta/**\/meta.json   the folder ordering + folder titles
 *   .fumadocs-gen/nav-labels.json      per-page sidebar label overrides
 *   .fumadocs-gen/nav-groups.json      virtual sections declared inline in `.pages`
 *
 * The last two exist because `meta.json` carries only *references*, while `.pages`
 * carries a display label per entry and can declare a nested section with no
 * directory behind it. `lib/source.ts` applies both through page-tree transformers.
 *
 * ── How MkDocs' nav is reproduced ────────────────────────────────────────────
 *
 * `nav:` is an *exclusive* list: children not named in it are built as pages but
 * do not appear in the sidebar. So the generated `pages` array is never given a
 * trailing `...`.
 *
 * `index.md` is emitted as `"!index"` plus an explicit `[Label](/url)` entry
 * wherever `.pages` lists it. Fumadocs would otherwise hoist `index.md` into the
 * folder's own row, which collapses two sidebar rows ("Enterprise Setup" and its
 * "Overview" child) into one — a visible difference from the current site.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { DOCS_DIR, GEN_DIR, GEN_META_DIR, BASE_PATH } from './lib/paths.mts';
import { defaultOrder, readDocsTree, type DocsDir } from './lib/docs-tree.mts';
import { isGroup, readPagesFile, type NavEntry } from './lib/pages-file.mts';
import { resolveTitle } from '../plugins/page-title.ts';

interface MetaJson {
  title?: string;
  pages?: string[];
}

/** A virtual section from a nested `.pages` entry: a folder with no directory. */
interface NavGroup {
  /** docs-relative directory the group lives in */
  dir: string;
  name: string;
  /** page-tree URLs of the members, in order */
  members: string[];
}

const titleCache = new Map<string, string>();

async function pageTitle(docsRelPath: string): Promise<string> {
  const cached = titleCache.get(docsRelPath);
  if (cached !== undefined) return cached;
  const source = await fs.readFile(path.join(DOCS_DIR, docsRelPath), 'utf8');
  const title = resolveTitle(docsRelPath, source);
  titleCache.set(docsRelPath, title);
  return title;
}

/** The page-tree URL for a docs-relative markdown path (no `/docs` prefix — §6.2). */
function pageUrl(docsRelPath: string): string {
  const slug = docsRelPath.replace(/\.md$/i, '').replace(/(^|\/)index$/, '');
  return slug === '' ? '/' : `/${slug}`;
}

/** The page-tree URL for a docs-relative directory. */
function folderUrl(dir: string): string {
  return dir === '' ? '/' : `/${dir}`;
}

/**
 * `.pages` may point at an already-absolute site URL (`/docs/ingestion/logs/otlp/`).
 * Those must lose the `/docs` prefix: Next's `basePath` adds it back once at
 * render time, and leaving it in produces `/docs/docs/...` — risk R-1.
 */
function stripBasePath(url: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url; // external
  if (url === BASE_PATH) return '/';
  if (url.startsWith(`${BASE_PATH}/`)) return url.slice(BASE_PATH.length);
  return url;
}

/** meta.json `pages` link syntax, used for index pages and absolute-URL entries. */
function linkEntry(label: string, url: string): string {
  return `[${label}](${url})`;
}

async function main() {
  const tree = await readDocsTree();
  const byDir = new Map(tree.map((entry) => [entry.dir, entry]));

  /** folder title supplied by the *parent* directory's `.pages` label */
  const inheritedFolderTitle = new Map<string, string>();
  const labels: Record<string, string> = {};
  const groups: NavGroup[] = [];
  const metas = new Map<string, MetaJson>();
  const warnings: string[] = [];

  // Parent labels must be known before a folder writes its own meta.json, and a
  // parent always sorts before its children, so one ordered pass is enough.
  for (const entry of tree) {
    const pagesFile = await readPagesFile(entry.dir);
    const meta: MetaJson = {};

    const ownTitle = pagesFile?.title ?? inheritedFolderTitle.get(entry.dir);
    if (ownTitle !== undefined && entry.dir !== '') meta.title = ownTitle;

    const pages: string[] = [];
    const hasIndex = entry.files.includes('index.md');

    // Fumadocs hoists index.md into the folder row; MkDocs shows it as an
    // ordinary child (or hides it). Suppress the hoist in both cases.
    if (hasIndex && entry.dir !== '') pages.push('!index');

    const emit = async (navEntry: NavEntry, groupMembers?: string[]) => {
      if (isGroup(navEntry)) {
        const members: string[] = [];
        for (const child of navEntry.children) await emit(child, members);
        groups.push({ dir: entry.dir, name: navEntry.label, members });
        return;
      }

      const { label, target } = navEntry;

      // absolute or external URL
      if (target.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(target)) {
        const url = stripBasePath(target);
        pages.push(linkEntry(label, url));
        groupMembers?.push(url);
        return;
      }

      if (target.endsWith('.md')) {
        const rel = entry.dir ? `${entry.dir}/${target}` : target;
        if (!entry.files.includes(target)) {
          warnings.push(`${entry.dir || '<root>'}/.pages references missing page "${target}"`);
          return;
        }
        const url = pageUrl(rel);
        if (target === 'index.md') {
          pages.push(linkEntry(label || (await pageTitle(rel)), url));
        } else {
          pages.push(target.replace(/\.md$/i, ''));
          if (label) labels[url] = label;
        }
        groupMembers?.push(url);
        return;
      }

      // a sub-directory
      const childDir = entry.dir ? `${entry.dir}/${target}` : target;
      if (!byDir.has(childDir)) {
        warnings.push(`${entry.dir || '<root>'}/.pages references missing folder "${target}"`);
        return;
      }
      pages.push(target);
      if (label) inheritedFolderTitle.set(childDir, label);
      groupMembers?.push(folderUrl(childDir));
    };

    if (pagesFile?.nav?.length) {
      for (const navEntry of pagesFile.nav) await emit(navEntry);
    } else {
      // No explicit nav: MkDocs' default order — index, then files, then folders.
      for (const name of defaultOrder(entry)) {
        if (name === 'index.md') {
          if (entry.dir === '') continue; // the landing page is app/page.tsx
          const rel = `${entry.dir}/index.md`;
          pages.push(linkEntry(await pageTitle(rel), pageUrl(rel)));
        } else if (name.endsWith('.md')) {
          pages.push(name.replace(/\.md$/i, ''));
        } else {
          pages.push(name);
        }
      }
    }

    if (pages.length) meta.pages = pages;
    metas.set(entry.dir, meta);
  }

  await fs.rm(GEN_META_DIR, { recursive: true, force: true });
  for (const [dir, meta] of metas) {
    const target = path.join(GEN_META_DIR, dir, 'meta.json');
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(meta, null, 2) + '\n');
  }

  await fs.mkdir(GEN_DIR, { recursive: true });
  await fs.writeFile(
    path.join(GEN_DIR, 'nav-labels.json'),
    JSON.stringify(labels, null, 2) + '\n',
  );
  await fs.writeFile(path.join(GEN_DIR, 'nav-groups.json'), JSON.stringify(groups, null, 2) + '\n');

  console.log(
    `[gen-nav] ${metas.size} meta.json, ${Object.keys(labels).length} label overrides, ` +
      `${groups.length} virtual group(s)`,
  );
  for (const warning of warnings) console.warn(`[gen-nav] WARN ${warning}`);
}

await main();
