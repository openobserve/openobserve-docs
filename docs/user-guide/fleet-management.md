---
title: Fleet Management
description: "Manage OpenTelemetry collector fleets: enroll with tokens, distribute versioned configs, and roll out changes with health gates and rollback."
---

# Fleet Management

Fleet Management lets you manage fleets of OpenTelemetry collectors from one console over the OpAMP protocol. Enroll collectors with tokens, track their health and version, distribute versioned collector configurations, and roll changes out in phases with health gates and automatic rollback.

## Enable

Fleet Management is an Enterprise feature and is on by default. Set `O2_FLEET_ENABLED=false` to turn it off; reads still work, writes are refused, and the OpAMP endpoint answers `503`. `O2_OPAMP_ENABLED` remains as an alias.

## Enroll collectors

A collector joins through an enrollment token. The token's plaintext (`o2ft_...`) is shown only once, at creation — store it somewhere secure.

1. In **Fleet Management**, create a **token**.
2. Set its **name**, the **fleet** the collector joins, and optional **expiry** and **max uses**.
3. Copy the **install command** and run it on the collector host.

Revoke a token to stop it from enrolling new collectors.

![TODO: screenshot of the enroll collector dialog with the install command](images/placeholder.png)

## Fleets

A **fleet** groups collectors that share a configuration. Every org starts with a **default** fleet; create more to stage changes or split environments. Move collectors between fleets to re-assign their configuration. Delete a fleet only after moving out its collectors and revoking its tokens.

## Collectors

The **Collectors** list shows every enrolled collector with its **status** (online, offline, degraded, unknown), **version** (flagging anything behind the target version), host, OS/architecture, and fleet. Open a collector to see its capabilities, component health, effective configuration, delivery evidence, and event history. From the detail drawer you can **rename**, **restart**, **redeliver** its configuration, or **delete** it.

![TODO: screenshot of the fleet collectors list](images/placeholder.png)

![TODO: screenshot of the collector detail drawer showing health and history](images/placeholder.png)

## Configurations

Configurations are versioned YAML collector configs. Create a config, edit the YAML, and **validate** it before publishing; a config with validation errors cannot be published. Publishing a version makes it available to fleets. The **restricted components** list in settings blocks component types you do not want used.

![TODO: screenshot of the fleet configuration editor](images/placeholder.png)

A visual editor shows the pipeline as nodes — receivers, processors, and exporters — and lets you add components and pipelines without editing YAML directly.

![TODO: screenshot of the visual pipeline editor canvas](images/placeholder.png)

## Rollouts

A **rollout** assigns a configuration version to a fleet. Choose whether it starts **immediately** or **at a scheduled time**, and a **batching** plan:

- **Canary** — a small first phase, then the remainder.
- **Progressive** — an initial batch that grows by a multiplier, capped at a maximum.

The rollout converges phase by phase, pausing at **health gates**; offline collectors are left out at the start. If a rollout shows evidence of harm it **halts** with a class:

- **proven_bad** — collectors rejected the config.
- **looks_worse** — the health gate failed.
- **cannot_see** — no data, a timeout, or collectors offline.

Roll a halted rollout back manually, or let it **auto-rollback**, which is pre-authorized for `proven_bad` and `looks_worse`.

![TODO: screenshot of the new rollout dialog with batching options](images/placeholder.png)

![TODO: screenshot of a rollout showing phases and a halt status](images/placeholder.png)

## Settings

Set the org **target collector version** — collectors on an older version are flagged outdated. Per fleet, tune the **heartbeat interval**, **offline threshold**, **offline ratio**, and **phase timeout**, which drive when a collector is considered offline and how rollouts proceed.

## Audit trail

Every fleet action — tokens, configurations, rollouts, and collector actions — is written to the audit stream. Review it from the **Audit** tab.

## Permissions

RBAC is enforced through `fleets` (per fleet) and `fleet_configs` / `fleet_management` (org level). Grant users only the fleets they should see; the collectors, configurations, and tokens under a fleet follow the fleet grant.
