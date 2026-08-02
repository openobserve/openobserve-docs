'use client';

import { useEffect, useRef, useState } from 'react';
import { BASE_PATH, SITE_URL } from '@/lib/constants';

/**
 * "Copy page / open in an LLM" menu, ported from `docs/js/llm-page-actions.js`.
 *
 * The raw Markdown it links to is emitted next to each HTML page by
 * scripts/post-export.mjs, matching the MkDocs `hooks/llm_markdown.py` hook.
 */
export function LlmPageActions({ markdownPath }: { markdownPath: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const mdUrl = `${BASE_PATH}/${markdownPath}`;
  const absoluteMdUrl = `${SITE_URL}${mdUrl}`;
  const prompt = `Read ${absoluteMdUrl} so I can ask questions about it.`;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const copyPage = async () => {
    try {
      const res = await fetch(mdUrl);
      await navigator.clipboard.writeText(await res.text());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
    setOpen(false);
  };

  const itemClass =
    'block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-fd-accent';

  return (
    <div ref={ref} className="relative inline-block">
      <div className="flex overflow-hidden rounded-md border border-fd-border">
        <button type="button" onClick={copyPage} className="px-3 py-1.5 text-sm hover:bg-fd-accent">
          {copied ? 'Copied' : 'Copy page'}
        </button>
        <button
          type="button"
          aria-label="More page actions"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="border-l border-fd-border px-2 py-1.5 text-sm hover:bg-fd-accent"
        >
          ▾
        </button>
      </div>

      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-md border border-fd-border bg-fd-popover shadow-lg">
          <a className={itemClass} href={mdUrl} target="_blank" rel="noopener noreferrer">
            View as Markdown
          </a>
          <a
            className={itemClass}
            href={`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in ChatGPT
          </a>
          <a
            className={itemClass}
            href={`https://claude.ai/new?q=${encodeURIComponent(prompt)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Claude
          </a>
        </div>
      ) : null}
    </div>
  );
}
