import Link from 'next/link';
import {
  community,
  concepts,
  hero,
  iconUrl,
  pillars,
  sources,
  steps,
  tutorials,
  type LandingLink,
} from '@/lib/landing-data';

/**
 * Documentation landing page.
 *
 * Rebuilt from the Material for MkDocs theme override that used to render
 * `/docs/` (`overrides/partials/index.html`, git d518a32). That template
 * replaced the page body entirely, so after the migration `/docs/` fell back to
 * the markdown in `docs/index.md` and the hero, ingestion panel, journey and
 * card grids disappeared.
 *
 * Content lives in lib/landing-data.ts; colours come from Fumadocs theme tokens
 * so the page follows light and dark mode, which the original did not.
 */

const TONES: Record<string, string> = {
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  purple: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

function Icon({ item, className = '' }: { item: LandingLink; className?: string }) {
  const src = iconUrl(item.icon);
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" aria-hidden="true" loading="lazy" className={className} />;
}

/** Internal hrefs go through next/link; absolute ones open in a new tab. */
function Anchor({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (/^https?:/.test(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

const CARD =
  'rounded-xl border border-fd-border bg-fd-card p-4 transition-colors hover:border-[var(--oo-brand)]/40 hover:bg-fd-accent/40';

export function Landing() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Hero: identity and CTAs on the left, ingestion sources on the right. */}
      <section className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--oo-brand)]">{hero.title}</h1>
          <p className="mt-5 text-lg font-semibold">{hero.lede}</p>
          <p className="mt-4 text-fd-muted-foreground">
            Learn how to get up and running with OpenObserve through tutorials,
            integrations, and references. OpenObserve (O2) unifies logs, metrics, and
            traces into one cloud-native platform.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Anchor
              href={hero.primary.href}
              className="rounded-lg bg-[var(--oo-brand)] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[var(--oo-brand-hover)]"
            >
              {hero.primary.label}
            </Anchor>
            <Anchor
              href={hero.secondary.href}
              className="rounded-lg border border-fd-border px-5 py-2.5 font-medium transition-colors hover:bg-fd-accent"
            >
              {hero.secondary.label}
            </Anchor>
          </div>
        </div>

        <div className="rounded-2xl border border-fd-border bg-fd-card p-5">
          <p className="text-fd-muted-foreground">Start ingesting from your data source.</p>
          <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
            {sources.map((s) => (
              <Anchor
                key={s.title}
                href={s.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-fd-border p-3 text-center text-xs transition-colors hover:border-[var(--oo-brand)]/40 hover:bg-fd-accent/40"
              >
                <Icon item={s} className="size-7" />
                <span className="leading-tight">{s.title}</span>
              </Anchor>
            ))}
          </div>
          <Link
            href="/ingestion"
            className="mt-5 inline-block font-medium text-[var(--oo-brand)] hover:underline"
          >
            View all ingestion sources →
          </Link>
        </div>
      </section>

      {/* The ordered path from install to monitoring. */}
      <Section
        title="Start here"
        subtitle="Follow these 5 steps in order to go from zero to a working observability setup."
      >
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s) => (
            <li key={s.title}>
              <Anchor href={s.href} className={`${CARD} flex h-full flex-col`}>
                <span className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--oo-brand)] text-sm font-semibold text-white">
                    {s.num}
                  </span>
                  <span className="text-lg font-semibold">{s.title}</span>
                </span>
                <span className="mt-2 text-sm text-fd-muted-foreground">{s.desc}</span>
              </Anchor>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Explore by pillar">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <Anchor key={p.title} href={p.href} className={`${CARD} flex gap-3`}>
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                  TONES[p.tone ?? ''] ?? 'bg-fd-accent'
                }`}
              >
                <Icon item={p} className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">{p.title}</span>
                <span className="mt-1 block text-sm text-fd-muted-foreground">{p.desc}</span>
              </span>
            </Anchor>
          ))}
        </div>
      </Section>

      <Section title="User guides">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fd-muted-foreground">
          Tutorials
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tutorials.map((c) => (
            <Anchor key={c.title} href={c.href} className={`${CARD} flex gap-3`}>
              <Icon item={c} className="size-6 shrink-0" />
              <span>
                <span className="block font-semibold">{c.title}</span>
                <span className="mt-1 block text-sm text-fd-muted-foreground">{c.desc}</span>
              </span>
            </Anchor>
          ))}
        </div>

        <h3 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-fd-muted-foreground">
          Concepts
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {concepts.map((c) => (
            <Anchor key={c.title} href={c.href} className={`${CARD} flex gap-3`}>
              <Icon item={c} className="size-6 shrink-0" />
              <span>
                <span className="block font-semibold">{c.title}</span>
                <span className="mt-1 block text-sm text-fd-muted-foreground">{c.desc}</span>
              </span>
            </Anchor>
          ))}
        </div>
      </Section>

      <Section title="Migrate to OpenObserve">
        <div className="grid gap-3 sm:grid-cols-2">
          <Anchor href="/migration/migrate-from-grafana-to-openobserve" className={CARD}>
            <span className="block font-semibold">From Grafana (LGTM)</span>
            <span className="mt-1 block text-sm text-fd-muted-foreground">
              Move your Loki, Mimir, and Tempo workloads onto a single platform.
            </span>
          </Anchor>
          <Anchor href="/migration/migrate-from-datadog-to-openobserve" className={CARD}>
            <span className="block font-semibold">From Datadog</span>
            <span className="mt-1 block text-sm text-fd-muted-foreground">
              Route Agent, DogStatsD, APM, and log data into OpenObserve.
            </span>
          </Anchor>
        </div>
      </Section>

      <Section title="Ready to start?">
        <p className="text-fd-muted-foreground">
          <Link href="/ingestion/logs/curl" className="text-[var(--oo-brand)] hover:underline">
            Ingest your first data
          </Link>
          , then{' '}
          <Link
            href="/user-guide/data-exploration/logs"
            className="text-[var(--oo-brand)] hover:underline"
          >
            run your first query
          </Link>
          .
        </p>
      </Section>

      <Section title="Community &amp; support">
        <div className="grid gap-3 sm:grid-cols-3">
          {community.map((c) => (
            <Anchor key={c.title} href={c.href} className={`${CARD} flex gap-3`}>
              <Icon item={c} className="size-6 shrink-0" />
              <span>
                <span className="block font-semibold">{c.title}</span>
                <span className="mt-1 block text-sm text-fd-muted-foreground">{c.desc}</span>
              </span>
            </Anchor>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {subtitle ? <p className="mt-2 text-fd-muted-foreground">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
