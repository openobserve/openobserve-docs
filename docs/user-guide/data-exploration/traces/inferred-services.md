# Inferred Services in Traces

OpenObserve automatically discovers uninstrumented dependencies — databases, message queues, RPC backends, and external APIs — from your trace spans and surfaces them in the trace list and service graph, even when those dependencies have no instrumentation of their own.

## What are inferred services

When your application calls an uninstrumented dependency (such as a PostgreSQL database, a Kafka topic, or a third-party API), the OpenTelemetry SDK creates a CLIENT or PRODUCER span for that call. The dependency itself has no server span. Without inferred services, only the instrumented `service_name` appears in your trace views, making dependencies invisible.

Inferred services derive a minimal identity for each dependency from the span's peer attributes and surface it alongside your instrumented services. The derivation happens automatically at ingestion time — no additional configuration is required.

## How OpenObserve derives inferred identities

At ingestion time, OpenObserve examines every CLIENT (span kind `3`) and PRODUCER (`4`) span. When the span carries peer attributes that identify the dependency, OpenObserve writes three fields into the span:

| Field | Purpose | Example |
|-------|---------|---------|
| `infer_service_name` | Dependency identity | `orders-db`, `api.stripe.com`, `checkout-events` |
| `infer_service_type` | Coarse category | `database`, `queue`, `rpc`, or `external` |
| `infer_service_system` | Concrete system | `postgresql`, `kafka`, `grpc`, `http` |

The naming logic follows OpenTelemetry semantic conventions and resolves attributes in priority order. The explicit `peer.service` attribute always wins. If no host name is usable (for example, an IP address that would create a separate node per pod), the system redacts it and falls through to the next available name.

### Dependency categories

**`database`** — Recognized when the span carries `db.system` / `db.system.name` or `db.name` / `db.namespace`. Examples: PostgreSQL, MySQL, Redis, MongoDB.

**`queue`** — Recognized when the span carries `messaging.system` or `messaging.destination.name` / `messaging.destination`. Examples: Kafka, RabbitMQ, NATS.

**`rpc`** — Recognized when the span carries `rpc.system` or `rpc.service`. Examples: gRPC services, AWS API.

**`external`** — Used for HTTP calls and other generic network peers identified by `server.address`, `net.peer.name`, `http.host`, or `url.full` / `http.url`.

!!! note "Automatic and backward compatible"
    Inferred service derivation is fully automatic. It activates when a trace stream's schema contains the `infer_service_name` field. Streams that predate the feature — or never call an uninstrumented dependency — continue to work unchanged.

## See inferred services in the trace list

When you open a trace in the **Traces** list, the per-service time and cost breakdown now includes inferred services alongside your instrumented services. Inferred entities are rendered with a dotted style and a type icon so you can visually distinguish them.

![TODO: screenshot of trace list showing inferred service badges in the per-service breakdown](../../../images/placeholder.png)

Each inferred service in the summary shows its name, span count, duration, and type. A span that calls a database counts toward that database's time contribution in this trace, giving you an accurate picture of where time was spent.

## See inferred services in the service graph

In the **Service Graph**, dependencies discovered through inferred services appear as dotted nodes connected by dotted edges from the calling instrumented service.

![TODO: screenshot of service graph showing dotted inferred-service nodes and edges](../../../images/placeholder.png)

Each inferred node shows the same metrics as instrumented nodes — request count, error rate, and latency. Because the dependency has no server span of its own, its latency is measured as the client span's duration (the time the instrumented service spent waiting on the dependency).

The graph's anti-join logic ensures that a dependency that is instrumented elsewhere in the same time window is not double-counted. It appears only as its instrumented self, not as an inferred node.

## Supported attributes

Inferred service derivation recognizes both current and legacy OpenTelemetry attribute names, in dotted and flattened (underscore) forms. The following attributes influence the inferred identity:

**Peer identity**
- `peer.service` — explicit, wins naming for all types

**Database**
- `db.system`, `db.system.name` — system identifier
- `db.name`, `db.namespace` — database name

**Messaging**
- `messaging.system` — broker type
- `messaging.destination`, `messaging.destination.name` — topic or queue name

**RPC**
- `rpc.system` — RPC framework
- `rpc.service` — service name

**Network**
- `server.address`, `net.peer.name`, `http.host` — resolved host
- `url.full`, `http.url` — parsed for host
- `http.request.method`, `http.method` — signals HTTP external

!!! note "About CONSUMER spans"
    CONSUMER spans (span kind `5`) are deliberately excluded. Their duration represents processing time inside the instrumented service, not time spent in the queue.

## No setup required

Inferred services require no configuration. As soon as your application emits CLIENT or PRODUCER spans with the standard OpenTelemetry peer attributes, OpenObserve derives the dependency identity and surfaces it in your traces and service graph. If you want a specific name for a dependency, set the `peer.service` attribute on the span — it takes priority over all other naming rules.
