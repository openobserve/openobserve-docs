---
description: >-
  Restore a broken etcd cluster in OpenObserve by restarting pods, resetting
  data, and rejoining members using CLI and updated Helm configs.
---
# Etcd Cluster Restore

Many users ran into the case only one of the 3 pods of etcd cluster can works. The other 2 pods always restart and can't back to work.

Our experiences in this case it is only one reason:

```
The 3 pods of the etcd cluster Killed / Recreate / Destroyed at same time.
```

Then the cluster was broken, Only one pod can works.

Let's help the cluster back to work.

> If you only have one pod can't work, just delete the PVC of the pod and delete the pod, then it should be work.

### 1. Start the etcd cluster with bash

Because the etcd can't start, we need to start to etcd pod with `bash`. like this:

Change the `values.yaml` of helm for OpenObserve.

Add those lines:

```yaml
  command: ["/bin/bash", "-c", "while true; do sleep 1; done"]
  livenessProbe:
    enabled: false
  readinessProbe:
    enabled: false
```

After change the config of `etcd` should be like this:

```yaml
etcd:
  enabled: true # if true then etcd will be deployed as part of openobserve
  externalUrl: "my_custom_host.com:2379" # if bundled is false then this is required
  replicaCount: 3 # if bundled is true then this is required. should be odd number
  auth:
    token:
      enabled: false
    rbac:
      create: false
      allowNoneAuthentication: true
      rootPassword: ""
  logLevel: "info"
  extraEnvVars:
    - name: ETCD_AUTO_COMPACTION_RETENTION
      value: "1"
  command: ["/bin/bash", "-c", "while true; do sleep 1; done"]
  livenessProbe:
    enabled: false
  readinessProbe:
    enabled: false
```

### 2. Start the pod which still can work

Normally, at least you have one pod still can work. we should start the pod first, because it should have the latest data.

Use any tools or directory use `kubectl -n openobserve exec etcd-N -- bash` login the pod.

You can use the command `env | grep ETCD_INITIAL_CLUSTER` to check current config for initial cluster.

```shell
!@openobserve-etcd-2:/opt/bitnami/etcd$ env | grep ETCD_INITIAL_CLUSTER
ETCD_INITIAL_CLUSTER_TOKEN=etcd-cluster-k8s
ETCD_INITIAL_CLUSTER_STATE=existing
ETCD_INITIAL_CLUSTER=openobserve-etcd-0=http://openobserve-etcd-0.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380,openobserve-etcd-1=http://openobserve-etcd-1.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380,openobserve-etcd-2=http://openobserve-etcd-2.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380
```

The result tell us the etcd cluster starting needs to wait 3 node, but we known it can't, so we change the environment only use current node to start.

Through the command line we can known current pod is `etcd-2`, so we change it like this:

> Please note the pod can work for you maybe is `etcd-1` you need to check it first.

```shell
ETCD_INITIAL_CLUSTER=openobserve-etcd-2=http://openobserve-etcd-2.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380
```

Then start the etcd of this node:

```shell
etcd
```

Yes, just type `etcd` and enter. the etcd will start, and keep the command line here.

> Notice: don't close it, it will shutdown the etcd server if you close the shell.

Waiting for seconds, you can see the `etcd` is working.

Then let's restore other nodes.

Before switch to other pod, we need to add a new member to this cluster.

You need create a new shell for this pod, in our case it is `etcd-2`.

Check current member of this cluster, it should only it self.
```shell
!@openobserve-etcd-2:/opt/bitnami/etcd$ etcdctl member list
3f59fc06477e49f8, started, openobserve-etcd-2, http://openobserve-etcd-2.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380, http://openobserve-etcd-2.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2379,http://openobserve-etcd.ziox-dev.svc.cluster.local:2379, false
```

Let's add a new member to this cluster:

```shell
!@openobserve-etcd-2:/opt/bitnami/etcd$ etcdctl member add openobserve-etcd-0 --peer-urls=http://openobserve-etcd-0.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380
```

We use the information from `ENV`. Here we add the member `openobserve-etcd-0`. of course you can choose `etcd-1`, it doesn't matter, but the next you need restore this node first.

### 3. Start other pods which can't work

Earlier we add `etcd-0` to the cluster, so we need restore it first, Let's login into the pod.

First, Delete the old data of this node.

```shell
rm -fR /bitnami/etcd/data/*
```

Second, change the environment for the cluster:

```shell
ETCD_INITIAL_CLUSTER=openobserve-etcd-0=http://openobserve-etcd-0.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380,openobserve-etcd-2=http://openobserve-etcd-2.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380
ETCD_INITIAL_CLUSTER_STATE=existing
```

> Please notice it include 2 pods, `etcd-0` and `etcd-2`.

Then start etcd:

```shell
etcd
```

Yes, just type `etcd` and enter. the etcd will start, and keep the command line here.

> Notice: don't close it, it will shutdown the etcd server if you close the shell.

Waiting for seconds, you can see the `etcd` is working.

You can create a new shell and login into this pod to check it:

```shell
!@openobserve-etcd-2:/opt/bitnami/etcd$ etcdctl member list
3f59fc06477e49f8, started, openobserve-etcd-2, http://openobserve-etcd-2.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380, http://openobserve-etcd-2.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2379,http://openobserve-etcd.ziox-dev.svc.cluster.local:2379, false
51daebb86180a114, started, openobserve-etcd-0, http://openobserve-etcd-0.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380, http://openobserve-etcd-0.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2379,http://openobserve-etcd.ziox-dev.svc.cluster.local:2379, false
```

It should list 2 members.

Let's add the last member, same steps do again:

First, add `etcd-1` to the cluster:

```shell
!@openobserve-etcd-2:/opt/bitnami/etcd$ etcdctl member add openobserve-etcd-1 http://openobserve-etcd-1.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380
```

Second, login into the pod `etcd-1`, delete old data and start etcd.

Finally, it should list 3 members:

```shell
!@openobserve-etcd-2:/opt/bitnami/etcd$ etcdctl member list
3f59fc06477e49f8, started, openobserve-etcd-2, http://openobserve-etcd-2.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380, http://openobserve-etcd-2.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2379,http://openobserve-etcd.ziox-dev.svc.cluster.local:2379, false
51daebb86180a114, started, openobserve-etcd-0, http://openobserve-etcd-0.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380, http://openobserve-etcd-0.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2379,http://openobserve-etcd.ziox-dev.svc.cluster.local:2379, false
8f96db53130680d4, started, openobserve-etcd-1, http://openobserve-etcd-1.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2380, http://openobserve-etcd-1.openobserve-etcd-headless.ziox-dev.svc.cluster.local:2379,http://openobserve-etcd.ziox-dev.svc.cluster.local:2379, false
```

Okay, the cluster restored.

Now, we need restore the configuration of helm. 

```yaml
etcd:
  enabled: true # if true then etcd will be deployed as part of openobserve
  externalUrl: "my_custom_host.com:2379" # if bundled is false then this is required
  replicaCount: 3 # if bundled is true then this is required. should be odd number
  auth:
    token:
      enabled: false
    rbac:
      create: false
      allowNoneAuthentication: true
      rootPassword: ""
  logLevel: "info"
  extraEnvVars:
    - name: ETCD_AUTO_COMPACTION_RETENTION
      value: "1"
#   command: ["/bin/bash", "-c", "while true; do sleep 1; done"]
#   livenessProbe:
#     enabled: false
#   readinessProbe:
#     enabled: false
```

Comment the command we added at first, and then deploy to k8s again. You will see the etcd pods recreate one by one. and every pod needs 2 minutes to become green.

After 5 minutes, everything should works. 

You also need to recreate OpenObserve pods because the etcd recreated, maybe some pods can't connect to etcd for a while.
