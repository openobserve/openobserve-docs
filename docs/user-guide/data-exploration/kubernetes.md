---
title: Kubernetes Explorer
description: >-
  Browse your Kubernetes clusters with the read-only Infra > Kubernetes 2 explorer: cluster and workload overviews, sortable resource lists, a honeycomb cluster map, and per-object details with metric charts and events.
---

# Kubernetes Explorer

The Kubernetes Explorer is a read-only cluster browser for the telemetry you already send to OpenObserve. It appears in the sidebar as **Infra › Kubernetes 2** (at `/infra/kubernetes-2`), alongside the existing **Kubernetes** page, and reads your kube-state-metrics, kubelet stats, and the `k8s_events` object stream through the existing PromQL and SQL search APIs. No additional backend, API, or migration changes are required.

![the Kubernetes Explorer cluster overview showing CPU and memory gauges, an allocatable chart, and a warnings table](images/placeholder.png)

## What the explorer reads

The page builds itself from three data sources that OpenObserve detects automatically:

- **kube-state-metrics** — object inventory: pods, nodes, workloads, PVCs, HPAs, and namespaces.
- **kubelet stats** — per-object usage: CPU, memory, network, and filesystem series such as `k8s_node_cpu_usage`, `k8s_pod_cpu_usage`, `k8s_pod_memory_working_set`, and `k8s_node_filesystem_usage`.
- **`k8s_events`** — the Kubernetes event object stream, used for events and, when cluster-labelled, for map labels.

On first open, the page detects which streams are present. If no Kubernetes telemetry is visible, it shows a **No Kubernetes telemetry visible to you yet** empty state with a setup card; if only events are available (no metrics), it lands directly on the **Events** view.

## Views

A section rail on the left switches between views, grouped into:

- **Cluster** — **Overview** and **Map**
- **Nodes**
- **Workloads** — **Overview**, **Pods**, **Deployments**, **DaemonSets**, **StatefulSets**, **ReplicaSets**, **Jobs**, **CronJobs**
- **Storage** — **PersistentVolumeClaims**
- **Autoscaling** — **HorizontalPodAutoscalers**
- **Namespaces** and **Events**

A **cluster** selector and a **time range** picker sit in the page header. Choosing a cluster scopes every view and detail panel to that cluster.

## Cluster overview

The **Cluster** view summarizes capacity and usage for the selected cluster:

- **CPU** and **Memory** cards show **Usage**, **Requests**, and **Limits** as progress bars against allocatable, with a note when configured limits exceed allocatable.
- A **Pods** card counts pods in phase `Running` against the cluster's pod allocatable.
- A bar chart shows CPU or memory usage over the selected range, with an **Allocatable** mark line.
- A **Warnings (last hour)** table lists warning events with their object, type, and age; click a row to open its details.

## Workloads overview

The **Workloads › Overview** view gives a status breakdown for each workload kind across cards: **Pods**, **Deployments**, **DaemonSets**, **StatefulSets**, **ReplicaSets**, **Jobs**, and **CronJobs**. Each card shows the running/pending/failed/succeeded counts as progress bars, and a **Recent events** table lists the latest cluster events.

![the workloads overview showing status cards for each workload kind and a recent events table](images/placeholder.png)

## Resource lists

Each resource view (Nodes, Pods, Deployments, and so on) is a sortable, searchable table with columns specific to that kind. You can:

- **Search** by name, with a 300 ms debounce.
- **Filter by namespace** using the multi-select in the header.
- **Sort** any column by clicking its header; the sort state lives in the URL.
- **Hide columns** you do not need — your column visibility is persisted per view.

Rows show kind-specific detail, for example pod CPU and memory with a usage tooltip ("`… of request · … of limit`"), node CPU/memory/disk as progress bars, taints and roles, deployment replica ratios, and a warning icon on rows with recent warnings. Click a row to open its details.

![a Kubernetes resource list showing sortable columns, namespace filter, search, and per-row status](images/placeholder.png)

## Cluster map

The **Map** view renders a honeycomb of pods or nodes, letting you visualize the whole cluster at a glance:

- **Pods**/**Nodes** toggle selects which entity to map.
- **Fill by** colors each hex by **CPU** or **memory** (against requests, limits, or allocatable), by **restarts**, or by **status**.
- **Group by** arranges hexes into cards by **node**, **namespace**, **workload**, or **none** — or by any label observed on your pods or nodes in the last 24 hours.
- **Filter** narrows the map by `key: value` label terms.

Hover a hex for a per-object tooltip; click it to open the details panel. Use the zoom controls (**+**, **−**, **Fit to view**), scroll to zoom, or drag to pan. A group navigation overlay lists groups for quick access, and the legend lets you highlight a specific color band. Click **Show as list** to jump to the same selection as a flat list.

![the cluster map showing a honeycomb of pods grouped by namespace and filled by CPU](images/placeholder.png)

## Details panel

Clicking any object opens a non-modal details drawer on the right (the same click closes it again). The drawer stays anchored to the page so you can keep browsing the list or map while it is open.

- **Metric charts** — tabbed CPU, memory, network, and filesystem (or disk) charts for the object and its members, over the selected time range.
- **Metadata** — creation time, namespace, UID, labels, annotations, and **Controlled by**, with links that navigate to the namespace or owner.
- **Kind-specific details** — pod status, node, IPs, QoS, conditions, and per-container image, ports, environment, mounts, probes, and requests/limits; node addresses, OS, and capacity; workload replicas, selector, and strategy.
- **Events** — the object's events from `k8s_events`, with reason, source, count, and last-seen time.

![the details drawer showing metric charts, metadata, and kind-specific sections for a pod](images/placeholder.png)

### View logs

For pods, a **View logs** button in the drawer resolves the log stream carrying that pod's name and namespace and jumps to the Logs page pre-scoped to the pod and the current time range.

## Sharing and URL state

Every view, filter, sort, cluster, and open panel is encoded in the URL, so you can bookmark or share the exact state you are looking at. Search, sort, and most groupings only re-filter already-loaded rows, so navigating between views is immediate.
