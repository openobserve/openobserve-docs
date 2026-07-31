/**
 * One-time content fix: give every page a distinct `<title>`.
 *
 * 26 pages shared a title with at least one other page, which makes them
 * compete with each other in search results and gives readers identical entries
 * to choose between. Titles below were written from each page's own H1 and
 * description, so they describe what the page actually covers.
 *
 * Only `metaTitle` is set. `title` stays as-is because it is the sidebar label,
 * where short repeated names like "List" read fine in the context of their
 * section.
 *
 * Run: node scripts/migration/fix-duplicate-titles.mjs [--dry]
 */
import fs from 'node:fs';

const DRY = process.argv.includes('--dry');

/** file -> new <title> */
const TITLES = {
  // "Logs in OpenObserve | OpenObserve" on three different pages.
  'docs/features/logs.md': 'Log Management Features - Collect, Search, and Analyze Logs',
  'docs/user-guide/data-exploration/logs/index.md':
    'Logs Overview - Explore and Query Log Data in OpenObserve',
  'docs/user-guide/data-exploration/logs/logs.md':
    'Run Your First Log Search in OpenObserve',

  // API reference verbs, previously just "List" / "Create" / "Delete" / "Update".
  'docs/reference/api/function/list.md': 'List Functions - OpenObserve API',
  'docs/reference/api/stream/list.md': 'List Streams - OpenObserve API',
  'docs/reference/api/user/list.md': 'List Users - OpenObserve API',
  'docs/reference/api/function/create.md': 'Create a Function - OpenObserve API',
  'docs/reference/api/user/create.md': 'Create a User - OpenObserve API',
  'docs/reference/api/function/delete.md': 'Delete a Function - OpenObserve API',
  'docs/reference/api/stream/delete.md': 'Delete a Stream - OpenObserve API',
  'docs/reference/api/function/update.md': 'Update a Function - OpenObserve API',
  'docs/reference/api/user/update.md': 'Update a User - OpenObserve API',

  // Two "JSON" ingestion endpoints.
  'docs/reference/api/ingestion/logs/json.md': 'Ingest Logs as JSON - OpenObserve API',
  'docs/reference/api/ingestion/metrics/json.md': 'Ingest Metrics as JSON - OpenObserve API',

  // "Metrics": the ingestion index vs the internal /metrics endpoint.
  'docs/reference/api/ingestion/metrics/index.md':
    'Metrics Ingestion API - Prometheus and JSON',
  'docs/reference/api/metrics.md': 'Internal Metrics Endpoint in Prometheus Format',

  // "Streams": API index vs the concept guide.
  'docs/reference/api/stream/index.md': 'Stream API - List, Schema, Settings, and Delete',
  'docs/user-guide/streams.md': 'Streams in OpenObserve - Ingestion, Storage, and Querying',

  // "Users": API index vs the concept guide.
  'docs/reference/api/user/index.md': 'User API - Create, Update, and Manage Accounts',
  'docs/user-guide/users.md': 'Manage Users in OpenObserve - Roles and Invitations',

  // "Best Practices": platform-wide vs RUM-specific.
  'docs/user-guide/advanced/best-practices/index.md':
    'OpenObserve Best Practices - Deployment and Query Tuning',
  'docs/user-guide/data-exploration/rum/best-practices.md':
    'RUM Best Practices - Sampling, Privacy, and Consent',

  // "Filters": the overview vs the how-to.
  'docs/user-guide/analytics/dashboards/filters/index.md': 'Dashboard Filters Overview',
  'docs/user-guide/analytics/dashboards/filters/filters.md':
    'Apply Filters to Dashboard Panels',

  // "Troubleshooting": dashboard panels vs RUM.
  'docs/user-guide/analytics/dashboards/panels/troubleshooting.md':
    'Troubleshoot Dashboard Panel Warnings and Errors',
  'docs/user-guide/data-exploration/rum/troubleshooting-guide.md':
    'Troubleshoot RUM - Missing Data and Session Replay',
};

/** YAML-quote a value only when it needs it. */
function yamlValue(v) {
  return /^[\w][\w .,'()/-]*$/.test(v) && !v.includes(': ') ? v : JSON.stringify(v);
}

let updated = 0;
for (const [file, title] of Object.entries(TITLES)) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) throw new Error(`no frontmatter: ${file}`);

  let fm = m[1];
  if (/^metaTitle:/m.test(fm)) {
    fm = fm.replace(/^metaTitle:.*$/m, `metaTitle: ${yamlValue(title)}`);
  } else if (/^title:/m.test(fm)) {
    fm = fm.replace(/^title:.*$/m, (line) => `${line}\nmetaTitle: ${yamlValue(title)}`);
  } else {
    throw new Error(`no title to anchor metaTitle to: ${file}`);
  }

  const next = `---\n${fm}\n---\n` + raw.slice(m[0].length);
  if (next !== raw) {
    updated++;
    if (!DRY) fs.writeFileSync(file, next);
  }
}

console.log(`${updated}/${Object.keys(TITLES).length} files updated${DRY ? ' (dry run)' : ''}`);
