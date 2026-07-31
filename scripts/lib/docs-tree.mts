import fs from 'node:fs/promises';
import path from 'node:path';
import { DOCS_DIR } from './paths.mts';

export interface DocsDir {
  /** docs-relative posix path; '' for the docs root */
  dir: string;
  /** markdown file names in this directory, e.g. 'logs.md' */
  files: string[];
  /** sub-directory names that contain markdown somewhere below them */
  dirs: string[];
}

const IGNORED_DIRS = new Set(['images', 'assets', 'js', 'stylesheets']);

/**
 * Walk `docs/` and return every directory that participates in the page tree.
 *
 * Asset directories are skipped: MkDocs never puts them in the nav, and they are
 * carried to the output by the asset sync step instead.
 */
export async function readDocsTree(): Promise<DocsDir[]> {
  const out: DocsDir[] = [];

  async function walk(rel: string): Promise<boolean> {
    const entries = await fs.readdir(path.join(DOCS_DIR, rel), { withFileTypes: true });
    const files: string[] = [];
    const dirs: string[] = [];

    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        const childRel = rel ? `${rel}/${entry.name}` : entry.name;
        if (await walk(childRel)) dirs.push(entry.name);
      } else if (entry.name.endsWith('.md')) {
        files.push(entry.name);
      }
    }

    if (files.length === 0 && dirs.length === 0) return false;
    out.push({ dir: rel, files, dirs });
    return true;
  }

  await walk('');
  out.sort((a, b) => a.dir.localeCompare(b.dir));
  return out;
}

/**
 * MkDocs' default ordering for a directory with no explicit nav:
 * `index.md` first, then the remaining files alphabetically, then sub-directories
 * alphabetically. (Verified against the baseline build — MkDocs does **not**
 * interleave files and directories.)
 */
export function defaultOrder(entry: DocsDir): string[] {
  const files = [...entry.files].sort((a, b) => a.localeCompare(b));
  const index = files.filter((f) => f === 'index.md');
  const rest = files.filter((f) => f !== 'index.md');
  return [...index, ...rest, ...[...entry.dirs].sort((a, b) => a.localeCompare(b))];
}
