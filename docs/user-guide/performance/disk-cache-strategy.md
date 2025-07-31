---
description: >-
  Configure how OpenObserve evicts cached files on disk using LRU, FIFO, or
  time-based LRU strategies via the ZO_DISK_CACHE_STRATEGY setting.
---
## Configure Disk Cache Eviction Strategy
OpenObserve allows you to configure how cached files on disk are evicted when the cache reaches its size limit. The eviction behavior is controlled by the `ZO_DISK_CACHE_STRATEGY` environment variable.

Set the disk cache eviction strategy using:
```
ZO_DISK_CACHE_STRATEGY=<strategy_name>
```

## Supported Values

### `lru`  or Least Recently Used (**Default**)

- **How it works**: Evicts the file that has not been accessed for the longest time.
- **Use when**: You want frequently accessed data to stay in cache longer, regardless of when it was added.
- **Behavior**:

    - Tracks access times.
    - Keeps recently used files in the cache.
    - Removes the oldest or the least accessed entries first.

### `fifo` or First In, First Out

- **How it works**: Evicts the oldest cached files in the order they were added, without considering how often they are used.
- **Use when**: You want a simple time-based cache cleanup that clears files strictly in order of arrival.
- **Behavior**:

    - Ignores access frequency.
    - Clears files in the same order they were cached.

### `time_lru` or Time-Grouped Least Recently Used

- **How it works**: Groups cached files by time windows such as hourly, then applies least recently used or LRU eviction within those windows.
- **Use when**: You need time-aligned cache control while still preserving frequently accessed files.
- **Behavior**:

- Groups files using time-based keys. For example, 2025040806.
- Evicts from the oldest time group first. Within that group, it removes the least recently accessed file.

