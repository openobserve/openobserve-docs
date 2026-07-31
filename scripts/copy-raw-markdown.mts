/**
 * §7.10 — the raw-markdown endpoints, replacing `hooks/llm_markdown.py` and the
 * `mkdocs-llmstxt` plugin's per-page output.
 *
 * The live site serves 892 markdown URLs, produced by two mechanisms that
 * overlap. Measured against the baseline build:
 *
 *   456  `docs/**\/*.md` copied verbatim to the same path            (the hook)
 *    71  `docs/foo/index.md` copied verbatim to `foo.md`             (the hook)
 *   368  `<page slug>/index.md` holding the *processed* markdown     (llmstxt)
 *
 * Precedence matters where the paths collide: the hook runs after the plugin, so
 * the verbatim source wins — `/docs/user-guide/index.md` is the file with its
 * frontmatter intact, not the processed form. Reproduced here by writing the
 * processed files first.
 *
 * (71 flattened copies, not 72: `docs/index.md` has no parent to flatten to, and
 * three flattened names collide with a real source file at the same path.)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { DOCS_DIR, OUT_DIR, toPosix } from './lib/paths.mts';

const PROCESSED_ENDPOINT = path.join(OUT_DIR, 'api', 'raw-markdown');

async function writeFile(relative: string, contents: string | Buffer) {
  const target = path.join(OUT_DIR, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, contents);
}

async function main() {
  const stats = { processed: 0, source: 0, flattened: 0 };

  // 1. llmstxt's processed markdown, at `<slug>/index.md`.
  const json = await fs.readFile(PROCESSED_ENDPOINT, 'utf8').catch(() => null);
  if (json === null) {
    console.error(
      `[copy-raw-markdown] ${PROCESSED_ENDPOINT} not found.\n` +
        `  It is produced by app/api/raw-markdown/route.ts — run \`next build\` first.`,
    );
    process.exit(1);
  }
  for (const [docsRelPath, content] of Object.entries(JSON.parse(json) as Record<string, string>)) {
    const slug = docsRelPath.replace(/\.md$/i, '').replace(/(^|\/)index$/, '');
    await writeFile(slug === '' ? 'index.md' : `${slug}/index.md`, content);
    stats.processed++;
  }

  // 2. The hook's verbatim copies, which overwrite any collision above.
  const markdown = (await fg('**/*.md', { cwd: DOCS_DIR })).sort();
  for (const relative of markdown) {
    const source = await fs.readFile(path.join(DOCS_DIR, relative));
    await writeFile(toPosix(relative), source);
    stats.source++;

    // …plus the flattened form for index files: `foo/index.md` → `foo.md`.
    const posix = toPosix(relative);
    if (path.posix.basename(posix) === 'index.md' && posix !== 'index.md') {
      await writeFile(posix.replace(/\/index\.md$/, '.md'), source);
      stats.flattened++;
    }
  }

  // The JSON blob is a build intermediate, not a URL the site serves.
  await fs.rm(PROCESSED_ENDPOINT, { force: true });
  await fs.rmdir(path.dirname(PROCESSED_ENDPOINT)).catch(() => undefined);

  const total = (await fg('**/*.md', { cwd: OUT_DIR })).length;
  console.log(
    `[copy-raw-markdown] ${total} markdown endpoint(s) ` +
      `(${stats.source} verbatim, ${stats.flattened} flattened, ${stats.processed} processed)`,
  );
}

await main();
