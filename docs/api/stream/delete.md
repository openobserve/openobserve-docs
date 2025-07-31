---
description: >-
  Delete OpenObserve streams via API. Deletion is async and handled by the
  compactor. Configure auto-deletion with data retention environment settings.
---
# Delete stream

Endpoint: `DELETE /api/{organization}/streams/{stream}?type={StreamType}`

## Request

- type: logs / metrics / traces

	default is `logs`.

## Response

```json
{
	"code": 200,
	"message": "stream deleted"
}
```

The data delete is an asynchronous operation. it will delete by `Compactor`. 

> it will execute by an interval `10 minutes` as default. So maybe the data will delete after 30 minutes. You don't need to wait it done, you can confirm the delete result hours later.

You can change the `compactor` run interval by an environment:

```
ZO_COMPACT_INTERVAL=600
```

Unit is second. default is `10 minutes`.


## Data lifecycle

You can configure data life cycle to auto delete old data. it is a awesome feature.

To enable this feature, you just need to add an environment:

```
ZO_COMPACT_DATA_RETENTION_DAYS=30
```

The value have to greater than `0`, and it is means how many days you want to keep data. it will auto delete the data older than `N` days.
