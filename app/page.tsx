import { LandingPage } from '@/lib/landing/landing-page';
import { StructuredData } from '@/lib/structured-data';
import { SiteDocsLayout } from './docs-layout';

/**
 * `/docs/` — the landing page.
 *
 * `docs/index.md` sets `template: /partials/index.html` in its frontmatter, and
 * that 784-line Jinja template never renders `page.content`. The markdown body
 * of `docs/index.md` is therefore dead on the live site; it exists only to be
 * crawled and to feed llms.txt and the raw-markdown endpoint, all of which are
 * still served from the untouched source file. So this route is a port of the
 * template, not of the markdown.
 *
 * It renders inside `SiteDocsLayout` because Material did the same: the template
 * blanked `content_nav` (the right-hand table of contents) but inherited the
 * primary sidebar, and the baseline landing page ships all 614 nav items. The
 * content itself is full-width, so it is not wrapped in `DocsPage`.
 */
export default function Page() {
  return (
    <SiteDocsLayout>
      {StructuredData()}
      <div className="w-full min-w-0 flex-1">
        <LandingPage />
      </div>
    </SiteDocsLayout>
  );
}
