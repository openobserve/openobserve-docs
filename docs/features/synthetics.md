---
description: >-
  Proactively monitor service availability and performance from global locations
  using OpenObserve Synthetic Monitoring — an enterprise feature with HTTP, API,
  browser, TCP, TLS, SSH, ping, and DNS checks.
---
# Synthetic Monitoring

Synthetic Monitoring lets you proactively check the availability and performance
of your services from probe locations around the world. Define checks that run
on a schedule, get alerted when something breaks, and view results and artifacts
— all within OpenObserve.

Synthetics is an **Enterprise** feature, gated behind the `O2_SYNTHETICS_ENABLED`
environment variable.

![TODO: screenshot of synthetic monitors list page](images/placeholder.png)

## Monitor types

You can create the following check types:

| Type       | Description |
|------------|-------------|
| **HTTP**   | Validate HTTP endpoints with configurable methods, headers, assertions, and SSL/TLS options. |
| **API**    | Multi-step API chains with request sequencing, payload validation, and SLA thresholds. |
| **Browser**| Record and replay real browser journeys (Chromium) with screenshot capture and HAR traces. |
| **TCP**    | Verify TCP port reachability on a target host. |
| **TLS**    | Validate TLS/SSL certificate expiry, chain validity, and hostname matching. |
| **SSH**    | Authenticate to SSH servers using password or key-based auth. |
| **Ping**   | Measure ICMP latency and packet loss to a target host. |
| **DNS**    | Check DNS record types and values from specific nameservers. |

![TODO: screenshot of create synthetic form showing monitor type selection](images/placeholder.png)

## Locations

Checks run from probe **locations** — regional endpoints hosted by OpenObserve
or private locations you deploy within your own network.

### Public locations

Public locations are OpenObserve-operated regional probes. They are visible to
every organization and support the full set of check types:

- HTTP, API, TCP, TLS, SSH, DNS, and Browser

Browser checks run via AWS Lambda in the probe's region. Protocol checks run
via Lambda when `O2_SYNTHETICS_NET_VENUE=lambda`, or are pulled by persistent
o2-hosted agents otherwise.

![TODO: screenshot of locations list showing public and private locations](images/placeholder.png)

### Private locations

Private locations let you run checks from inside your own infrastructure —
behind firewalls, in VPCs, or on-premises. Deploy a probe agent that registers
with OpenObserve, leases jobs, and reports results.

Private locations are scoped to a single organization. You create them via
the API or UI:

```json
{
  "kind": "private",
  "provider": "custom",
  "region": "dc-west",
  "label": "West DC Lab"
}
```

Location availability is computed from registered agents: a location without a
live agent (heartbeat within 120 seconds) shows zero live agents and its check
types reflect the union of all live agents' self-reported capabilities.

## Creating a synthetic

Navigate to **Synthetics** in the sidebar and click **New Synthetic**.

Every monitor requires:
- **Name** and optional description
- **Type** — one of the monitor types above
- **Target** — URL or `host:port`
- **Locations** — one or more probe locations
- **Frequency** — interval (seconds/minutes/hours/days/weeks/months) or a cron expression
- **Tags** — user-defined labels for filtering and grouping

![TODO: screenshot of create synthetic form filled for an HTTP check](images/placeholder.png)

### Type-specific configuration

Each monitor type carries its own config in the `config` field:

- **HTTP/API**: custom headers, request body, method, assertions, SSL options, request timeouts
- **Browser**: Playwright script steps, device emulation, session replay
- **TCP**: port, TLS upgrade option
- **TLS**: port, SNI hostname
- **SSH**: port, username, auth type (password/key)
- **Ping**: count, packet size
- **DNS**: record type, nameserver

### Authentication

You can attach credentials to a monitor. Supported auth types:

- **Basic** — username and password
- **Bearer** — token

All credentials are encrypted at rest with AES-256-SIV using your
organization's DEK. They are decrypted only at probe resolve time and
never leave the backend in API responses.

**Cookies** are also supported — set key-value cookies that the browser probe
injects before executing steps, independent of the auth type.

![TODO: screenshot of auth configuration section in create/edit form](images/placeholder.png)

### Variables

Define key-value variables that the probe substitutes into your check config
using `{{ VAR_NAME }}` placeholders. All variable values are encrypted at rest.
The **secure** toggle is a UI display hint only; encryption is unconditional.

## Browser monitoring

Browser checks run Playwright scripts on Chromium. For each check, you can
select one or more **browser engines** and **device viewports** (desktop,
tablet, mobile). The scheduler fans out one execution per engine+device
combination at each location.

![TODO: screenshot of browser monitor config with device/browser selection](images/placeholder.png)

### Screenshots and traces

The browser probe captures **screenshots** at each script step and a **HAR
trace** (`.zip`). Artifacts are uploaded to object storage. The UI retrieves
them via presigned URLs (in object-storage mode) or a proxy endpoint (in
local-disk mode).

![TODO: screenshot of run detail drawer showing screenshots](images/placeholder.png)

### Session replay

Enable **Session Replay** on a browser monitor to capture the full visual
recording of the browser session, available alongside screenshots in the
run detail.

## Scheduling and run lifecycle

### Frequency

Set the check frequency as an interval (e.g. every 5 minutes) or a **cron
expression** (e.g. `0 */2 * * * *` for every 2 minutes). Cron scheduling
respects the organization's configured timezone.

### How a run works

1. **Scheduler** (every 5s): picks due monitors, creates a `synthetics_runs`
   row, and enqueues one `synthetics_jobs` row per location. Browser checks
   include pre-generated `execution_id` values for each engine+device combo.
2. **Dispatcher** (every 2s): leases pending jobs from the queue and invokes
   AWS Lambda probes with the job payload.
3. **Probe**: calls `resolve` to fetch the full monitor config (with
   decrypted credentials), executes the check, posts results to the
   `synthetics_results` stream, and acks the job.
4. **Reaper** (every 30s): requeues expired leases, dead-letters jobs that
   exhausted retry attempts, and prunes stale pending checks.

### Manual runs

Click **Run Now** on a monitor to trigger an immediate run. The scheduler
resets `next_run_at` to 0 and fires within 5 seconds.

## Run history

Each scheduled execution produces a **run** — a batch of one or more jobs
(one per location). You view runs from the synthetic detail page.

A run can have these aggregate statuses:
- **Passed** — all locations reported up
- **Warning** — some locations reported a warning
- **Failed** — one or more locations reported down
- **Error** — an infrastructure error occurred (probe not responding,
  dispatch failure)
- **Pending** — some jobs are still in progress

![TODO: screenshot of run history list for a synthetic](images/placeholder.png)

## Alerting

Each synthetic can specify **destinations** — alert destinations that receive
notifications when a run completes with failures.

Configure these alerting controls:
- **Retries** — number of retry attempts before marking a check failed
- **Wait between retries** — seconds to wait between retry attempts
- **Alert if fails** — consecutive failures before triggering an alert
- **Cooldown** — minutes between repeated notifications

Note: Infrastructure-level failures (Lambda dispatch errors, probe timeouts)
are not sent to alert destinations — only end-to-end check failures are.

![TODO: screenshot of alerting configuration section in create/edit form](images/placeholder.png)

## Configuration

Synthetics is configured via environment variables:

| Variable | Default | Description |
|---|---|---|
| `O2_SYNTHETICS_ENABLED` | `false` | Master switch. When `false`, workers and routes are not registered. |
| `O2_SYNTHETICS_LAMBDA_BROWSER` | `o2-synthetics-browser-probe` | Lambda function name for browser checks. |
| `O2_SYNTHETICS_LAMBDA_NET` | `o2-synthetics-net-probe` | Lambda function name for protocol (net) checks. |
| `O2_SYNTHETICS_NET_VENUE` | `lambda` | Venue for protocol checks: `lambda` (dispatch via Lambda) or `agent` (lease-based agents). |
| `O2_SYNTHETICS_API_ENDPOINT` | (empty) | Public URL of the OpenObserve API, sent to probes as `JOBAPI_ENDPOINT`. |
| `O2_SYNTHETICS_LOCATIONS` | (empty) | Comma-separated enabled location IDs (e.g. `aws-us-east-1,aws-eu-west-1`). Falls back to default list when empty. |
| `O2_SYNTHETICS_BROWSERS` | `chromium` | Comma-separated browser engine names. |
| `O2_SYNTHETICS_DEVICES` | `desktop:1440:900,tablet:768:1024,mobile:375:667` | Comma-separated `id:width:height` device viewport triples. |

## RBAC

Synthetics integrate with OpenObserve's role-based access control via OpenFGA:
- **`synthetics`** type: per-monitor GET/PUT/DELETE/POST permissions inherited
  from the parent folder.
- **`synthetic_folder`** type: folder-level permissions that cascade to all
  monitors within.

Assign roles to control who can create, edit, delete, or run synthetics within
a given folder.
