import Link from 'next/link';

/**
 * Emitted to `out/404.html` by the static export — the file S3 serves as the
 * error document, replacing Material's 404 page.
 *
 * No `DocsLayout` here: the 404 is reachable at any depth, and rendering the
 * sidebar would make the page weigh as much as a real one for a request that is
 * already a dead end.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-sm font-medium text-fd-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">This page could not be found</h1>
      <p className="text-fd-muted-foreground">
        The page you are looking for may have been moved or renamed.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground"
      >
        Back to the documentation
      </Link>
    </main>
  );
}
