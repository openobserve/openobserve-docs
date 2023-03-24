# Check your CPU supports SIMD features

ZincObserve supports use the feature `AVX512` on Intel CPU or `NEON` on Arm CPU for SIMD.

To check your CPU if support those features:

```shell
#!/bin/bash

# use lscpu get cpu features
cpu_flags=$(lscpu | grep -oP 'Flags:\s+\K(.*)')

# check supports simd features
if echo "$cpu_flags" | grep -qie "(avx512|neon)"; then
    echo "Your CPU supports AVX512 or NEON, you can use simd version."
    echo "docker image tag:"
    echo "public.ecr.aws/zinclabs/zincobserve:latest-simd"
else
    echo "Your CPU doesn't support AVX512 or NEON, you should use common version."
    echo "docker image tag:"
    echo "public.ecr.aws/zinclabs/zincobserve:latest"
fi
```
