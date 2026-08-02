import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

/**
 * Replaces Next's bare "404 | This page could not be found." screen, which gave
 * the reader no way onward and emitted a second <title> alongside the layout's.
 *
 * Rendered inside the docs shell, so the sidebar and search stay available.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-24">
      <p className="text-sm font-medium text-fd-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-bold">This page could not be found</h1>
      <p className="mt-4 text-fd-muted-foreground">
        The page you are looking for may have been moved or renamed. Try searching
        the documentation, or start from one of these:
      </p>
      <ul className="mt-6 space-y-2">
        <li>
          <Link className="text-fd-primary underline underline-offset-4" href="/">
            Documentation home
          </Link>
        </li>
        <li>
          <Link className="text-fd-primary underline underline-offset-4" href="/getting-started">
            Quickstart
          </Link>
        </li>
        <li>
          <Link className="text-fd-primary underline underline-offset-4" href="/ingestion">
            Ingestion
          </Link>
        </li>
        <li>
          <Link className="text-fd-primary underline underline-offset-4" href="/user-guide">
            User guide
          </Link>
        </li>
      </ul>
      <p className="mt-6 text-sm text-fd-muted-foreground">
        Press <kbd className="rounded border border-fd-border px-1.5 py-0.5">⌘</kbd>{' '}
        <kbd className="rounded border border-fd-border px-1.5 py-0.5">K</kbd> to search.
      </p>
    </main>
  );
}
