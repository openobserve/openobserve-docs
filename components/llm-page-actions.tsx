'use client';

import { useState, type ReactNode } from 'react';
import { BASE_PATH, SITE_URL } from '@/lib/constants';

/**
 * "Copy page / open in an LLM" actions, ported from `docs/js/llm-page-actions.js`.
 * Rendered as a single row directly under the page title, so every action is
 * one click away rather than behind a menu. The page's last-updated date leads
 * the row when git history has one.
 *
 * The raw Markdown it links to is emitted next to each HTML page by
 * scripts/post-export.mjs, matching the MkDocs `hooks/llm_markdown.py` hook.
 */
export function LlmPageActions({
  markdownPath,
  updated,
}: {
  markdownPath: string;
  /** Pre-formatted by the server; see app/[[...slug]]/page.tsx. */
  updated?: { iso: string; label: string };
}) {
  const [copied, setCopied] = useState(false);

  const mdUrl = `${BASE_PATH}/${markdownPath}`;
  const absoluteMdUrl = `${SITE_URL}${mdUrl}`;
  const prompt = `Read ${absoluteMdUrl} so I can ask questions about it.`;

  const copyPage = async () => {
    try {
      const res = await fetch(mdUrl);
      await navigator.clipboard.writeText(await res.text());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    // `not-prose`: this sits inside DocsBody, whose link styling would otherwise
    // colour and underline every action.
    <div className="not-prose -mt-2 mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-fd-border pb-4 text-[0.8125rem] text-fd-muted-foreground">
      {updated ? (
        // The divider sets the date, which is information, apart from the actions.
        <span className="inline-flex items-center gap-1.5 border-e border-fd-border pe-3">
          <Icon>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </Icon>
          Updated <time dateTime={updated.iso}>{updated.label}</time>
        </span>
      ) : null}
      <button type="button" onClick={copyPage} className={actionClass}>
        <Icon>
          <rect width="14" height="14" x="8" y="8" rx="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </Icon>
        {copied ? 'Copied' : 'Copy page'}
      </button>
      <ActionLink href={mdUrl}>View Markdown</ActionLink>
      <ActionLink href={`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`}>Open in ChatGPT</ActionLink>
      <ActionLink href={`https://claude.ai/new?q=${encodeURIComponent(prompt)}`}>Open in Claude</ActionLink>
    </div>
  );
}

const actionClass =
  'inline-flex items-center gap-1.5 transition-colors hover:text-fd-foreground';

function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={actionClass}>
      <Icon>
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </Icon>
      {children}
    </a>
  );
}

/** A 14px Lucide-style stroke icon; the paths are passed as children. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
