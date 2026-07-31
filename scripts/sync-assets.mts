/**
 * §7.6 — post-build asset sync.
 *
 * MkDocs copies every unrecognised file in `docs_dir` into the built site at the
 * same relative path, so Rule S-3 covers all 1,081 of them — not just the four
 * obvious top-level directories, but the nested `docs/**\/images/` trees and the
 * loose PNGs that sit beside pages.
 *
 * The files are copied into `out/` here rather than into `public/`, so a
 * quarter-gigabyte is never duplicated in the working tree.
 *
 * Unchanged files (same size and mtime) are skipped, which makes an incremental
 * rebuild cheap — the first build moves ~267 MB.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { DOCS_DIR, OUT_DIR, toPosix } from './lib/paths.mts';
import { findAssetSurface } from './lib/assets.mts';

async function copyIfChanged(rel: string, stats: { copied: number; skipped: number }) {
  const src = path.join(DOCS_DIR, rel);
  const dest = path.join(OUT_DIR, rel);

  const [srcStat, destStat] = await Promise.all([
    fs.stat(src),
    fs.stat(dest).catch(() => null),
  ]);
  if (
    destStat &&
    destStat.size === srcStat.size &&
    Math.floor(destStat.mtimeMs) >= Math.floor(srcStat.mtimeMs)
  ) {
    stats.skipped++;
    return;
  }

  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
  stats.copied++;
}

async function main() {
  const outExists = await fs
    .stat(OUT_DIR)
    .then(() => true)
    .catch(() => false);
  if (!outExists) {
    console.error('[sync-assets] out/ not found — run `next build` first.');
    process.exit(1);
  }

  const { dirs, files } = await findAssetSurface();

  const fromDirs = (
    await Promise.all(
      dirs.map(async (dir) =>
        (await fg('**/*', { cwd: path.join(DOCS_DIR, dir), onlyFiles: true, dot: true })).map(
          (child) => `${dir}/${toPosix(child)}`,
        ),
      ),
    )
  ).flat();

  const all = [...fromDirs, ...files];
  const stats = { copied: 0, skipped: 0 };

  // Bounded concurrency: 1,000+ files, but unbounded fs.copyFile exhausts handles.
  const queue = [...all];
  await Promise.all(
    Array.from({ length: 16 }, async () => {
      for (let rel = queue.pop(); rel !== undefined; rel = queue.pop()) {
        await copyIfChanged(rel, stats);
      }
    }),
  );

  console.log(
    `[sync-assets] ${all.length} asset file(s) → out/ ` +
      `(${stats.copied} copied, ${stats.skipped} unchanged)`,
  );
}

await main();
