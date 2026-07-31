# OpenObserve documentation

The site behind <https://openobserve.ai/docs>. Built with
[Fumadocs](https://fumadocs.dev) on Next.js and exported as a static site.

If you only want to **write docs**, you need [Requirements](#requirements),
[Getting started](#getting-started) and [Writing content](#writing-content).
The rest is for people changing how the site is built.

---

## Requirements

**Node 22** (20.19+ also works). Check with `node --version`.

This is a hard requirement, not a preference. `fumadocs-mdx` ships its bundler
loaders as ESM and the loader runner `require()`s them, which needs Node's
`require(esm)` support — added in 20.19 and 22.12. On Node 20.18 or older every
one of the 456 content files fails to load and the build dies with hundreds of
errors.

Nothing else to install. Python and MkDocs are no longer used.

## Getting started

```sh
npm ci
npm run dev
```

Then open **<http://localhost:8000/docs>**.

Note the `/docs` prefix: dev serves at the same path as production, so a link
that works locally works deployed.

To produce the deployable site:

```sh
npm run build     # static export into out/
```

---

## Writing content

Everything under `docs/` is the content, and it is a **read-only build input** —
nothing the build produces is ever written back into it.

The markdown is MkDocs-flavoured and stays that way. You do not need to learn
MDX; write what you always wrote. The build translates it.

### Supported syntax

| Syntax | Renders as |
|---|---|
| `!!! note "Title"` + 4-space indented body | a callout |
| `??? "Title"` + indented body | a collapsible (`???+` opens by default) |
| `=== "Tab label"` + indented body, repeated | a tab group |
| ` ```bash linenums="1" hl_lines="3 5" ` | highlighted code with line numbers |
| `[text](../other/page.md)` | resolved to `/docs/other/page/` |
| `![alt](../images/x.png)` | resolved to `/docs/images/x.png` |
| `{: style="height:300px"}` after an image or link | applied as attributes |
| Raw HTML — `<iframe>`, `<div>`, `<img>`, `<br>` | passed through |

These all nest: a callout inside a tab inside a tab works.

### Adding a page

1. Create the `.md` file anywhere under `docs/`.
2. Add it to the `.pages` file in that directory so it appears in the sidebar.

`.pages` is YAML, as before:

```yaml
title: Data Exploration        # the section's label in the sidebar
nav:
  - Overview: index.md         # label: target
  - Logs: logs.md
  - Dashboards: dashboards     # a subdirectory
  - Getting Started:           # a group with no directory behind it
      - Setup: setup.md
```

Two things to know:

- `nav:` is an **exclusive list**. A file not named in it is still built and
  still reachable by URL, but does not appear in the sidebar.
- If a directory has no `.pages`, its children are ordered `index.md` first,
  then files alphabetically, then subdirectories.

The sidebar regenerates automatically on `npm run dev` and `npm run build`. To
refresh it by hand, run `npm run gen:nav`.

### Adding a redirect

Add an entry to [`redirects.json`](redirects.json) — source and target are
docs-relative paths:

```json
"old/path.md": "new/path.md"
```

Production serves redirects as meta-refresh stub pages written into `out/`
(a static export has no server to issue a 3xx); the dev server issues real
redirects from the same file. Restart `npm run dev` after editing it, since
`next.config.mjs` reads it at startup.

### Two rules

- **Never add an `.mdx` file under `docs/`.** The extension switches the
  compiler into MDX mode, where `{` starts a JS expression and `<` starts JSX —
  which breaks the 218 content files containing braces. `npm run check:rules`
  enforces this.
- **React components go in `app/` or `lib/`, never in `docs/`.**

---

## Project layout

```
docs/            content — 456 .md files, .pages nav files, images. Read-only.
app/             routes, layout, landing page, llms.txt and search endpoints
lib/             page tree, MDX component map, analytics, search, landing page
plugins/         the MkDocs → Fumadocs markdown translation layer
scripts/         nav generation, post-build URL surface, verification
tests/           unit tests for the translation layer
source.config.ts the content pipeline: schema, plugin order, syntax highlighting
next.config.mjs  basePath, trailing slashes, static export, dev redirects
```

| Concern | Where it lives |
|---|---|
| Content pipeline and plugin order | `source.config.ts` |
| MkDocs syntax translation | `plugins/` |
| `.pages` → sidebar | `scripts/gen-nav.mts` → `.fumadocs-gen/` |
| Page tree and nav labels | `lib/source.ts`, `lib/nav-transformers.ts` |
| Sidebar chrome (logo, search, theme) | `app/docs-layout.tsx` |
| Landing page | `lib/landing/` |
| Redirects, raw markdown, sitemap | `scripts/*.mts`, run after `next build` |

Generated directories — `.source/`, `.fumadocs-gen/`, `.next/`, `out/`,
`public/` — are git-ignored and safe to delete at any time.

Why the plugin layer exists at all: the goal of the migration was to change the
build without touching a single line of content. Every MkDocs convention is
therefore translated at build time instead of being converted in the source.
`plugins/` is where that lives, and each file explains the convention it
handles.

---

## Verification

The build is gated on **parity with the previous MkDocs site**, not on eyeballing
it. `npm run verify` compares the built `out/` against a recorded baseline:

```sh
npm run verify         # 2,483 URLs, heading anchors, links, images, text length
npm run verify:nav     # sidebar tree, entry by entry
npm run check:rules    # docs/ unmodified; no .mdx under docs/
npm run measure:search # static search index against its size budget
npm run test:plugins   # unit tests for the translation layer
```

`npm run verify` writes `verify-report.md` with a per-check table and every
failing URL.

> **The baseline is not in git.** `baseline/` and `site-baseline/` are ignored,
> and regenerating them needs the MkDocs toolchain that Phase 9 removed. On a
> fresh clone `npm run verify` has nothing to compare against and will fail on
> the missing baseline. `npm run check:rules`, `npm run test:plugins` and the
> build itself work anywhere. If the parity harness matters to your team
> long-term, the `baseline/` directory needs committing or storing somewhere.

---

## Deployment

Static export to S3 behind CloudFront. Both pipelines run `npm ci`,
`npm run build`, `npm run check:rules`, then sync `out/`.

| Trigger | Target |
|---|---|
| push to `main` | `.github/workflows/deploy-docs.yaml` → production |
| push to `dev` | `.github/workflows/deploy-docs-staging.yaml` → staging |
| manual | `deploy2.sh` (prod), `deploy3.sh` (staging) |
| CodeBuild | `buildspec.yml` |

All four pin Node 22.

---

## Troubleshooting

**`'tsx' is not recognized as an internal or external command`**

`node_modules` is incomplete. Almost always caused by running `npm ci` or
`npm install` while a dev server was running — Windows cannot replace locked
files, and npm still exits 0.

```sh
# stop anything serving on port 8000 first, then:
rm -rf node_modules      # PowerShell: Remove-Item node_modules -Recurse -Force
npm ci
```

Sanity check afterwards: `node_modules/.bin/tsx` should exist.

**Don't run `npm run build` or `npm ci` while `npm run dev` is running.** The
build clears `.next/` and `.source/`, which the dev server is actively reading.
Stop the server first.

**A page 404s in dev but exists in production** — or the reverse. The redirects,
raw markdown endpoints, `llms.txt` and sitemap are all produced *after*
`next build`, so they only exist in `out/`. Check against a real build before
concluding something is broken.

**Changes to `next.config.mjs` aren't picked up.** Next does not hot-reload it.
Restart `npm run dev`.

**`Export docs doesn't exist in target module` from `@/.source/server`.** A stale
Turbopack cache. Delete `.next/` and `.source/` and rebuild.

**Stopping a stuck dev server (Windows):**

```powershell
Get-NetTCPConnection -LocalPort 8000 -State Listen |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

---

## Scripts

| Script | Purpose |
|---|---|
| `dev` | Dev server on port 8000 under `/docs` |
| `build` | `gen-nav` → `next build` → assets, raw markdown, redirects, sitemap |
| `gen:nav` | Regenerate the sidebar from `docs/**/.pages` |
| `verify` | URL, anchor, link, image and content parity against the baseline |
| `verify:nav` | Sidebar tree vs the baseline, entry by entry |
| `check:rules` | `docs/` unmodified; no `.mdx` under `docs/` |
| `measure:search` | Static search index size vs its budget |
| `test:plugins` | Unit tests for the markdown translation layer |
| `capture:baseline` | Rebuild the parity baseline from `site-baseline/` |
