---
title: Claude Code Tracing
description: Send trace data from Claude Code sessions to OpenObserve via OpenTelemetry hooks.
---

# Claude Code → OpenObserve Tracing Hook

Send trace data from your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) sessions to [OpenObserve](https://openobserve.ai) via OpenTelemetry.

Each conversation turn (user prompt → assistant response → tool calls) is exported as a structured trace, giving you full observability into how Claude Code works on your behalf.

## How It Works

Claude Code supports [hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) — shell commands that run at specific lifecycle points. This project uses the **Stop** hook, which fires after every Claude Code response.

When triggered, the hook:

1. Reads a JSON payload from stdin containing `session_id` and `transcript_path`
2. Incrementally reads new JSONL entries from the transcript file (only new bytes since last run)
3. Groups messages into turns (user → assistant → tool calls/results)
4. Exports each turn as an OpenTelemetry trace to OpenObserve, with child spans for LLM generation and tool calls

```
Stop hook fires
  → Read stdin payload (session_id, transcript_path)
  → Read new transcript lines (incremental, offset-based)
  → Group into turns
  → Export as OTel traces to OpenObserve
```

## Prerequisites

- Python 3.9+
- [openobserve-telemetry-sdk](https://pypi.org/project/openobserve-telemetry-sdk/)

```bash
pip install openobserve-telemetry-sdk
```

## Setup

### 1. Register the hook globally

Add the Stop hook to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.claude/hooks/openobserve_hooks.py"
          }
        ]
      }
    ]
  }
}
```

This makes the hook run after every Claude Code response across all projects.

### 2. Configure environment variables

You can set the required environment variables at the **global** level (all projects) or **per-project** level.

#### Option A: Global (all projects)

Add env vars to `~/.claude/settings.json` alongside the hook definition:

```json
{
  "env": {
    "TRACE_TO_OPENOBSERVE": "true",
    "OPENOBSERVE_URL": "http://localhost:5080",
    "OPENOBSERVE_ORG": "default",
    "OPENOBSERVE_AUTH_TOKEN": "Basic <base64-encoded user:password>"
  },
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.claude/hooks/openobserve_hooks.py"
          }
        ]
      }
    ]
  }
}
```

#### Option B: Per-project

Enable tracing selectively by adding env vars to each project's `.claude/settings.local.json`:

```json
{
  "env": {
    "TRACE_TO_OPENOBSERVE": "true",
    "OPENOBSERVE_URL": "http://localhost:5080",
    "OPENOBSERVE_ORG": "default",
    "OPENOBSERVE_AUTH_TOKEN": "Basic <base64-encoded user:password>",
    "CC_OPENOBSERVE_DEBUG": "true"
  }
}
```

### Environment Variables

| Variable | Description | Required | Default |
|---|---|---|---|
| `TRACE_TO_OPENOBSERVE` | Set to `"true"` to enable tracing | Yes | — |
| `OPENOBSERVE_URL` | OpenObserve base URL | Yes | — |
| `OPENOBSERVE_ORG` | OpenObserve organization | Yes | — |
| `OPENOBSERVE_AUTH_TOKEN` | `Basic <base64>` or Bearer token | Yes | — |
| `OPENOBSERVE_TRACES_STREAM_NAME` | Target stream name | No | `"default"` |
| `OPENOBSERVE_PROTOCOL` | `"http/protobuf"` or `"grpc"` | No | `"http/protobuf"` |
| `OPENOBSERVE_USER_ID` | User identifier (added as resource attribute) | No | `None` |
| `CC_OPENOBSERVE_DEBUG` | Set to `"true"` for verbose logging | No | `"false"` |
| `CC_OPENOBSERVE_MAX_CHARS` | Max characters per text field before truncation | No | `20000` |

### Generating the auth token

The token is a Base64-encoded `email:password` string. For example, with `root@example.com` / `Complexpass#123`:

```bash
echo -n "root@example.com:Complexpass#123" | base64
# cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=
```

Then set `OPENOBSERVE_AUTH_TOKEN` to `Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=`.

## Troubleshooting

### Check the log file

```bash
tail -f ~/.claude/state/openobserve_hook.log
```

Enable debug logging by setting `CC_OPENOBSERVE_DEBUG=true` in your project's env config.

### Test the hook manually

```bash
echo '{"session_id":"test","transcript_path":"/path/to/transcript.jsonl"}' | \
  TRACE_TO_OPENOBSERVE=true \
  OPENOBSERVE_URL=http://localhost:5080 \
  OPENOBSERVE_ORG=default \
  OPENOBSERVE_AUTH_TOKEN="Basic ..." \
  python3 ~/.claude/hooks/openobserve_hooks.py
```

### Common issues

| Symptom | Cause | Fix |
|---|---|---|
| No traces appear | `TRACE_TO_OPENOBSERVE` not set | Add env vars to `.claude/settings.local.json` |
| Hook silently exits | Missing `openobserve-telemetry-sdk` | Run `pip install openobserve-telemetry-sdk` |
| Auth errors in log | Wrong token format | Ensure token is `Basic <base64>` format |
| Partial traces | OpenObserve unreachable | Verify `OPENOBSERVE_URL` and that the service is running |

### State files

The hook maintains incremental state in `~/.claude/state/`:

- `openobserve_state.json` — per-session offsets and turn counts
- `openobserve_state.lock` — file lock for concurrent access
- `openobserve_hook.log` — debug/info log

### Limitations

- System prompts are not included in Claude Code's conversation transcripts, so they are not part of the trace.
- Token usage / cost data is not available in the transcript format.

## Hook Source Code

The complete `openobserve_hooks.py` script is included below. Save it to `~/.claude/hooks/openobserve_hooks.py`.

??? note "openobserve_hooks.py (click to expand)"

    ```python
    #!/usr/bin/env python3
    """
    Claude Code -> OpenObserve hook

    Sends trace data from Claude Code sessions to OpenObserve via OpenTelemetry.

    Environment variables:
        TRACE_TO_OPENOBSERVE=true          Enable tracing
        OPENOBSERVE_URL                    OpenObserve base URL
        OPENOBSERVE_ORG                    OpenObserve organization
        OPENOBSERVE_AUTH_TOKEN             Authorization token
        OPENOBSERVE_TRACES_STREAM_NAME     Stream name (default: "default")
        OPENOBSERVE_PROTOCOL               "http/protobuf" or "grpc" (default: "http/protobuf")
        OPENOBSERVE_USER_ID                User identifier (default: None, added as resource attribute)
        CC_OPENOBSERVE_DEBUG=true          Enable debug logging
        CC_OPENOBSERVE_MAX_CHARS=20000     Max chars per text field
    """

    import json
    import os
    import socket
    import sys
    import time
    import hashlib
    from dataclasses import dataclass
    from datetime import datetime, timezone
    from pathlib import Path
    from typing import Any, Dict, List, Optional, Tuple

    # --- OpenObserve / OpenTelemetry import (fail-open) ---
    try:
        from openobserve import openobserve_init_traces, openobserve_flush, openobserve_shutdown
        from opentelemetry import trace
    except Exception:
        sys.exit(0)

    # --- Paths ---
    STATE_DIR = Path.home() / ".claude" / "state"
    LOG_FILE = STATE_DIR / "openobserve_hook.log"
    STATE_FILE = STATE_DIR / "openobserve_state.json"
    LOCK_FILE = STATE_DIR / "openobserve_state.lock"

    DEBUG = os.environ.get("CC_OPENOBSERVE_DEBUG", "").lower() == "true"
    MAX_CHARS = int(os.environ.get("CC_OPENOBSERVE_MAX_CHARS", "20000"))
    USER_ID = os.environ.get("OPENOBSERVE_USER_ID") or None
    HOSTNAME = socket.gethostname()

    # ----------------- Logging -----------------
    def _log(level: str, message: str) -> None:
        try:
            STATE_DIR.mkdir(parents=True, exist_ok=True)
            ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            with open(LOG_FILE, "a", encoding="utf-8") as f:
                f.write(f"{ts} [{level}] {message}\n")
        except Exception:
            # Never block
            pass

    def debug(msg: str) -> None:
        if DEBUG:
            _log("DEBUG", msg)

    def info(msg: str) -> None:
        _log("INFO", msg)

    def warn(msg: str) -> None:
        _log("WARN", msg)

    def error(msg: str) -> None:
        _log("ERROR", msg)

    # ----------------- State locking (best-effort) -----------------
    class FileLock:
        def __init__(self, path: Path, timeout_s: float = 2.0):
            self.path = path
            self.timeout_s = timeout_s
            self._fh = None

        def __enter__(self):
            STATE_DIR.mkdir(parents=True, exist_ok=True)
            self._fh = open(self.path, "a+", encoding="utf-8")
            try:
                import fcntl  # Unix only
                deadline = time.time() + self.timeout_s
                while True:
                    try:
                        fcntl.flock(self._fh.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                        break
                    except BlockingIOError:
                        if time.time() > deadline:
                            break
                        time.sleep(0.05)
            except Exception:
                # If locking isn't available, proceed without it.
                pass
            return self

        def __exit__(self, exc_type, exc, tb):
            try:
                import fcntl
                fcntl.flock(self._fh.fileno(), fcntl.LOCK_UN)
            except Exception:
                pass
            try:
                self._fh.close()
            except Exception:
                pass

    def load_state() -> Dict[str, Any]:
        try:
            if not STATE_FILE.exists():
                return {}
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}

    def save_state(state: Dict[str, Any]) -> None:
        try:
            STATE_DIR.mkdir(parents=True, exist_ok=True)
            tmp = STATE_FILE.with_suffix(".tmp")
            tmp.write_text(json.dumps(state, indent=2, sort_keys=True), encoding="utf-8")
            os.replace(tmp, STATE_FILE)
        except Exception as e:
            debug(f"save_state failed: {e}")

    def state_key(session_id: str, transcript_path: str) -> str:
        # stable key even if session_id collides
        raw = f"{session_id}::{transcript_path}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    # ----------------- Hook payload -----------------
    def read_hook_payload() -> Dict[str, Any]:
        """
        Claude Code hooks pass a JSON payload on stdin.
        This script tolerates missing/empty stdin by returning {}.
        """
        try:
            data = sys.stdin.read()
            if not data.strip():
                return {}
            return json.loads(data)
        except Exception:
            return {}

    def extract_session_and_transcript(payload: Dict[str, Any]) -> Tuple[Optional[str], Optional[Path]]:
        """
        Tries a few plausible field names; exact keys can vary across hook types/versions.
        Prefer structured values from stdin over heuristics.
        """
        session_id = (
            payload.get("sessionId")
            or payload.get("session_id")
            or payload.get("session", {}).get("id")
        )

        transcript = (
            payload.get("transcriptPath")
            or payload.get("transcript_path")
            or payload.get("transcript", {}).get("path")
        )

        if transcript:
            try:
                transcript_path = Path(transcript).expanduser().resolve()
            except Exception:
                transcript_path = None
        else:
            transcript_path = None

        return session_id, transcript_path

    # ----------------- Transcript parsing helpers -----------------
    def get_content(msg: Dict[str, Any]) -> Any:
        if not isinstance(msg, dict):
            return None
        if "message" in msg and isinstance(msg.get("message"), dict):
            return msg["message"].get("content")
        return msg.get("content")

    def get_role(msg: Dict[str, Any]) -> Optional[str]:
        # Claude Code transcript lines commonly have type=user/assistant OR message.role
        t = msg.get("type")
        if t in ("user", "assistant"):
            return t
        m = msg.get("message")
        if isinstance(m, dict):
            r = m.get("role")
            if r in ("user", "assistant"):
                return r
        return None

    def is_tool_result(msg: Dict[str, Any]) -> bool:
        role = get_role(msg)
        if role != "user":
            return False
        content = get_content(msg)
        if isinstance(content, list):
            return any(isinstance(x, dict) and x.get("type") == "tool_result" for x in content)
        return False

    def iter_tool_results(content: Any) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        if isinstance(content, list):
            for x in content:
                if isinstance(x, dict) and x.get("type") == "tool_result":
                    out.append(x)
        return out

    def iter_tool_uses(content: Any) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        if isinstance(content, list):
            for x in content:
                if isinstance(x, dict) and x.get("type") == "tool_use":
                    out.append(x)
        return out

    def extract_text(content: Any) -> str:
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts: List[str] = []
            for x in content:
                if isinstance(x, dict) and x.get("type") == "text":
                    parts.append(x.get("text", ""))
                elif isinstance(x, str):
                    parts.append(x)
            return "\n".join([p for p in parts if p])
        return ""

    def truncate_text(s: str, max_chars: int = MAX_CHARS) -> Tuple[str, Dict[str, Any]]:
        if s is None:
            return "", {"truncated": False, "orig_len": 0}
        orig_len = len(s)
        if orig_len <= max_chars:
            return s, {"truncated": False, "orig_len": orig_len}
        head = s[:max_chars]
        return head, {"truncated": True, "orig_len": orig_len, "kept_len": len(head), "sha256": hashlib.sha256(s.encode("utf-8")).hexdigest()}

    def get_model(msg: Dict[str, Any]) -> str:
        m = msg.get("message")
        if isinstance(m, dict):
            return m.get("model") or "claude"
        return "claude"

    def get_message_id(msg: Dict[str, Any]) -> Optional[str]:
        m = msg.get("message")
        if isinstance(m, dict):
            mid = m.get("id")
            if isinstance(mid, str) and mid:
                return mid
        return None

    # ----------------- Incremental reader -----------------
    @dataclass
    class SessionState:
        offset: int = 0
        buffer: str = ""
        turn_count: int = 0

    def load_session_state(global_state: Dict[str, Any], key: str) -> SessionState:
        s = global_state.get(key, {})
        return SessionState(
            offset=int(s.get("offset", 0)),
            buffer=str(s.get("buffer", "")),
            turn_count=int(s.get("turn_count", 0)),
        )

    def write_session_state(global_state: Dict[str, Any], key: str, ss: SessionState) -> None:
        global_state[key] = {
            "offset": ss.offset,
            "buffer": ss.buffer,
            "turn_count": ss.turn_count,
            "updated": datetime.now(timezone.utc).isoformat(),
        }

    def read_new_jsonl(transcript_path: Path, ss: SessionState) -> Tuple[List[Dict[str, Any]], SessionState]:
        """
        Reads only new bytes since ss.offset. Keeps ss.buffer for partial last line.
        Returns parsed JSON lines (best-effort) and updated state.
        """
        if not transcript_path.exists():
            return [], ss

        try:
            with open(transcript_path, "rb") as f:
                f.seek(ss.offset)
                chunk = f.read()
                new_offset = f.tell()
        except Exception as e:
            debug(f"read_new_jsonl failed: {e}")
            return [], ss

        if not chunk:
            return [], ss

        try:
            text = chunk.decode("utf-8", errors="replace")
        except Exception:
            text = chunk.decode(errors="replace")

        combined = ss.buffer + text
        lines = combined.split("\n")
        # last element may be incomplete
        ss.buffer = lines[-1]
        ss.offset = new_offset

        msgs: List[Dict[str, Any]] = []
        for line in lines[:-1]:
            line = line.strip()
            if not line:
                continue
            try:
                msgs.append(json.loads(line))
            except Exception:
                continue

        return msgs, ss

    # ----------------- Turn assembly -----------------
    @dataclass
    class Turn:
        user_msg: Dict[str, Any]
        assistant_msgs: List[Dict[str, Any]]
        tool_results_by_id: Dict[str, Any]

    def build_turns(messages: List[Dict[str, Any]]) -> List[Turn]:
        """
        Groups incremental transcript rows into turns:
        user (non-tool-result) -> assistant messages -> (tool_result rows, possibly interleaved)
        Uses:
        - assistant message dedupe by message.id (latest row wins)
        - tool results dedupe by tool_use_id (latest wins)
        """
        turns: List[Turn] = []
        current_user: Optional[Dict[str, Any]] = None

        # assistant messages for current turn:
        assistant_order: List[str] = []             # message ids in order of first appearance (or synthetic)
        assistant_latest: Dict[str, Dict[str, Any]] = {}  # id -> latest msg

        tool_results_by_id: Dict[str, Any] = {}     # tool_use_id -> content

        def flush_turn():
            nonlocal current_user, assistant_order, assistant_latest, tool_results_by_id, turns
            if current_user is None:
                return
            if not assistant_latest:
                return
            assistants = [assistant_latest[mid] for mid in assistant_order if mid in assistant_latest]
            turns.append(Turn(user_msg=current_user, assistant_msgs=assistants, tool_results_by_id=dict(tool_results_by_id)))

        for msg in messages:
            role = get_role(msg)

            # tool_result rows show up as role=user with content blocks of type tool_result
            if is_tool_result(msg):
                for tr in iter_tool_results(get_content(msg)):
                    tid = tr.get("tool_use_id")
                    if tid:
                        tool_results_by_id[str(tid)] = tr.get("content")
                continue

            if role == "user":
                # new user message -> finalize previous turn
                flush_turn()

                # start a new turn
                current_user = msg
                assistant_order = []
                assistant_latest = {}
                tool_results_by_id = {}
                continue

            if role == "assistant":
                if current_user is None:
                    # ignore assistant rows until we see a user message
                    continue

                mid = get_message_id(msg) or f"noid:{len(assistant_order)}"
                if mid not in assistant_latest:
                    assistant_order.append(mid)
                assistant_latest[mid] = msg
                continue

            # ignore unknown rows

        # flush last
        flush_turn()
        return turns

    # ----------------- OpenObserve emit via OpenTelemetry -----------------
    def _tool_calls_from_assistants(assistant_msgs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        calls: List[Dict[str, Any]] = []
        for am in assistant_msgs:
            for tu in iter_tool_uses(get_content(am)):
                tid = tu.get("id") or ""
                calls.append({
                    "id": str(tid),
                    "name": tu.get("name") or "unknown",
                    "input": tu.get("input") if isinstance(tu.get("input"), (dict, list, str, int, float, bool)) else {},
                })
        return calls

    def emit_turn(tracer: trace.Tracer, session_id: str, turn_num: int, turn: Turn, transcript_path: Path) -> None:
        user_text_raw = extract_text(get_content(turn.user_msg))
        user_text, user_text_meta = truncate_text(user_text_raw)

        last_assistant = turn.assistant_msgs[-1]
        assistant_text_raw = extract_text(get_content(last_assistant))
        assistant_text, assistant_text_meta = truncate_text(assistant_text_raw)

        model = get_model(turn.assistant_msgs[0])

        tool_calls = _tool_calls_from_assistants(turn.assistant_msgs)

        # attach tool outputs
        for c in tool_calls:
            if c["id"] and c["id"] in turn.tool_results_by_id:
                out_raw = turn.tool_results_by_id[c["id"]]
                out_str = out_raw if isinstance(out_raw, str) else json.dumps(out_raw, ensure_ascii=False)
                out_trunc, out_meta = truncate_text(out_str)
                c["output"] = out_trunc
                c["output_meta"] = out_meta
            else:
                c["output"] = None

        # Root span for the turn
        with tracer.start_as_current_span(
            name=f"Claude Code - Turn {turn_num}",
            attributes={
                "claude_code.source": "claude-code",
                "session.id": session_id,
                "claude_code.turn_number": turn_num,
                "claude_code.transcript_path": str(transcript_path),
                "host.name": HOSTNAME,
                "llm.model": model,
                "gen_ai.provider.name": "anthropic",
                "gen_ai.operation.name": "chat",
                "claude_code.tool_count": len(tool_calls),
                "gen_ai.input.messages": user_text,
                "input.truncated": user_text_meta.get("truncated", False),
                "input.orig_len": user_text_meta.get("orig_len", 0),
                "gen_ai.output.messages": assistant_text,
                "output.truncated": assistant_text_meta.get("truncated", False),
                "output.orig_len": assistant_text_meta.get("orig_len", 0),
            },
        ) as turn_span:
            # LLM generation child span
            with tracer.start_as_current_span(
                name="Claude Response",
                attributes={
                    "gen_ai.provider.name": "anthropic",
                    "gen_ai.request.model": model,
                    "gen_ai.operation.name": "chat",
                    "gen_ai.input.messages": user_text,
                    "gen_ai.output.messages": assistant_text,
                    "claude_code.tool_count": len(tool_calls),
                    "host.name": HOSTNAME,
                },
            ):
                pass

            # Tool child spans
            for tc in tool_calls:
                in_obj = tc["input"]
                if isinstance(in_obj, str):
                    in_str, _ = truncate_text(in_obj)
                elif isinstance(in_obj, (dict, list)):
                    in_str, _ = truncate_text(json.dumps(in_obj, ensure_ascii=False))
                else:
                    in_str = str(in_obj)

                out_str = tc.get("output") or ""

                with tracer.start_as_current_span(
                    name=f"Tool: {tc['name']}",
                    attributes={
                        "gen_ai.tool.name": tc["name"],
                        "gen_ai.tool.call.id": tc["id"],
                        "gen_ai.tool.call.arguments": in_str,
                        "gen_ai.tool.call.result": out_str,
                        "host.name": HOSTNAME,
                    },
                ):
                    pass

    # ----------------- Main -----------------
    def main() -> int:
        start = time.time()
        debug("Hook started")

        if os.environ.get("TRACE_TO_OPENOBSERVE", "").lower() != "true":
            return 0

        # Validate required env vars are present (openobserve SDK reads them itself)
        if not os.environ.get("OPENOBSERVE_AUTH_TOKEN"):
            debug("OPENOBSERVE_AUTH_TOKEN not set; exiting.")
            return 0

        payload = read_hook_payload()
        session_id, transcript_path = extract_session_and_transcript(payload)

        if not session_id or not transcript_path:
            debug("Missing session_id or transcript_path from hook payload; exiting.")
            return 0

        if not transcript_path.exists():
            debug(f"Transcript path does not exist: {transcript_path}")
            return 0

        try:
            resource_attrs = {
                "service.name": "claude-code",
                "session.id": session_id,
                "host.name": HOSTNAME,
            }
            if USER_ID:
                resource_attrs["user.id"] = USER_ID
            openobserve_init_traces(
                resource_attributes=resource_attrs,
            )
            tracer = trace.get_tracer("claude-code-hook")
        except Exception as e:
            debug(f"Failed to initialize OpenObserve traces: {e}")
            return 0

        try:
            with FileLock(LOCK_FILE):
                state = load_state()
                key = state_key(session_id, str(transcript_path))
                ss = load_session_state(state, key)

                msgs, ss = read_new_jsonl(transcript_path, ss)
                if not msgs:
                    write_session_state(state, key, ss)
                    save_state(state)
                    return 0

                turns = build_turns(msgs)
                if not turns:
                    write_session_state(state, key, ss)
                    save_state(state)
                    return 0

                # emit turns
                emitted = 0
                for t in turns:
                    emitted += 1
                    turn_num = ss.turn_count + emitted
                    try:
                        emit_turn(tracer, session_id, turn_num, t, transcript_path)
                    except Exception as e:
                        debug(f"emit_turn failed: {e}")
                        # continue emitting other turns

                ss.turn_count += emitted
                write_session_state(state, key, ss)
                save_state(state)

            try:
                openobserve_flush()
            except Exception:
                pass

            dur = time.time() - start
            info(f"Processed {emitted} turns in {dur:.2f}s (session={session_id})")
            return 0

        except Exception as e:
            debug(f"Unexpected failure: {e}")
            return 0

        finally:
            try:
                openobserve_shutdown()
            except Exception:
                pass

    if __name__ == "__main__":
        sys.exit(main())
    ```
