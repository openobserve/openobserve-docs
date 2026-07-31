# OpenObserve documentation

Source for <https://openobserve.ai/docs>, built with [Fumadocs](https://fumadocs.dev)
on Next.js and exported as static HTML.

## Getting started

Requires Node 22+ and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev
```

Open <http://localhost:3000/docs>. The `/docs` prefix is part of the dev server
too, so local URLs match production exactly.

To produce the production build:

```sh
pnpm build     # writes ./out
```

### Dev containers

Alternatively, open the repo in a [VS Code dev container](https://code.visualstudio.com/docs/remote/containers).
Copy `.devcontainer/devcontainer.json.tpl` to `.devcontainer/devcontainer.json`
and fix or remove the `mounts` section first, then run `pnpm install && pnpm dev`
inside the container and forward port 3000.

## Writing docs

Pages live in `docs/` as Markdown, and URLs mirror the file layout:
`docs/ingestion/logs/vector.md` is served at `/docs/ingestion/logs/vector/`.
A `docs/<folder>/index.md` becomes `/docs/<folder>/`.

### Frontmatter

```yaml
---
title: Vector                      # short label: sidebar, breadcrumbs, search
metaTitle: Ship logs with Vector…  # optional long <title>, for search engines
description: …                     # meta description
---
```

`title` is what readers see in navigation, so keep it short. Put the
search-engine-facing headline in `metaTitle`; when it's omitted, `title` is used
for the `<title>` tag as well.

The page's own `# H1` in the body is rendered as written and is *not* generated
from frontmatter, so each page still needs one.

### Sidebar order

Each folder's `meta.json` sets its title and the order of its pages:

```json
{
  "title": "Ingestion",
  "pages": ["index", "logs", "metrics", "---Advanced---", "otlp"]
}
```

Entries are file names without the extension, or folder names.
`"---Label---"` inserts a group heading and `"[Text](/some/page/)"` adds a
cross-link. A page missing from `meta.json` is still reachable by URL but is
hidden from the sidebar. A folder with no `meta.json` is sorted alphabetically.

### Callouts, collapsibles and tabs

These use [remark directives](https://github.com/remarkjs/remark-directive):

````md
:::note[Optional title]
An informational callout. Types: note, info, tip, warning, danger, success, question.
:::

:::accordion[Step 1: Install the CLI]
A collapsible section. Renders as a native `<details>`, so its content stays in
the HTML for search engines even while collapsed.
:::

::::tabs
:::tab[macOS]
```sh
brew install openobserve
```
:::
:::tab[Linux]
```sh
apt install openobserve
```
:::
::::
````

Nesting requires the **outer** fence to have more colons than the inner one, as
in the `::::tabs` / `:::tab` pair above.

### Links, images and code

- **Links between pages** are written as relative `.md` paths
  (`[Vector](../logs/vector.md)`) so they stay clickable on GitHub. They're
  rewritten to real URLs at build time.
- **Images** are referenced relative to the page (`![](images/logs.png)`).
  Everything non-Markdown under `docs/` is mirrored into `public/` by
  `scripts/copy-assets.mjs` on every build — `public/` is generated and
  gitignored, so always edit the original under `docs/`.
- **Code fences** support Shiki meta: `lineNumbers`, `lineNumbers=15`,
  `title="file.yaml"`, and `{4,9,20-24}` to highlight lines. An unrecognised
  language falls back to plain text rather than failing the build.

## Deployment

`pnpm build` writes a fully static site to `out/`, which is synced to S3 and
served through CloudFront:

| Branch | Target |
|---|---|
| `main` | production — <https://openobserve.ai/docs> |
| `dev`  | staging |

See `.github/workflows/`. `deploy2.sh` and `deploy3.sh` do the same thing
manually. Both set an explicit content type on `out/api/search`: the search
index has no file extension, so without it S3 labels it `binary/octet-stream`
and CloudFront serves ~37 MB uncompressed instead of ~4 MB gzipped.

CI checks out with `fetch-depth: 0` because each page's "last updated" date is
read from git history.

### Analytics

Google Tag Manager, GA4, the Segment proxy and OpenObserve RUM load only in
production builds served from a non-localhost hostname, so local work never
reports into production analytics. Append `?analytics=1` to force them on for
verification — expect console errors from the third-party tags, which reject a
localhost origin.

## Repo layout

| Path | What it is |
|---|---|
| `docs/` | the content, plus its images and `meta.json` nav files |
| `app/`, `components/` | the Next.js app and MDX components |
| `lib/remark/` | build-time plugins (link/image rewriting, directives) |
| `scripts/` | asset copying and the post-export pass (`llms.txt`, raw `.md`, redirects) |
| `scripts/migration/` | one-time scripts that converted this site from Material for MkDocs; kept for reference, not part of the build |
| `source.config.ts` | Fumadocs collection and MDX pipeline config |
