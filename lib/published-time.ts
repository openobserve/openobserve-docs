import { execFileSync } from 'node:child_process';

/**
 * When each page under `docs/` was first committed, for `article:published_time`.
 * Fumadocs' `lastModified` (source.config.ts) only gives the latest commit.
 *
 * One `git log` pass, oldest commit first, following renames so a page that was
 * moved keeps the date it was created rather than the date of the move. Like
 * `lastModified`, this needs a full-history clone; with no git (or no history)
 * the map is empty and the tag is simply left out, never guessed.
 */
let cache: Map<string, Date> | undefined;

function firstCommitDates(): Map<string, Date> {
  if (cache) return cache;
  cache = new Map();
  let out: string;
  try {
    out = execFileSync(
      'git',
      [
        '-c',
        'core.quotepath=off',
        'log',
        '--reverse',
        '-M',
        '--format=commit:%aI',
        '--name-status',
        '--relative=docs',
        '--',
        'docs',
      ],
      { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
    );
  } catch {
    return cache;
  }
  let date: Date | undefined;
  for (const line of out.split('\n')) {
    if (line.startsWith('commit:')) {
      const parsed = new Date(line.slice(7));
      date = isNaN(parsed.getTime()) ? undefined : parsed;
      continue;
    }
    const [status, from, to] = line.trim().split('\t');
    if (!status || !from || !date) continue;
    if (status === 'A') {
      cache.set(from, date);
    } else if (status.startsWith('R') && to) {
      cache.set(to, cache.get(from) ?? date);
      cache.delete(from);
    } else if (status === 'D') {
      cache.delete(from);
    }
  }
  return cache;
}

/** First-commit date of a page, by its path relative to `docs/` (`page.path`). */
export function getPublishedTime(docPath: string): Date | undefined {
  return firstCommitDates().get(docPath.replace(/^\//, ''));
}
