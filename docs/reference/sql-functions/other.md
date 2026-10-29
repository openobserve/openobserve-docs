---
title: Other SQL Functions
metaTitle: Profiling and VRL SQL Functions | OpenObserve
description: "Call your saved VRL functions from SQL in OpenObserve, and fold unsymbolized native frames in profiling stacks with fold_native_frames."
---

## Function index

| Function | Purpose |
|---|---|
| [VRL functions](#vrl-functions-in-sql) | Call a VRL function saved in your organization as a SQL function |
| [`fold_native_frames`](#fold_native_frames) | Collapse unsymbolized frames of one binary in a profiling stack |

## VRL functions in SQL

**Syntax**: `<function_name>(field[, field2, ...])`

**Description**:

- Every VRL function saved in **Pipelines** > **Functions** of your organization is also available as a SQL function with the same name.
- Each argument is passed to the VRL program as a string, bound to the function's parameter names in order. Functions created in the UI have one parameter, `row`, so the value is available as `.row`.
- The value of the program's last expression is returned as a string.

**Example**:

Save a VRL function named `mask_email` with this body:
```text
replace(.row, r'[^@\s]+@', "***@")
```
Then call it in a query:
```sql
SELECT _timestamp, mask_email(log) AS log_masked FROM "docs_sql_examples" WHERE str_match(log, '@')
```
`log_masked` shows `login ok for ***@doe.com` for a log line `login ok for john@doe.com`.

:::note[Gotchas]
- Arguments and the result are always strings. Cast the result, for example `CAST(my_fn(x) AS BIGINT)`, before numeric comparisons.
- When the program fails or returns `null`, the result is an empty string, not `NULL`.
- The VRL program is compiled for every row, so these calls are much slower than built-in functions. Filter the rows first.
- A saved function with the same name as a built-in function replaces the built-in function in your organization's queries.
- Only VRL functions work this way. A JavaScript function called from SQL returns empty strings.
:::

## `fold_native_frames`

**Syntax**: `fold_native_frames(stack)`

**Description**:

- Takes a profiling stack, frames separated by `;`, and replaces each run of consecutive unsymbolized frames from the same binary with `[binary]`.
- An unsymbolized frame is a raw address such as `libc.so.6@aa11+0x1a/native` or `0xff`. A frame with no binary name becomes `[unknown]`.
- Stacks without raw addresses are returned unchanged.
- The Profiles page uses this function when it merges stacks, so that one binary's many addresses count as one frame.

**Example**:
```sql
SELECT fold_native_frames(stack) AS stack, SUM(value) AS value FROM "profiles" WHERE stack IS NOT NULL GROUP BY fold_native_frames(stack) ORDER BY value DESC LIMIT 20
```
The stack `main;libc.so.6@aa11+0x1a/native;libc.so.6@aa11+0x2b/native;handler;libssl.so+0x99` becomes `main;[libc.so.6];handler;[libssl.so]`.

:::note[Gotchas]
- Replace `"profiles"` with the name of your profile stream.
- Only consecutive frames are folded: `libc.so.6+0x1;cb;libc.so.6+0x2` becomes `[libc.so.6];cb;[libc.so.6]`.
:::

## Next steps

- [SQL functions reference](index.md): full list of functions you can use in queries.
- [Functions](../../user-guide/data-processing/functions/functions-in-openobserve.md): write and test VRL functions.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
