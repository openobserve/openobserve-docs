---
title: Concepts
description: "Learn core OpenObserve concepts: organizations, streams, users, functions, ingestion, and search. Understand roles, partitioning, and timestamp handling."
---

# Concepts

## Organizations

An organization is a logical entity which groups various streams, users, functions in OpenObserve. An organization can represent an enterprise, a department of an enterprise, or an application. All streams, users, functions, etc. are scoped to an organization.

## Streams

A stream in OpenObserve is a sequence of events (logs, metrics, traces) that share the same source, e.g. logs from a specific application or logs from an enterprise.

## Data Ingestion

### Data Partitioning

Data ingested in OpenObserve is partitioned by default based on year month day & hour. You can additionally specify partitioning keys which will be used to partition data.

## Logs

Log is a type of stream, which caters to log events from applications.

## Users

> Applicable to cloud version

Users are individuals using the application by logging in with appropriate credentials. As of today we support Google as social account for login. One can also sign up by providing valid email.

### User Roles

In the open-source edition, users added to an organization get the `Admin` role; the `Root` user is created at first start. Enterprise and Cloud with RBAC enabled add the `Editor`, `Viewer`, and `User` roles, plus custom roles. See [Role-Based Access Control](account-administration/identity-and-access-management/role-based-access-control.md).

Only users with the `Admin` (or `Root`) role can add other users to an organization.

## Functions

Functions in OpenObserve can be used during ingestion & query to aid advanced capabilities like enrichment, redaction, log reduction, compliance, etc. A function is defined using a VRL script (JavaScript functions are also available on Enterprise and Cloud).

## Timestamp

`_timestamp` is considered as timestamp column in OpenObserve, if `_timestamp` or `@timestamp` isn't present in data being ingested, we add `_timestamp` to each record with the value of `NOW` up to microsecond precision.

For input data with key as `_timestamp`/`@timestamp`, for the value we support the following data types/format:

- microseconds
- string value
- RFC 3339 and ISO 8601 date and time string such as "1996-12-19T16:39:57-08:00"
- RFC 2822 date and time string such as "Tue, 1 Jul 2003 10:52:37 +0200"

> Applicable only to open source version

## Searching

### Full text search

For full text search user can use query in-built query functions `match_all`, please note user can restrict full text search to specific fields/columns by setting their index type to **Full text search** on the **Schema Settings** tab of the stream details.

If user enabled `Inverted Index`, this function will auto use `Inverted Index` for `Full text search`.
