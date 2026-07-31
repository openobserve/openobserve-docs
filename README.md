# OpenObserve documentation

Documentation is built with [Fumadocs](https://fumadocs.dev) on Next.js and exported
as static HTML.

## Local development

Requires Node 22+ and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev
```

The site runs at <http://localhost:3000/docs> (note the `/docs` prefix — it matches
the production URL, which is <https://openobserve.ai/docs>).

To produce the production build:

```sh
pnpm build     # writes ./out
```

## Writing docs

Content lives in `docs/` as Markdown, and page URLs mirror the file layout:
`docs/ingestion/logs/vector.md` is served at `/docs/ingestion/logs/vector/`.

### Frontmatter

```yaml
---
title: Vector                      # short label: sidebar, breadcrumbs, search
metaTitle: Ship logs with Vector…  # optional long <title> for SEO
description: …                     # meta description
---
```

`title` is what readers see in navigation, so keep it short. Put the
search-engine-facing headline in `metaTitle`; when it is omitted, `title` is used.
The page's own `# H1` in the body is rendered as-is and is not generated from
frontmatter.

### Sidebar order

Each folder's `meta.json` controls its title and the order of its pages:

```json
{
  "title": "Ingestion",
  "pages": ["index", "logs", "metrics", "---Advanced---", "otlp"]
}
```

Entries are file names without the extension, or folder names. `"---Label---"`
inserts a group heading, and `"[Text](/some/page/)"` adds a cross-link. A page not
listed in `meta.json` is still reachable by URL but is hidden from the sidebar.

### Components

Blocks use [remark directives](https://github.com/remarkjs/remark-directive):

```md
:::note[Optional title]
An informational callout. Also: info, tip, warning, danger, success, question.
:::

:::accordion[Step 1: Install the CLI]
A collapsible section, rendered as a native <details>.
:::

::::tabs
:::tab[macOS]
brew install openobserve
:::
:::tab[Linux]
apt install openobserve
:::
::::
```

Nested blocks need the outer fence to have **more** colons than the inner one,
as shown by the `::::tabs` / `:::tab` pair above.

Links between pages are written as relative `.md` paths (`../logs/vector.md`) so
they stay clickable on GitHub; they are rewritten to real URLs at build time.
Images are referenced relative to the page, and everything non-Markdown under
`docs/` is copied into `public/` during the build.

## Deployment

`pnpm build` writes a fully static site to `out/`, which is synced to S3 and
served through CloudFront. Pushing to `main` deploys production; pushing to `dev`
deploys staging (see `.github/workflows/`).

## Migration scripts

`scripts/migration/` holds the one-time scripts that converted this site from
Material for MkDocs. They are kept for reference and are not part of the build.
