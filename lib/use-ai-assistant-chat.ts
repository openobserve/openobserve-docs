'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AI_ASSISTANT_API_URL,
  AI_ASSISTANT_SITE,
  aiAssistantContent as content,
  citedSourceIds,
  type AiSource,
} from '@/lib/ai-assistant';

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: AiSource[];
  /** Ids of the sources the answer actually cited. */
  cited?: number[];
  error?: string;
}

const STORAGE_KEY = 'o2-ai-assistant';
// Limits enforced by POST /api/chat.
const MAX_HISTORY = 20;
const MAX_MESSAGE_CHARS = 4000;

type SseHandler = (event: string, data: any) => void;

async function readEvents(response: Response, handle: SseHandler): Promise<void> {
  const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += value;

    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      const event = frame.match(/^event: (.+)$/m)?.[1];
      const data = frame.match(/^data: (.+)$/m)?.[1];
      if (event && data) handle(event, JSON.parse(data));
    }
  }
}

/**
 * The conversation as the API accepts it: starts with a user turn, within its
 * limits. Partial answers stay in, so "continue" has something to continue from.
 */
function toRequestMessages(messages: AiChatMessage[]) {
  const history = messages
    .filter((message) => message.content.trim())
    .slice(-MAX_HISTORY)
    .map(({ role, content }) => ({ role, content: content.slice(0, MAX_MESSAGE_CHARS) }));
  while (history[0]?.role === 'assistant') history.shift();
  return history;
}

function withCited(answer: AiChatMessage): AiChatMessage {
  return { ...answer, cited: answer.cited ?? citedSourceIds(answer.content, answer.sources ?? []) };
}

function markInterrupted(answer: AiChatMessage): AiChatMessage {
  return withCited({ ...answer, error: answer.error ?? content.errors.interrupted });
}

/**
 * Conversation state for the "Ask AI" dialog. The server keeps no chat state,
 * so the whole conversation is sent with every question.
 *
 * Client-side navigation keeps the dialog mounted, but a full page load (a
 * reload, or coming back from another site) does not, so the chat is also kept
 * in sessionStorage. An answer still streaming when the page was left is saved
 * on pagehide and shown as interrupted.
 */
export function useAiAssistantChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const controller = useRef<AbortController | null>(null);
  // Bumped by clear(), so a request it aborted can't write into the new chat.
  const generation = useRef(0);
  // The latest values, for the pagehide handler and for building requests.
  const latest = useRef({ messages, isStreaming });
  latest.current = { messages, isStreaming };

  const isWaiting = isStreaming && !messages.at(-1)?.content;

  // Storage throws when the browser blocks it or it is full. The chat still
  // works without it, it just won't survive a page load.
  const save = useCallback(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          messages: latest.current.messages,
          streaming: latest.current.isStreaming,
        }),
      );
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
      const restored: AiChatMessage[] = saved?.messages ?? [];
      if (restored.length) {
        setMessages(
          saved.streaming ? [...restored.slice(0, -1), markInterrupted(restored.at(-1)!)] : restored,
        );
      }
    } catch {}
    window.addEventListener('pagehide', save);
    return () => window.removeEventListener('pagehide', save);
  }, [save]);

  useEffect(() => {
    if (!isStreaming) save();
  }, [messages, isStreaming, save]);

  const send = useCallback(async (text: string) => {
    const question = text.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!question || latest.current.isStreaming) return;

    const asked: AiChatMessage[] = [...latest.current.messages, { role: 'user', content: question }];
    const body = JSON.stringify({ messages: toRequestMessages(asked), site: AI_ASSISTANT_SITE });
    setMessages([...asked, { role: 'assistant', content: '' }]);
    latest.current.isStreaming = true;
    setIsStreaming(true);

    const gen = generation.current;
    // Applies `change` to the answer being written, the last message.
    const update = (change: (answer: AiChatMessage) => AiChatMessage) => {
      if (gen !== generation.current) return;
      setMessages((current) => {
        const answer = current.at(-1);
        return answer?.role === 'assistant' ? [...current.slice(0, -1), change(answer)] : current;
      });
    };

    const abort = new AbortController();
    controller.current = abort;
    try {
      const response = await fetch(`${AI_ASSISTANT_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: abort.signal,
      });
      if (!response.ok) {
        const error =
          response.status === 429
            ? content.errors.rateLimited
            : response.status === 503
              ? content.errors.unavailable
              : content.errors.generic;
        update((answer) => ({ ...answer, error }));
        return;
      }

      let finished = false;
      let answered = false;
      await readEvents(response, (event, data) => {
        if (event === 'done' || event === 'error') finished = true;
        if (event === 'delta' && data.text) answered = true;
        update((answer) => {
          switch (event) {
            case 'sources':
              return { ...answer, sources: data.sources };
            case 'delta':
              return { ...answer, content: answer.content + data.text };
            case 'error':
              return { ...answer, error: data.message };
            case 'done':
              return {
                ...answer,
                cited: data.cited,
                error: data.stopReason !== 'stop' ? content.errors.cutOff : answer.error,
              };
            default:
              return answer;
          }
        });
      });
      if (!finished) update(markInterrupted);
      else if (!answered) {
        update((answer) => ({ ...answer, error: answer.error ?? content.errors.generic }));
      }
    } catch (error) {
      const aborted = (error as Error).name === 'AbortError';
      update((answer) => ({
        ...answer,
        error: !aborted ? content.errors.generic : answer.content ? answer.error : content.errors.stopped,
      }));
    } finally {
      update(withCited);
      latest.current.isStreaming = false;
      setIsStreaming(false);
      if (controller.current === abort) controller.current = null;
    }
  }, []);

  const stop = useCallback(() => controller.current?.abort(), []);

  const clear = useCallback(() => {
    generation.current += 1;
    controller.current?.abort();
    setMessages([]);
  }, []);

  return { messages, isStreaming, isWaiting, send, stop, clear };
}
