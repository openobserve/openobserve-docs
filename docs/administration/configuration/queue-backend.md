---
description: >-
  Choose and configure the queue backend (NATS or in-memory) that OpenObserve
  uses for internal event coordination, rate limiting, and cluster operations.
---
# Queue Backend

OpenObserve uses an internal message queue for coordinating cluster events, rate limiting, and synchronizing state across nodes. You can choose between two queue backends by setting `ZO_QUEUE_STORE`.

## Choosing a backend

| Backend | Best for |
|---------|----------|
| **NATS** (`nats`) | Cluster (HA) deployments with multiple nodes. Requires a running NATS server. |
| **In-memory** (`memory`) | Local single-process deployments where you want to avoid running a NATS server. Process-local and non-durable. |

When `ZO_QUEUE_STORE` is left unset, OpenObserve selects the backend automatically:

- **Local mode** (`ZO_LOCAL_MODE=true`): defaults to `memory`
- **Cluster mode** (`ZO_LOCAL_MODE=false`): defaults to `nats`

Explicit values are always honored, and unknown values cause a startup error.

## Configuration

### `ZO_QUEUE_STORE`

| Value | Description |
|-------|-------------|
| `nats` | Use a NATS JetStream server for queuing. Requires the NATS server to be configured (see [NATS configuration](./environment-variables.md#nats)). |
| `memory` | Use a bounded, process-local, in-memory queue. Works only in local mode. |

The `memory` backend is rejected at startup if `ZO_LOCAL_MODE` is `false`, since an in-memory queue cannot coordinate across nodes in a cluster deployment.

### `ZO_MEMORY_QUEUE_MAX_SIZE_MB`

| Default | Description |
|---------|-------------|
| `64` | Aggregate accounted memory limit in megabytes across all queue topics when `ZO_QUEUE_STORE=memory`. |

Set this to control the maximum memory the in-memory queue can consume across all topics. A value of `0` falls back to the default of 64 MB. The value is validated at startup and converted to bytes internally.

## In-memory queue behavior

When `ZO_QUEUE_STORE=memory`, the queue backend operates with the following characteristics:

- **Process scope**: All state is held in memory and lost when the process exits. No durability across restarts.
- **At-least-once delivery**: Messages are guaranteed to be delivered at least once within the process lifetime. FIFO ordering for first delivery.
- **Single global budget**: The `ZO_MEMORY_QUEUE_MAX_SIZE_MB` limit is shared across all queue topics. Both topic metadata and message payloads count toward the budget.
- **Publication rejection**: Publishing a message that would exceed the budget returns a `QueueFull` error. A message larger than the entire budget returns a `MessageTooLarge` error. Unacknowledged messages are never evicted to make room.
- **Lazy expiration sweep**: When the budget is full, expired messages (past their `max_age`) are reclaimed from all topics to make room before rejecting the publication. Routine expiration is handled by a background maintenance loop.
- **One active consumer per topic**: A topic supports one active consumer at a time. Re-subscribing after the previous consumer closes is supported.
- **Visibility timeout**: Unacknowledged messages are redelivered after 30 seconds, matching the default NATS `ack_wait`. A stale ack (e.g., from a timed-out delivery) does not affect the newer delivery attempt.
- **Deliver policies**: `All`, `Last`, and `New` deliver policies are supported. `All` replays the full backlog; `Last` keeps only the newest unacknowledged message; `New` starts with messages published after the subscription.
- **`max_age` support**: Messages are expired based on their original publication time. Expiration applies to both pending and in-flight messages.
- **Redelivery**: Messages dropped without acknowledgment (e.g., the receiver is dropped) are requeued for redelivery. Messages exceeding the visibility timeout are also requeued.

### Limitations

- No durability: all queued messages are lost on process exit.
- Not supported in cluster mode.
- Total message accounting includes per-entry and per-topic overhead (roughly 128 bytes per message and 256 bytes per topic), so empty messages still consume budget.

## Metrics

When `ZO_QUEUE_STORE=memory`, the following Prometheus metrics are exposed on the `/metrics` endpoint:

| Metric | Labels | Description |
|--------|--------|-------------|
| `queue_memory_used_bytes` | `backend` | Current aggregate accounted bytes across all queue topics |
| `queue_memory_limit_bytes` | `backend` | Configured aggregate byte limit |
| `queue_messages` | `topic`, `state` | Message counts by topic and state (`pending`, `in_flight`) |
| `queue_publish_total` | `topic`, `result` | Publications by topic and result (`accepted`, `rejected_full`, `rejected_too_large`) |
| `queue_redelivery_total` | `topic`, `reason` | Redeliveries by topic and reason (`dropped`, `timeout`) |
| `queue_message_expired_total` | `topic`, `state` | Messages expired by `max_age`, by topic and state (`pending`, `in_flight`) |
| `queue_oldest_message_age_seconds` | `topic` | Age in seconds of the oldest pending or in-flight message |

## Rate limiting with the in-memory queue

Enterprise rate limiting requires `ZO_QUEUE_STORE=nats`. Setting `ZO_QUEUE_STORE=memory` while rate limiting is enabled causes a startup error.

## Example: local development setup

```bash
# Run in local mode with the in-memory queue (default behavior)
ZO_LOCAL_MODE=true ./openobserve

# Equivalent, with explicit values
ZO_LOCAL_MODE=true ZO_QUEUE_STORE=memory ZO_MEMORY_QUEUE_MAX_SIZE_MB=128 ./openobserve

# Run in local mode but use a local NATS server for the queue
ZO_LOCAL_MODE=true ZO_QUEUE_STORE=nats ZO_NATS_ADDR=localhost:4222 ./openobserve
```
