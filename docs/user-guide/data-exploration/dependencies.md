---
title: Dependencies
description: "See which Kubernetes workloads or Linux hosts talk to each other, and how many bytes per second flow between them, from eBPF network flow metrics."
---

# Dependencies Maps

A **Dependencies** map draws which Kubernetes workloads, or which Linux hosts, talk to each other and how much traffic flows between them. It covers any TCP or UDP traffic, including databases, caches and other services that are not traced. The data comes from the eBPF network flow metric `obi_network_flow_bytes`.

## Reading the map

- Cards are the ends of a connection: workloads on the Kubernetes map, hosts and named networks on the hosts map.
- **Lines** are connections. A thicker line carries more bytes per second.
- Arrows point from the client (the side that opened the connection) to the server. A grey line means the direction is unknown, or both sides open connections to each other.
- Hover or select a line to see its rate. Select a line to open a side panel with the rate in each direction and the split between request, response and unknown direction.
- The **Connections** list gives keyboard and screen-reader access to the same connections.

Rates are approximate bytes per second, averaged over the selected time range up to its end. The averaging window is at least 5 minutes and at most 24 hours. Connections below 1 B/s are hidden until you turn on **Low-traffic connections**.

The map draws at most 80 cards and 200 connections, busiest first. When it drops some, it says how many of the total it shows.

## Kubernetes workloads

Go to **Infra** > **Kubernetes**, and in the resource tree select **Cluster** > **Dependencies**. The map covers the selected cluster.

- One card per workload, such as a Deployment, StatefulSet, DaemonSet or CronJob. A card's colour is its namespace.
- **Node** cards stand for host processes and host-network pods on a node.
- **External or node-local** stands for addresses outside the cluster, or traffic inside a node such as kubelet probes.
- Click a workload card to open its details panel.

Filter the map with:

- The namespace filter and **Search workloads**.
- **System namespaces**: shows `kube-system`, `kube-node-lease`, `openobserve-collector`, `cert-manager` and `opentelemetry-operator-system`. Off by default.
- **Node-to-node traffic**: shows traffic between nodes. Off by default.
- **Low-traffic connections**: shows connections below 1 B/s. Off by default.
- **Grouping**: **Auto** groups workloads by namespace once the map has more than 40 endpoints, **Collapsed** always groups and **Expanded** never does. Click a namespace card to show its workloads. Grouping is off while a namespace filter or search is active.

The switches are kept in the URL, so you can share the view.

## Linux hosts

Go to **Infra** > **Hosts** and select the **Dependencies** tab next to **Table**.

Each card is a name from the agent's `--network-flows` list, not a raw address:

- **Host**: a name that matches a host name. Click it to open the host's details.
- **Network**: a range of addresses named in the `--network-flows` list.
- **Unnamed addresses**: addresses that no `--network-flows` entry covers.

Turn on **Low-traffic connections** to include connections below 1 B/s. The selected tab and the switch are kept in the URL.

For every host to show up, install the agent on every host with the same `--network-flows` list, and give each host's own address (`/32`) an entry named after its host name. A name that covers several hosts may show only the traffic of the busiest of them.

## Set up network flows

When no flow data is found, the map shows **No network flow data** or **No network flows in this time range**. Click **Set up network flows** to open the matching data source setup.

### Kubernetes

On the **Data sources** page, open the Kubernetes setup and follow the optional step **See which workloads talk to each other: eBPF network flows**. It upgrades the OpenObserve collector to chart 0.8.0 or later with eBPF network flows turned on:

```bash
helm repo update openobserve
helm --namespace openobserve-collector upgrade o2c openobserve/openobserve-collector \
  --version '>=0.8.0' --reset-then-reuse-values \
  --set ebpf.enabled=true \
  --set ebpf.network.enabled=true
```

Requirements: Helm 3.14+ and OpenTelemetry operator v0.142.0+. The `openobserve-collector` namespace must allow privileged pods. Nodes must run Linux on amd64 or arm64 with kernel 5.8+ (or RHEL-family 4.18 with eBPF backports) and BTF. Port `8888` on `127.0.0.1` of each node must be free. Re-running the collector install command turns flows off again, so run the upgrade again afterwards.

### Linux

On the **Data sources** page, open the Linux setup and follow the step **See which hosts talk to each other: eBPF network flows**. Enter the networks in **Networks to label** as comma-separated `CIDR` or `CIDR=NAME` entries, for example `10.0.1.5/32=web-1,10.0.1.6/32=db-1`. The install command then includes `--network-flows '<list>'`.

Requirements: Linux 5.8+ (or RHEL-family 4.18 with eBPF backports) with BTF. The agent then runs as root. Each run of the installer replaces the agent's configuration, so add your tracing flags again if you use eBPF tracing.

:::note
The same bytes can be reported more than once: traffic between nodes or hosts is seen by both ends. The Kubernetes map counts each node pair once. If your collector does not send the source and destination node labels (`k8s_src_node_name`, `k8s_dst_node_name`), a workload pair spread over several nodes can be undercounted.
:::

## Related pages

- [Kubernetes Explorer](kubernetes.md)
- [Kubernetes monitoring](../../integration/system/k8s.md)
- [Linux server monitoring](../../integration/system/linux.md)
- [OBI (eBPF zero-code) traces and metrics](../../ingestion/traces/obi.md)
