---
description: >-
  Configure OpenObserve behind an NGINX reverse proxy using /logs path and set
  ZO_BASE_URI=/logs to align with the proxy route.
---
# OpenObserve behind a nginx reverse proxy

## Set nginx proxy

```
location /logs/ {
    proxy_pass http://127.0.0.1:5080;
}
```

## Set ENV for OpenObserve

```
ZO_BASE_URI = "/logs"
```
