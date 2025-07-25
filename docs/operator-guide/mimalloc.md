---
description: >-
  Enable Mimalloc in OpenObserve for optimized Rust memory management. Use cargo
  flags and env vars for fine-tuned performance and memory control.
---
# Mimalloc

OpenObserve has a feature to use [Mimalloc](https://github.com/microsoft/mimalloc) as memory management for Rust.

But default we didn't enable it, if you want enable should add cargo flags like this:

```
RUSTFLAGS='-C target-cpu=native' cargo build --release --features mimalloc
```

if you want better control to release memory quickly, you can set some environments

```
export MIMALLOC_VERBOSE=1
export MIMALLOC_PAGE_RESET=1
export MIMALLOC_DECOMMIT_DELAY=25
```

More options refer to: https://github.com/microsoft/mimalloc#environment-options
