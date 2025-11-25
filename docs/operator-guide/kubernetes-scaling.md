This page describes how OpenObserve handles Kubernetes scaling actions. 
!!! note "Note"
    This is an enterprise feature. 
    Refer to the [Enterprise Edition Installation Guide](https://openobserve.ai/docs/openobserve-enterprise-edition-installation-guide/) for deployment steps.

## Overview 
Kubernetes manages the scaling of OpenObserve pods based on system load.
OpenObserve does not make scaling decisions. It only reacts to the actions taken by Kubernetes.

## When Kubernetes scales up
Kubernetes adds more OpenObserve pods when load increases.
The new pods join the cluster and start serving traffic or ingesting data immediately.
No special action is required inside OpenObserve.

## When Kubernetes scales down
Kubernetes selects a pod to remove.
Before stopping it, the Helm chart calls the OpenObserve drain API.
OpenObserve starts the graceful drain workflow.

## Graceful drain workflow
1. The ingester flushes all in-memory data into its write-ahead log on disk.
2. The background file processing job switches into drain mode and continues running until all pending data files are processed and uploaded.
3. OpenObserve exposes a drain status API that reports the progress of this workflow.
4. When draining is complete and no pending data remains, OpenObserve reports that the node is ready for shutdown.
5. Kubernetes then terminates the pod safely.