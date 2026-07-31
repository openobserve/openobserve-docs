/**
 * §7.8 — measure the static search index.
 *
 * The plan sets a budget of ~2 MB gzipped; past that, mitigation 2 (index
 * titles, descriptions, headings and a bounded slice of each section rather than
 * full body text) applies. This is the measurement that decides.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { OUT_DIR } from './lib/paths.mts';

const INDEX = path.join(OUT_DIR, 'api', 'search');
const BUDGET_MB = 2;

const raw = await fs.readFile(INDEX).catch(() => null);
if (!raw) {
  console.error(`[measure-search-index] ${INDEX} not found — run \`npm run build\` first.`);
  process.exit(1);
}

const gzip = gzipSync(raw, { level: 9 });
const brotli = brotliCompressSync(raw, {
  params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
});

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
console.table({
  raw: mb(raw.length),
  gzip: mb(gzip.length),
  brotli: mb(brotli.length),
  budget: `${BUDGET_MB.toFixed(2)} MB gzipped`,
});

if (gzip.length > BUDGET_MB * 1024 * 1024) {
  console.error(
    `[measure-search-index] OVER BUDGET — ${mb(gzip.length)} gzipped exceeds ${BUDGET_MB} MB.\n` +
      `  Apply mitigation 2 in source: restrict \`buildIndex\` in app/api/search/route.ts.`,
  );
  process.exit(1);
}
console.log('[measure-search-index] within budget');
