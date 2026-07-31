/**
 * §7.9 — the six redirects that must survive.
 *
 * `output: 'export'` cannot use Next's `redirects` config: there is no server to
 * issue a 3xx. `mkdocs-redirects` solved the same problem by writing a stub HTML
 * page with a `<meta http-equiv="refresh">` and a canonical link, and this
 * reproduces that exactly — same mechanism, same behaviour, same SEO signals.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { BASE_PATH, OUT_DIR, ROOT, SITE_URL } from './lib/paths.mts';

interface RedirectsFile {
  redirects: Record<string, string>;
}

/** `enterprise-setup/index.md` → `/docs/enterprise-setup/` */
function toUrl(docsRelPath: string): string {
  const slug = docsRelPath.replace(/\.md$/i, '').replace(/(^|\/)index$/, '');
  return slug === '' ? `${BASE_PATH}/` : `${BASE_PATH}/${slug}/`;
}

function stub(target: string): string {
  const absolute = `${SITE_URL}${target}`;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <link rel="canonical" href="${absolute}" />
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content="0; url=${target}" />
  </head>
  <body>
    <p>Redirecting to <a href="${target}">${target}</a>…</p>
  </body>
</html>
`;
}

async function main() {
  const { redirects } = JSON.parse(
    await fs.readFile(path.join(ROOT, 'redirects.json'), 'utf8'),
  ) as RedirectsFile;

  const written: string[] = [];
  const missingTargets: string[] = [];

  for (const [from, to] of Object.entries(redirects)) {
    const fromUrl = toUrl(from);
    const toUrl_ = toUrl(to);

    // A redirect to a page that no longer exists is worse than no redirect.
    const targetFile = path.join(OUT_DIR, toUrl_.slice(BASE_PATH.length + 1), 'index.html');
    if (
      !(await fs
        .stat(targetFile)
        .then(() => true)
        .catch(() => false))
    ) {
      missingTargets.push(`${fromUrl} → ${toUrl_}`);
    }

    const file = path.join(OUT_DIR, fromUrl.slice(BASE_PATH.length + 1), 'index.html');
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, stub(toUrl_));
    written.push(`${fromUrl} → ${toUrl_}`);
  }

  console.log(`[emit-redirects] ${written.length} redirect stub(s):`);
  for (const line of written) console.log(`    ${line}`);

  if (missingTargets.length) {
    console.error(
      `[emit-redirects] FAIL — ${missingTargets.length} redirect(s) point at a page that ` +
        `does not exist in out/:\n    ${missingTargets.join('\n    ')}`,
    );
    process.exit(1);
  }
}

await main();
