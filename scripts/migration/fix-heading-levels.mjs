/**
 * One-time content fix: remove heading-level skips (h1 -> h3, h2 -> h4).
 *
 * A skipped level breaks the document outline that crawlers and screen readers
 * build from the headings. Where a heading jumps more than one level below its
 * parent, that heading *and its whole subtree* are shifted up by the difference,
 * so relative structure is preserved and only the absolute depth changes.
 *
 * Anchors are unaffected: heading IDs are slugs of the heading text, not its
 * level, so existing deep links keep working.
 *
 * Pages with no `# H1` in the body get one injected at render time from the
 * frontmatter title (see app/[[...slug]]/page.tsx), so for them the first body
 * heading is treated as sitting under an h1.
 *
 * Run: node scripts/migration/fix-heading-levels.mjs [--dry]
 */
import fs from 'node:fs';
import { findMarkdownFiles } from './lib-pages.mjs';

const DRY = process.argv.includes('--dry');

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

/**
 * Index every ATX heading in the body, ignoring fenced code blocks.
 * Returns [{ index, level, text }] where `index` is the line's array position.
 */
function findHeadings(lines) {
  const out = [];
  let fence = null;
  lines.forEach((line, i) => {
    const f = /^\s*(```+|~~~+)/.exec(line);
    if (f) {
      const marker = f[1][0].repeat(3);
      if (fence === null) fence = marker;
      else if (line.trim().startsWith(fence)) fence = null;
      return;
    }
    if (fence !== null) return;
    const m = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line);
    if (m) out.push({ index: i, level: m[1].length, text: m[2] });
  });
  return out;
}

const stats = { files: 0, skips: 0, headings: 0 };
const report = [];

for (const file of findMarkdownFiles()) {
  const raw = fs.readFileSync(file, 'utf8');
  const fm = FRONTMATTER_RE.exec(raw);
  const head = fm ? fm[0] : '';
  const lines = raw.slice(head.length).split('\n');

  const headings = findHeadings(lines);
  if (!headings.length) continue;

  const hasBodyH1 = headings.some((h) => h.level === 1);
  const changes = [];

  // Repeat until stable: one pass can expose a skip that was previously masked.
  for (let guard = 0; guard < 10; guard++) {
    let previous = hasBodyH1 ? null : 1;
    let fixed = false;

    for (let i = 0; i < headings.length; i++) {
      const h = headings[i];
      if (previous !== null && h.level > previous + 1) {
        // Captured before any mutation: `h` aliases headings[i], so reading
        // h.level inside the loop would compare against the shifted value and
        // drag in siblings that were never part of this subtree.
        const subtreeRoot = h.level;
        const delta = subtreeRoot - (previous + 1);
        for (let j = i; j < headings.length; j++) {
          if (j > i && headings[j].level < subtreeRoot) break;
          const before = headings[j].level;
          headings[j].level = Math.max(2, headings[j].level - delta);
          if (j === i) changes.push({ text: h.text, from: before, to: headings[j].level });
        }
        fixed = true;
        break;
      }
      previous = h.level;
    }
    if (!fixed) break;
  }

  if (!changes.length) continue;

  for (const h of headings) {
    lines[h.index] = lines[h.index].replace(/^#{1,6}/, '#'.repeat(h.level));
  }

  stats.files++;
  stats.skips += changes.length;
  stats.headings += headings.length;
  report.push({ file, hasBodyH1, changes });

  if (!DRY) fs.writeFileSync(file, head + lines.join('\n'));
}

for (const r of report) {
  console.log(`${r.file}${r.hasBodyH1 ? '' : '  (h1 injected from frontmatter)'}`);
  for (const c of r.changes) console.log(`    h${c.from} -> h${c.to}   ${c.text.slice(0, 62)}`);
}
console.log(
  `\n${stats.skips} skip(s) fixed across ${stats.files} file(s)${DRY ? ' (dry run)' : ''}`,
);
