---
title: Count SLOs
metaTitle: Count-based SLOs in OpenObserve | OpenObserve
description: "Create event-count SLOs in OpenObserve: define good events with a predicate, scope the denominator, and measure availability and success-rate objectives."
---

# Count SLOs

A count SLO measures **good events divided by total events**. It is the right
choice whenever your data has one row per unit of work — a request, a job, a
payment, a span — and you can write a predicate that says which of those rows
succeeded.

```
SLI = 100 × (rows in scope matching "good when") / (rows matching "scope")
```

With the form's single-query source, both numbers come from a **single scan** of
the same rows, so the numerator can never drift from the denominator. (The
API-only dual-query and PromQL sources trade that atomicity away — see the
metrics note below.)

![New SLO form configured as a count SLI, with scope, good-when predicate, and the good/bad events preview](../../../images/slo-count-form.png)

## When to use it

| Question | Count SLO? |
| --- | --- |
| What share of API requests did not return 5xx? | Yes |
| What share of background jobs finished successfully? | Yes |
| What share of payments were authorized? | Yes |
| Was p95 latency under 300 ms? | No — use a [time-slice SLO](time-slice-slos.md) |
| Was the disk-space alert quiet? | No — use an [alert-based SLO](alert-based-slos.md) |

The distinguishing test is whether "good" is a property of an individual row. If
you need to aggregate before you can say good or bad, you need a time-slice SLO.

## Configuration

Select **Count** as the SLI type, then fill in:

| Field | Required | Meaning |
| --- | --- | --- |
| **Stream type** | Yes | Logs or traces. See the note on metrics below. |
| **Stream** | Yes | The stream that holds the events. |
| **Scope** | No | A filter applied to the **denominator**. Leave empty to count all rows in the stream. |
| **Good when** | Yes | A boolean predicate over a single row. Rows in scope that satisfy it are the **numerator**. |

Both expressions are SQL fragments over the stream's fields — the same dialect
you use in the log search bar. The editor autocompletes field names and values
for the selected stream.

**Metrics streams are not usable from this form.** The form always submits a SQL
single-query source, and SQL cannot address a metrics stream, so the save is
rejected. Counting over metrics needs the PromQL count source, available through
the API only:

```json
"config": {
  "source": {
    "mode": "prom_ql",
    "query": {
      "good": "increase(http_requests_success_total[5m])",
      "total": "increase(http_requests_total[5m])"
    }
  }
}
```

Use range selectors matching the slice interval. Note that the two expressions
are evaluated separately, so this source has weaker atomicity than a
single-query one — the two evaluations cannot be proven to have seen the same
instant.

### Scope is the denominator

Scope is not cosmetic. It decides what the SLO is *about*.

```
Scope:     service_name = 'api-gateway' AND status_code IS NOT NULL
Good when: CAST(status_code AS INT) < 500
```

This measures "of the api-gateway rows that describe an HTTP response, what
fraction were not a server error". Rows without a `status_code` — health checks,
startup logs, anything that is not a request — are excluded from both sides
rather than silently counted as successes.

Dropping the `status_code IS NOT NULL` clause would put every api-gateway log
line in the denominator, and the SLI would mostly measure how chatty the service
is.

Leaving **Scope** blank means "all rows in the stream"; the form omits the field
rather than sending an empty string. If you are posting to the API directly,
omit `scope` entirely — an empty string is rejected as an empty predicate, not
read as "all rows".

### Good when

`Good when` is evaluated per row and must be a boolean expression. Some working
shapes:

```sql
-- HTTP success
CAST(status_code AS INT) < 500

-- explicit success flag
status = 'success'

-- successful and fast enough
status = 'success' AND CAST(duration_ms AS DOUBLE) < 1000

-- anything that is not a hard failure
severity NOT IN ('ERROR', 'FATAL')
```

Fields ingested as strings need an explicit cast before numeric comparison, as
in the examples above.

## Worked example

**Goal:** the API gateway should serve at least 94% of requests without a server
error, measured over a rolling 7 days.

| Setting | Value |
| --- | --- |
| SLI type | Count |
| Stream | `logs_default` (logs) |
| Scope | `service_name = 'api-gateway' AND status_code IS NOT NULL` |
| Good when | `CAST(status_code AS INT) < 500` |
| Target | 94% |
| Time window | 7 days |
| Slice interval | 5 minutes |
| Tags | `team:platform` |

Reading the result:

- **SLI 94.946%** — that is `good / total` over the last 7 days.
- **Error rate 5.054%** — `100 − SLI`.
- **Error budget 6%** — `100 − 94`, which over 7 days is about 10.1 hours.
- **Budget consumed 84.2%** — `5.054 / 6`.
- **Budget remaining 15.8%** — what is left.
- **Burn rate ×0.8** — below budget-neutral, so at this pace the SLO ends the
  window inside its budget.
- **Time to exhaust 8d 7h** — longer than the window, which is another way of
  saying the same thing.

![SLO detail page for the api-gateway availability count SLO](../../../images/slo-detail-trend.png)

## Choosing the slice interval

For a count SLO the slice interval **does not change the numbers**. The same
events are counted either way, because both `good` and `total` are sums.

Pick 5 minutes unless you have a reason not to: it stores a fifth as much
history for the same answer. Choose 1 minute only when you want finer resolution
in the burndown chart, or when you intend to attach burn-rate alerts with very
short windows — the short window must be at least two slices wide.

## Grouping

Set **Group by** to one or more fields to measure each distinct value
separately — for example `region`, or `service_name`, or `tenant_id`.

- Each group gets its own SLI, budget, and burn rate.
- An exact overall rollup is measured alongside the groups; it is not a sum of
  the truncated group list.
- Grouped SLOs are pinned to **5-minute slices**.
- The default cap is 500 groups per SLO. Exceeding it is reported as an
  overflow, not silently truncated, so pick a field with bounded cardinality.
  `region` is a good grouping key; `user_id` is not.

The **Cardinality estimate** field sizes the storage reservation. Twice the
estimate is reserved — with a floor of 64 groups and a ceiling at the hard cap —
to leave headroom for organic growth.

## Empty slices and low-traffic services

Two different situations look similar and are treated very differently.

**The query ran and found nothing.** For a count SLI that is a real observation
of zero traffic, so the slice is recorded as **measured with zero events**. It
does not lower coverage, and because it adds nothing to either the numerator or
the denominator, it does not move the SLI either.

**The query never ran, or failed.** That is a **gap**. It lowers coverage, and
once coverage drops below `ZO_SLO_MIN_COVERAGE` (default 0.9) the SLO reads as
**No data** and its alerts freeze.

This is the opposite of how a [time-slice SLO](time-slice-slos.md) treats an
empty period, and the difference is deliberate: counting events over an empty
period is well defined, computing a percentile over one is not.

There is still a low-traffic failure mode, but it is a different one. If the
**whole window** ends up covered with no events at all, the SLI is undefined —
zero divided by zero — and the SLO freezes with no data even though coverage
reads 100%. Traffic stopping entirely is usually the incident, not a recovery,
so the safe behaviour is to refuse to answer rather than to report either 0% or
100%.

If you are measuring something that legitimately goes quiet for long stretches,
model it as a [time-slice SLO](time-slice-slos.md) instead, which can be
configured to treat a proved-empty period as a failure.

## Next steps

- [Time-slice SLOs](time-slice-slos.md)
- [Alert-based SLOs](alert-based-slos.md)
- [Alerting on SLOs](slo-alerts.md)
