---
title: work-group
description: Manage query performance in enterprise with Work Group settings—optimize CPU, memory, and concurrency for long and short queries in OpenObserve streams.
---

Work groups control how OpenObserve allocates CPU, memory, and concurrency for different types of search tasks. They help maintain consistent performance when multiple users and system processes run searches at the same time. 

:::note[Note]
This feature is available in the Enterprise Edition.
:::

:::warning[Work group settings were renamed]
The earlier `O2_SEARCH_GROUP_*` settings no longer exist. Work groups now use slot-based admission and the `O2_WORK_GROUP_*` settings, and per-group CPU and memory limits became a single resource share per group. See [Work groups](work-group-v2.md) for the current settings, defaults, and examples.
:::

## Old and new settings

| Old setting | Current setting | Current default |
| --- | --- | --- |
| `O2_SEARCH_GROUP_BASE_SPEED` | `O2_WORK_GROUP_BASE_SPEED` | `1024` (MB per second) |
| `O2_SEARCH_GROUP_BASE_SECS` | `O2_WORK_GROUP_BASE_SECS` | `10` (seconds) |
| `O2_SEARCH_GROUP_CPU_LIMIT_ENABLED` | `O2_WORK_GROUP_CPU_LIMIT_ENABLED` | `false` |
| `O2_SEARCH_GROUP_DYNAMIC_RESOURCE` | `O2_WORK_GROUP_DYNAMIC_RESOURCE` | `true` |
| `O2_SEARCH_GROUP_LONG_MAX_CPU`, `O2_SEARCH_GROUP_LONG_MAX_MEMORY` | `O2_WORK_GROUP_LONG_MAX_PERCENT` | `0.4` |
| `O2_SEARCH_GROUP_SHORT_MAX_CPU`, `O2_SEARCH_GROUP_SHORT_MAX_MEMORY` | `O2_WORK_GROUP_SHORT_MAX_PERCENT` | `0.8` |
| `O2_SEARCH_GROUP_LONG_MAX_CONCURRENCY` | `O2_WORK_GROUP_LONG_MAX_CONCURRENCY` | `5` |
| `O2_SEARCH_GROUP_SHORT_MAX_CONCURRENCY` | `O2_WORK_GROUP_SHORT_MAX_CONCURRENCY` | `10` |
| `O2_SEARCH_GROUP_USER_LONG_MAX_CONCURRENCY` | `O2_WORK_GROUP_USER_LONG_MAX_CONCURRENCY` | `2` |
| `O2_SEARCH_GROUP_USER_SHORT_MAX_CONCURRENCY` | `O2_WORK_GROUP_USER_SHORT_MAX_CONCURRENCY` | `4` |

The current model also adds background-group, per-organization, and slot-based admission settings. They are described in [Work groups](work-group-v2.md).
