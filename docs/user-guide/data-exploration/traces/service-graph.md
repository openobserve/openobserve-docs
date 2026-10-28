---
title: Service Graph
description: Service Graph visualizes how services communicate as a real-time topology from distributed traces, with health colors, call edges, and inferred dependencies.
---

:::::tabs
::::tab[Overview]
Service graph provides a real time visual overview of how your services communicate with each other. It reads distributed traces and identifies which services call downstream services, how many requests flow between them, and how healthy those interactions are.

:::note[Note]
Service Graph is an Enterprise-only feature.
:::

**Key points**:

- It helps you understand system behaviour at a glance. 
- It highlights unusual behaviour so that you can quickly decide where to investigate next using Logs, Metrics, or Traces. 
- It is not intended for detailed debugging. 
- It helps you see the overall topology and identify the services that need closer attention.

Service graph focuses on recent activity. When services are inactive for a period of time, they are removed from the graph to prevent unbounded growth and to keep the view relevant.


:::note[Where to find this]

1. Sign in to OpenObserve.
2. Select **Traces** in the left navigation panel.
3. Choose **Service Graph** from the **Spans | Traces | Service Graph | Service Catalog** toggle in the search bar. You can also hover over **Traces** in the left navigation and select **Service Graph**. On the open-source edition the option shows a lock icon.

The topology loads automatically when recent trace activity is available.
If there is no trace activity, the section displays a message indicating that no service graph data is available.
:::


## What service graph displays
Service graph displays the services in your system and the communication observed between them.

### Services
Each service represents an application component discovered from distributed traces. The view displays:

- The service name  
- A summary of recent requests  
- A colour that reflects the recent error behaviour  

### Colours
The border colour of each service shows its health, based on its error rate. The legend above the graph shows the same scale.

| Status | Error rate |
|--------|------------|
| **Healthy** | Less than 1% |
| **Degraded** | 1–5% |
| **Warning** | 5–10% |
| **Critical** | Greater than 10% |

In Graph View, the node size shows the number of requests.

### Edges
Edges represent calls from one service to another. They indicate downstream communication and help you identify where issues may originate.

Edges to inferred dependencies (such as databases, queues, or external APIs) appear as dotted lines with a type icon. Instrumented service-to-service edges appear as solid lines.

### Topology behaviour
Service graph displays only recent activity. When a service produces no trace data for a set duration, it is removed from the topology. This design focuses attention on the active state of your system.

### Inferred dependencies

OpenObserve automatically discovers uninstrumented dependencies — databases, message queues, RPC backends, and external APIs — from your trace spans and surfaces them in the service graph, even when those dependencies have no instrumentation of their own.

When your application calls an uninstrumented dependency (such as a PostgreSQL database, a Kafka topic, or a third-party API), the OpenTelemetry SDK creates a CLIENT or PRODUCER span for that call. The dependency itself has no server span. OpenObserve derives a minimal identity for each dependency from the span's peer attributes and displays it alongside your instrumented services.

**How derivation works**

At ingestion time, OpenObserve examines every CLIENT and PRODUCER span. When the span carries peer attributes that identify the dependency, three fields are written into the span:

| Field | Purpose | Example |
|-------|---------|---------|
| `infer_service_name` | Dependency identity | `orders-db`, `api.stripe.com`, `checkout-events` |
| `infer_service_type` | Coarse category | `database`, `queue`, `rpc`, or `external` |
| `infer_service_system` | Concrete system | `postgresql`, `kafka`, `grpc`, `http` |

The naming logic follows OpenTelemetry semantic conventions and resolves attributes in priority order. The explicit `peer.service` attribute always wins — set it on your spans if you want a specific name for a dependency. If no host name is usable (for example, an IP address that would create a separate node per pod), the system redacts it and falls through to the next available name.

**Supported categories**

Inferred dependency nodes appear with a dotted border and a type icon that indicates the category. Edges connecting to inferred dependencies are also rendered as dotted lines.

- **Database** — databases such as PostgreSQL, MySQL, Redis, and MongoDB. Recognized when the span carries `db.system` / `db.system.name` or `db.name` / `db.namespace`.
- **Queue** — message queues such as Kafka, RabbitMQ, and NATS. Recognized when the span carries `messaging.system` or `messaging.destination.name`.
- **RPC** — RPC backends such as gRPC services and AWS API. Recognized when the span carries `rpc.system` or `rpc.service`.
- **External** — external HTTP APIs and generic network peers. Recognized by `server.address`, `net.peer.name`, `http.host`, or `url.full` / `http.url`.

![Inferred dependency nodes showing dotted borders, type icons, and dotted edges in the service graph](images/service-graph-inferred-dependencies-1.png)

Because the dependency has no server span of its own, its latency is measured as the client span's duration (the time the instrumented service spent waiting on the dependency). The graph's anti-join logic ensures that a dependency that is instrumented elsewhere in the same time window is not double-counted — it appears only as its instrumented self.

Inferred dependency metadata is stored with a `connection_type` field in the `_o2_service_graph` stream. This field is backward compatible — edges recorded before the `connection_type` field existed deserialize to `None` and are treated as instrumented service-to-service edges.

**Supported span attributes**

Inferred service derivation recognizes both current and legacy OpenTelemetry attribute names, in dotted and flattened (underscore) forms:

- **Peer identity** — `peer.service` (explicit; wins naming for all types)
- **Database** — `db.system`, `db.system.name`, `db.name`, `db.namespace`
- **Messaging** — `messaging.system`, `messaging.destination`, `messaging.destination.name`
- **RPC** — `rpc.system`, `rpc.service`
- **Network** — `server.address`, `net.peer.name`, `http.host`, `url.full`, `http.url`, `http.request.method`, `http.method`

:::note[About CONSUMER spans]
CONSUMER spans (span kind `5`) are deliberately excluded from inferred dependency derivation. Their duration represents processing time inside the instrumented service, not time spent in the queue.
:::

:::note[Automatic and backward compatible]
Inferred service derivation is fully automatic and requires no configuration. It activates when a trace stream's schema contains the `infer_service_name` field. Streams that predate the feature — or never call an uninstrumented dependency — continue to work unchanged.
:::

**Inferred services in the trace list**

Inferred dependencies also appear in the per-service time and cost breakdown when you open a trace in the **Traces** list. Inferred entities are rendered with a dotted style and a type icon so you can visually distinguish them from instrumented services. Each inferred service in the trace summary shows its name, span count, duration, and type.

![trace list showing inferred service badges in the per-service breakdown](images/inferred-service-dependencies-1.png)


## Data source
Service graph uses distributed traces as the single data source.  
OpenObserve matches client spans and server spans belonging to the same request. This allows the system to identify service relationships, request patterns, and error behaviour.

Service graph does not use logs or metrics directly.

## Main controls

### Stream selector
Select the trace stream to build the topology from. The graph shows one stream at a time.

### Search services
Enter a service name in **Search Services** to filter the view. The graph focuses on the matching services and the services connected to them.

### Show types
Use **Show types** to hide or show entity types (**Services**, **Datastores**, **Queues**, **External**, **RPC**, and, for AI agents, **Agents**, **Tools**, and **Models**). Under **Layout**, choose **Auto**, **Expanded**, or **Collapsed** to control whether inferred dependencies are grouped on large graphs.

### Time range and refresh
Use the date-time picker to set the time range, and the refresh button to reload the graph.

### View mode
Choose between **Tree View** and **Graph View**. Both views show the same information using different layouts.

### Layout options
Tree View supports **Horizontal** and **Vertical** layouts.  
Graph View uses **Force Layout**.

## Tree view
Tree view arranges services in a structured hierarchy. It is useful when you want to follow traffic from entrypoint services to downstream dependencies.

## Graph view
Graph view arranges services as a network. It uses a physics based simulation to maintain stable spacing between services and groups related services together.

## Interaction
You can drag services to reposition them. You can zoom and pan to explore specific areas, or use **Zoom in**, **Zoom out**, and **Fit to screen**. Hovering over a service displays a summary of request and error behaviour. Click a service to open its side panel, with its operations, metrics, and links to **View Traces** and related logs. Filters and layouts can be combined to focus on specific sections of the topology.
::::
::::tab[How-to]
## Filter the graph by service

1. Enter a service name in the **Search Services** field.  
2. Review the focused view of the selected service.

## Change the view type

1. Select **Tree View** or **Graph View**.  
2. Select a layout.

## Investigate an issue

1. In the **Service Graph**, identify any services with warning or critical colours.  
2. Follow the edges to determine which downstream services may be affected.  
3. Click the service to open its side panel.  
4. Select **View Traces**, or switch to Logs or Metrics and filter by that service for further analysis.
::::
:::::
