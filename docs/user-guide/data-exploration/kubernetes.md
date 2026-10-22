---
title: Kubernetes Explorer
description: Browse Kubernetes clusters read-only in Infra > Kubernetes 2, with resource lists, a honeycomb cluster map, and per-object details.
---

**Infra › Kubernetes 2** is a read-only browser for the Kubernetes telemetry you already send to OpenObserve. It sits next to the existing **Kubernetes** page, which is unchanged.

It reads three sources through the normal PromQL and SQL search APIs, so there is nothing extra to set up:

- **kube-state-metrics** for the object inventory: pods, nodes, workloads, PVCs, HPAs, and namespaces.
- **kubelet stats** for CPU, memory, network, and filesystem usage.
- The **`k8s_events`** stream for events.

If none of these are present, the page shows **No Kubernetes telemetry visible to you yet**.

![TODO: screenshot of the Kubernetes 2 cluster overview](images/placeholder.png)

## Views

Use the rail on the left to switch views, and the header to pick a cluster and time range:

- **Cluster**: **Overview** and **Map**
- **Nodes**
- **Workloads**: **Overview**, **Pods**, **Deployments**, **DaemonSets**, **StatefulSets**, **ReplicaSets**, **Jobs**, **CronJobs**
- **Storage**: PersistentVolumeClaims
- **Autoscaling**: HorizontalPodAutoscalers
- **Namespaces** and **Events**

Each resource view is a sortable, searchable list with columns for that kind. Filter by namespace from the header, and click a row to open its details.

## Cluster map

The **Map** view shows pods or nodes as a honeycomb:

- **Fill by**: CPU or memory as a percentage of request, limit, or allocatable, restarts, or status.
- **Group by**: node, namespace, workload, none, or any label observed on your pods or nodes.
- **Filter**: narrow the map with `key: value` label terms.

Hover a cell for a tooltip and click it to open its details. Click **Show as list** to see the same selection as a list.

![TODO: screenshot of the cluster map grouped by namespace and filled by CPU](images/placeholder.png)

## Details panel

Clicking any object opens a details panel beside the list or map, so you can keep browsing while it is open. It shows:

- Metric charts for the selected time range.
- Metadata, such as namespace, labels, annotations, and the owning object.
- Sections specific to the kind, such as pod containers and conditions, or node capacity.
- The object's events.

For a pod, click **View logs** to open Logs for that pod's log stream over the current time range.

## Share a view

Every view, filter, sort, and open panel is kept in the URL, so you can bookmark or share exactly what you see.
