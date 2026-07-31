/**
 * The two strict rules that can be checked mechanically at any time.
 *
 *   S-1  Not a single line of any file under `docs/` may change.
 *   S-2  No file inside the content collection may have an `.mdx` extension.
 *
 * Both are build gates, not checklists: this script exits non-zero on violation
 * and is run as part of `npm run verify`.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fg from 'fast-glob';
import { DOCS_DIR, ROOT } from './lib/paths.mts';

const run = promisify(execFile);

async function checkS1(): Promise<string[]> {
  // Tracked modifications, plus anything newly written into docs/. A generated
  // file landing in docs/ is exactly the failure this rule exists to catch, and
  // `git diff` alone would not see an untracked one.
  const { stdout } = await run('git', ['status', '--porcelain', '--', 'docs/'], { cwd: ROOT });
  return stdout.split('\n').filter((line) => line.trim() !== '');
}

async function checkS2(): Promise<string[]> {
  return fg('**/*.mdx', { cwd: DOCS_DIR });
}

async function main() {
  const [dirty, mdx] = await Promise.all([checkS1(), checkS2()]);
  let failed = false;

  if (dirty.length) {
    failed = true;
    console.error(
      `[check-rules] S-1 FAIL — ${dirty.length} change(s) under docs/:\n` +
        dirty.map((line) => `    ${line}`).join('\n'),
    );
  } else {
    console.log('[check-rules] S-1 PASS — docs/ is unmodified');
  }

  if (mdx.length) {
    failed = true;
    console.error(
      `[check-rules] S-2 FAIL — ${mdx.length} .mdx file(s) in docs/:\n` +
        mdx.map((file) => `    docs/${file}`).join('\n') +
        `\n  .mdx switches the file to full MDX parsing, under which \`{\` becomes an\n` +
        `  expression delimiter — that breaks the 218 brace-containing files.`,
    );
  } else {
    console.log('[check-rules] S-2 PASS — no .mdx inside docs/');
  }

  if (failed) process.exit(1);
}

await main();
