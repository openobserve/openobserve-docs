import fs from 'node:fs/promises';
import path from 'node:path';
import { DOCS_DIR } from './paths.mts';

export interface AssetSurface {
  /**
   * Directories under `docs/` that contain no markdown anywhere beneath them —
   * i.e. pure asset trees. These are the *topmost* such directories, so linking
   * or copying them covers everything below.
   */
  dirs: string[];
  /** Individual non-markdown files that sit alongside `.md` files. */
  files: string[];
}

/** Files that are build inputs, not servable assets. */
function isBuildInput(name: string): boolean {
  return name.endsWith('.md') || name === '.pages';
}

/**
 * Classify everything under `docs/` that is not markdown.
 *
 * MkDocs copies every unrecognised file in `docs_dir` into the built site at the
 * same relative path, so Rule S-3 covers all of them: `/docs/images/…`,
 * `/docs/js/…`, and the nested `docs/integration/images/…` trees alike. Missing
 * the nested ones is easy — they are not among the four obvious top-level
 * directories — so the set is derived structurally rather than hard-coded.
 */
export async function findAssetSurface(): Promise<AssetSurface> {
  const dirs: string[] = [];
  const files: string[] = [];

  /** @returns whether the subtree contains any markdown */
  async function walk(rel: string): Promise<boolean> {
    const entries = await fs.readdir(path.join(DOCS_DIR, rel), { withFileTypes: true });
    const childDirs: string[] = [];
    const childFiles: string[] = [];
    let hasMarkdown = false;

    for (const entry of entries) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) childDirs.push(childRel);
      else if (entry.name.endsWith('.md')) hasMarkdown = true;
      else if (!isBuildInput(entry.name)) childFiles.push(childRel);
    }

    const pureAssetDirs: string[] = [];
    for (const childRel of childDirs) {
      if (await walk(childRel)) hasMarkdown = true;
      else pureAssetDirs.push(childRel);
    }

    if (hasMarkdown || rel === '') {
      // This directory holds pages, so its pure-asset children are the topmost
      // asset roots and its loose files must be carried individually.
      dirs.push(...pureAssetDirs);
      files.push(...childFiles);
      return hasMarkdown;
    }

    // No markdown anywhere below: the caller links/copies this whole directory.
    return false;
  }

  await walk('');
  dirs.sort();
  files.sort();
  return { dirs, files };
}
