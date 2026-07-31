/**
 * Phase 3 gate — the generated sidebar must equal the MkDocs one.
 *
 * Serialises the Fumadocs page tree in the same shape `capture-baseline.mts`
 * serialises Material's `nav.md-nav--primary`, and diffs the two. Labels,
 * ordering and nesting must all match; a mismatch fails the gate.
 *
 * The tree is rebuilt from disk rather than imported from `lib/source.ts`: that
 * module pulls in `.source/server`, which imports every `.md` file through the
 * bundler's loaders and cannot be evaluated by plain Node. Reconstructing the
 * source here uses the *real* `loader()` and the *real* transformers, so only
 * the file-reading layer differs — and that layer has no say in ordering or
 * labels, which is what this gate checks.
 *
 * The built HTML is not usable for this: fumadocs-ui renders collapsed folders
 * as empty elements, so most of the tree is simply absent from `out/`.
 *
 * Run: npm run verify:nav   (requires baseline/nav.txt and `npm run gen:nav`)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { loader } from 'fumadocs-core/source';
import type { VirtualFile } from 'fumadocs-core/source';
import type { Node, Root } from 'fumadocs-core/page-tree';
import { BASELINE_DIR, BASE_PATH, DOCS_DIR, GEN_META_DIR, toPosix } from './lib/paths.mts';
import { navTransformers } from '../lib/nav-transformers.ts';
import { resolveTitle } from '../plugins/page-title.ts';

/** Page-tree URLs carry no `/docs` prefix (§6.2); the baseline URLs do. */
function toSiteUrl(url: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  const withSlash = url.endsWith('/') ? url : `${url}/`;
  return `${BASE_PATH}${withSlash}`;
}

function serialise(nodes: Node[], depth = 0, out: string[] = []): string[] {
  for (const node of nodes) {
    if (node.type === 'separator') {
      out.push(`${'  '.repeat(depth)}- --- ${String(node.name)} ---`);
      continue;
    }
    if (node.type === 'folder') {
      out.push(`${'  '.repeat(depth)}- ${String(node.name)}`);
      const children = node.index ? [node.index, ...node.children] : node.children;
      serialise(children as Node[], depth + 1, out);
      continue;
    }
    out.push(`${'  '.repeat(depth)}- ${String(node.name)} -> ${toSiteUrl(node.url)}`);
  }
  return out;
}

async function buildSource(): Promise<VirtualFile[]> {
  const files: VirtualFile[] = [];

  for (const rel of await fg('**/*.md', { cwd: DOCS_DIR })) {
    const source = await fs.readFile(path.join(DOCS_DIR, rel), 'utf8');
    files.push({
      type: 'page',
      path: toPosix(rel),
      data: { title: resolveTitle(rel, source) },
    });
  }

  for (const rel of await fg('**/*.json', { cwd: GEN_META_DIR })) {
    files.push({
      type: 'meta',
      path: toPosix(rel),
      data: JSON.parse(await fs.readFile(path.join(GEN_META_DIR, rel), 'utf8')),
    });
  }

  return files;
}

function diff(expected: string[], actual: string[], limit = 40): string[] {
  const report: string[] = [];
  const max = Math.max(expected.length, actual.length);
  let shown = 0;
  for (let i = 0; i < max && shown < limit; i++) {
    if (expected[i] === actual[i]) continue;
    report.push(
      `  line ${i + 1}\n    baseline: ${expected[i] ?? '<missing>'}\n    fumadocs: ${actual[i] ?? '<missing>'}`,
    );
    shown++;
  }
  if (shown === limit) report.push('  … further differences suppressed');
  return report;
}

async function main() {
  const baseline = (await fs.readFile(path.join(BASELINE_DIR, 'nav.txt'), 'utf8'))
    .split('\n')
    .filter(Boolean);

  const source = loader({
    baseUrl: '/',
    source: { files: await buildSource() },
    pageTree: { transformers: navTransformers },
  });

  const actual = serialise((source.pageTree as Root).children as Node[]);
  await fs.writeFile(path.join(BASELINE_DIR, 'nav.fumadocs.txt'), actual.join('\n') + '\n');

  if (baseline.join('\n') === actual.join('\n')) {
    console.log(`[verify-nav] PASS — ${actual.length} sidebar entries match baseline/nav.txt`);
    return;
  }

  const mismatches = diff(baseline, actual);
  console.error(
    `[verify-nav] FAIL — baseline has ${baseline.length} entries, Fumadocs has ${actual.length}\n` +
      `  full generated tree written to baseline/nav.fumadocs.txt\n` +
      mismatches.join('\n'),
  );
  process.exit(1);
}

await main();
