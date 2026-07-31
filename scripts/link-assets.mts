/**
 * §5.5 — dev-time asset serving.
 *
 * `docs/` carries 267 MB of assets. Copying them into `public/` would duplicate a
 * quarter of a gigabyte in the working tree on every install, so instead `public/`
 * gets directory links pointing back into `docs/`, mirroring the docs-relative
 * path so the served URLs match production exactly:
 *
 *     public/images                    → docs/images
 *     public/integration/ai/images     → docs/integration/ai/images
 *     public/integration/cloud/aws/aws.png  (hard link — a loose asset file)
 *
 * `public/` is git-ignored. Production does not use it at all: `prebuild` removes
 * it (so `next build` does not copy a second 685 MB into `out/`) and the
 * post-build `sync-assets` step writes the real files instead.
 *
 * On Windows (this repo's primary environment) a *junction* is used rather than a
 * symlink: junctions need no elevated privileges or developer mode. Loose files
 * use hard links for the same reason — file symlinks do require privileges.
 *
 * Usage: tsx scripts/link-assets.mts [--clean]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { DOCS_DIR, PUBLIC_DIR } from './lib/paths.mts';
import { findAssetSurface } from './lib/assets.mts';

async function linkDir(rel: string): Promise<string> {
  const target = path.join(DOCS_DIR, rel);
  const linkPath = path.join(PUBLIC_DIR, rel);

  const existing = await fs.lstat(linkPath).catch(() => null);
  if (existing) {
    const resolved = await fs.realpath(linkPath).catch(() => null);
    if (resolved && path.resolve(resolved) === path.resolve(target)) return 'already linked';
    await fs.rm(linkPath, { recursive: true, force: true });
  }

  await fs.mkdir(path.dirname(linkPath), { recursive: true });
  // 'junction' is honoured on Windows and ignored elsewhere, where 'dir' is used.
  await fs.symlink(target, linkPath, process.platform === 'win32' ? 'junction' : 'dir');
  return 'linked';
}

async function linkFile(rel: string): Promise<string> {
  const target = path.join(DOCS_DIR, rel);
  const linkPath = path.join(PUBLIC_DIR, rel);

  await fs.rm(linkPath, { force: true });
  await fs.mkdir(path.dirname(linkPath), { recursive: true });
  try {
    await fs.link(target, linkPath);
    return 'hard-linked';
  } catch {
    // Different volume, or a filesystem without hard links: these are a handful
    // of small images, so a copy is an acceptable fallback.
    await fs.copyFile(target, linkPath);
    return 'copied';
  }
}

async function main() {
  if (process.argv.includes('--clean')) {
    await fs.rm(PUBLIC_DIR, { recursive: true, force: true });
    console.log('[link-assets] removed public/ (production build serves assets from out/)');
    return;
  }

  const { dirs, files } = await findAssetSurface();
  const counts: Record<string, number> = {};
  const failures: string[] = [];

  for (const rel of [...dirs, ...files]) {
    try {
      const status = dirs.includes(rel) ? await linkDir(rel) : await linkFile(rel);
      counts[status] = (counts[status] ?? 0) + 1;
    } catch (error) {
      // A failure here only affects `next dev`; the production build syncs real
      // files. Report it rather than aborting.
      failures.push(`${rel}: ${(error as Error).message}`);
    }
  }

  console.log(
    `[link-assets] ${dirs.length} asset director${dirs.length === 1 ? 'y' : 'ies'}, ` +
      `${files.length} loose file(s) → public/ ` +
      `(${Object.entries(counts)
        .map(([k, v]) => `${v} ${k}`)
        .join(', ')})`,
  );
  for (const failure of failures) console.warn(`[link-assets] WARN ${failure}`);
}

await main();
