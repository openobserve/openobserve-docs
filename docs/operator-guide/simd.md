---
description: >-
  Learn how to check CPU support for SIMD (AVX512 or NEON) to use optimized
  OpenObserve builds, including Docker tags and Kubernetes deployment tips.
---
# Check your CPU supports SIMD features

OpenObserve supports use the feature `AVX512` on Intel CPU or `NEON` on Arm CPU for SIMD.

To check your CPU if support those features:

```shell
#!/bin/bash

# use lscpu get cpu features
cpu_flags=$(lscpu | grep -oP 'Flags:\s+\K(.*)')

# check supports simd features
if echo "$cpu_flags" | grep -qie "(avx512|neon)"; then
    echo "Your CPU supports AVX512 or NEON, you can use simd version."
    echo "docker image tag:"
    echo "public.ecr.aws/zinclabs/openobserve:latest-simd"
else
    echo "Your CPU doesn't support AVX512 or NEON, you should use common version."
    echo "docker image tag:"
    echo "public.ecr.aws/zinclabs/openobserve:latest"
fi
```

## Kubernetes

The Kubernetes add-on [node-feature-discovery](https://kubernetes-sigs.github.io/node-feature-discovery/v0.17/get-started/index.html)
can automatically label nodes with their supported CPU features. With node-feature-discovery installed on your k8s cluster,
the SIMD image of OpenObserve can be deployed with our [helm charts](https://github.com/openobserve/openobserve-helm-chart)
using a value for `nodeSelector`.

### With `openobserve` (HA)

```yaml
image:
  oss:
    tag: v0.14.2-simd

nodeSelector:
  ingester: &AVX_NODE_SELECTOR
    feature.node.kubernetes.io/cpu-cpuid.AVX512F: "true"
  querier: *AVX_NODE_SELECTOR
  compactor: *AVX_NODE_SELECTOR
  router: *AVX_NODE_SELECTOR
  alertmanager: *AVX_NODE_SELECTOR
```

### With `openobserve-standalone`

```yaml
image:
  tag: v0.14.2-simd

nodeSelector:
  feature.node.kubernetes.io/cpu-cpuid.AVX512F: "true"
```

