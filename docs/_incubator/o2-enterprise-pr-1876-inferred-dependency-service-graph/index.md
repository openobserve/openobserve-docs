# Inferred Dependencies in Service Graph Topology

The service graph topology now distinguishes between instrumented services and inferred (uninstrumented) dependencies such as databases, message queues, RPC backends, and external APIs. Inferred dependencies are displayed as dotted nodes and edges with a type icon, while instrumented services retain their standard rendering.

## Overview

When OpenObserve processes trace spans, it can infer dependencies on external services that do not emit their own traces. These inferred dependencies are stored in the `_o2_service_graph` index with a `connection_type` field that categorizes the dependency. The `build_topology` function in the enterprise service graph reads this field and propagates the type information to both the edge and its target (server) node.

The following connection types are recognized:

| `connection_type` | Description                          |
| ----------------- | ------------------------------------ |
| `database`        | A database backend                   |
| `queue`           | A message queue or stream broker     |
| `rpc`             | An RPC-based service                 |
| `external`        | An external API or third-party host  |

A node flagged with a `service_type` is rendered in the dependency graph as a dotted (dashed) node with an icon matching the type. Edges with a `connection_type` are rendered as dotted lines.

> Instrumented services (those sending their own trace spans) have both `service_type` and `connection_type` set to `null` and display normally.

## How the Data Is Constructed

The topology builder aggregates per-minute edge records from the `_o2_service_graph` stream. For each edge record:

1. The `connection_type` is read from the source record (if the field is absent, it defaults to `None` — treating the edge as instrumented).
2. During aggregation across multiple time buckets, the first non-`None` `connection_type` observed for a given edge pair is retained.
3. When an edge has a `connection_type`, the **target (server) node** is tagged with `service_type = connection_type`. Each node keeps only the first non-`None` type assigned.

```
client_service (checkout) ──[connection_type: "database"]──→ server_service (redis-master.prod)
                                                                  service_type: "database"
```

Instrumented edges produce no type tagging:

```
client_service (frontend) ──[no connection_type]──→ server_service (backend)
                                                        service_type: null
```

## Viewing Inferred Dependencies

To view inferred dependencies in the service graph:

1. Navigate to the service graph topology view for your organization.
2. In the graph visualization, dotted nodes represent inferred (uninstrumented) dependencies. Solid nodes are instrumented services.
3. Hovering over a dotted node or edge displays the inferred type in the tooltip.

![TODO: screenshot of service graph showing dotted inferred nodes and edges](images/placeholder.png)

## API Response Fields

The topology endpoint response includes two fields for inferred dependency information.

### ServiceNode

| Field          | Type   | Description                                              |
| -------------- | ------ | -------------------------------------------------------- |
| `service_type` | string | Inferred-service category (`database`, `queue`, `rpc`, `external`). `null` for instrumented services. |

### ServiceEdge

| Field             | Type   | Description                                              |
| ----------------- | ------ | -------------------------------------------------------- |
| `connection_type` | string | Inferred-dependency category. `null` for instrumented edges. |

## Backward Compatibility

The `connection_type` field uses `#[serde(default)]` deserialization. Existing `_o2_service_graph` records written before this field was introduced deserialize with `connection_type: None` and are treated as instrumented. No migration or reindexing is required.
