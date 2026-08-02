/**
 * One-time migration: turn every MkDocs `.pages` file into a Fumadocs `meta.json`.
 *
 *  - `title:`            -> `"title"`
 *  - ordered `nav:`      -> `"pages"` (file names without extension, folders by name)
 *  - nested nav groups   -> `"---Group Name---"` separators, which is how Fumadocs
 *                           expresses in-sidebar grouping
 *  - absolute-URL items  -> `"[Label](url)"` external link entries
 *
 * Per-item labels are NOT stored here: Fumadocs takes a sidebar label from the
 * page's own frontmatter `title`, which `convert-frontmatter.mjs` backfills from
 * these same `.pages` labels.
 *
 * Run: node scripts/migration/convert-nav.mjs [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { findPagesFiles, parsePagesFile, DOCS_DIR } from './lib-pages.mjs';

const DRY = process.argv.includes('--dry');

/** Convert one nav entry list into Fumadocs `pages` entries. */
function toPagesArray(entries, dirAbs, warnings) {
  const out = [];
  for (const entry of entries) {
    // Nested group -> separator followed by its members, flattened.
    if (entry.children) {
      out.push(`---${entry.label}---`);
      out.push(...toPagesArray(entry.children, dirAbs, warnings));
      continue;
    }

    const target = entry.target;
    if (!target) continue;

    // Cross-links to another section of the site. A leading `/docs` is dropped:
    // these render through next/link, which prepends `basePath` itself, so
    // keeping it would produce `/docs/docs/...`.
    if (target.startsWith('/') || /^https?:/.test(target)) {
      const href = target.startsWith('/docs/') ? target.slice('/docs'.length) : target;
      out.push(`[${entry.label ?? target}](${href})`);
      continue;
    }

    if (target.endsWith('.md')) {
      const abs = path.join(dirAbs, target);
      if (!fs.existsSync(abs)) {
        warnings.push(`missing file referenced in nav: ${path.relative('.', abs)}`);
        continue;
      }
      out.push(target.replace(/\.md$/, ''));
    } else {
      const abs = path.join(dirAbs, target);
      if (!fs.existsSync(abs)) {
        warnings.push(`missing folder referenced in nav: ${path.relative('.', abs)}`);
        continue;
      }
      out.push(target.replace(/\/$/, ''));
    }
  }
  return out;
}

const warnings = [];
let written = 0;

for (const file of findPagesFiles()) {
  const dirAbs = path.dirname(file);
  const { title, nav } = parsePagesFile(file);

  const meta = {};
  if (title) meta.title = title;
  if (nav) meta.pages = toPagesArray(nav, dirAbs, warnings);

  // A `.pages` with neither key carries no information.
  if (Object.keys(meta).length === 0) {
    if (!DRY) fs.rmSync(file);
    continue;
  }

  const dest = path.join(dirAbs, 'meta.json');
  const json = JSON.stringify(meta, null, 2) + '\n';
  console.log(`${path.relative('.', dest)}  (${meta.pages?.length ?? 0} entries)`);
  if (!DRY) {
    fs.writeFileSync(dest, json);
    fs.rmSync(file);
  }
  written++;
}

console.log(`\n${written} meta.json files ${DRY ? 'would be written' : 'written'} from ${DOCS_DIR}`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log('  - ' + w);
}
