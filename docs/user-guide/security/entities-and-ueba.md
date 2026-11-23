---
title: Entities and UEBA
metaTitle: Entities, risk graph, and UEBA in OpenObserve Security
description: "See every user, IP address, and host your security sources mention, rank them on a risk graph, and score users against their own baseline."
---

# Entities and UEBA

**Entities** and **UEBA** look at your security data by who and what is involved, rather than by event. Both read every security source and match users, IP addresses, and hosts by each source's own columns.

## Entities

**Entities** lists every user, source IP address, and host your security sources mention. Open **Security** > **Entities** and pick **Users**, **IP addresses**, or **Hosts**. Choose a window of **1h**, **24h** (default), or **7d**.

Signals flag entities worth a look. **High failure rate**, **Many source IPs** or **Many users**, and **Public address** (IP addresses only) have tiles you can click to filter:

| Signal | Raised when |
| --- | --- |
| **High failure rate** | At least 20% of the entity's events failed, with at least 5 failures. Only sources that report an outcome count. |
| **Many source IPs** (users) / **Many users** (IPs and hosts) | The entity has at least 5 counterparts in one source, at least 3× the median across entities of that kind, and at least 4 median absolute deviations above it. |
| **Public address** | The IP address is not in a private, loopback, link-local, carrier-grade NAT, documentation, benchmarking, multicast, or reserved range, or an IPv6 unique-local address. |
| **Success after failures** | At least 5 failed events, then a success. |
| **Open case** | An open Security case names the entity. |

The table shows events, failures (as a count and a share), the most counterparts in one source, which sources mention the entity, and when it was first and last seen. User entities group spellings of the same account, such as `ACME\dave` and `dave@acme.local`. Only addresses on private domain suffixes (`.local`, `.lan`, `.corp`, `.internal`, `.intranet`, `.ad`, `.localdomain`, `.home`) merge; `dave@acme.com` stays separate.

Each source returns 500 entities per kind, those with the most failures first, then the busiest. Counts near that cut-off may be partial, and tab counts that were cut off end in `+`. For streams with more than about 50 million rows in the window, only the last hour is read by default; click **Run full window** to read all of it.

### Entity details

Click an entity to see:

- **Activity**: events over time, split into **Succeeded or unknown** and **Failed**.
- **Related**: the top 10 entities of the other two kinds that appeared with it.
- **Sources**: each source and column it was seen in, with **Open in Events**.
- **Cases**: Security cases that name it.

**Hunt in Events** searches every security source for the entity, including its other spellings. For a user, the bare account name under any domain matches, which can include other people with the same name.

### Risk graph

Switch to **Risk graph** to see users, IP addresses, and hosts linked by shared events (solid lines) or shared cases (dashed lines), ranked by risk. The graph shows up to 40 entities.

An entity's risk score, from 0 to 100, adds up:

- **Cases naming it**: P1 40 points, P2 30, P3 20, P4 10, up to 70 in total. Open and closed cases active in the window count, from the 200 most recent.
- **Failed events**: up to 30 points, by failure share, once the entity has at least 5 failures.
- **Neighbours**: a quarter of the case points of the directly linked entity with the most case points, up to 15 points.

Hover over a score to see its breakdown. Click a node to open that entity.

## UEBA

**User Behavior Analytics** compares each user with their own recent past. Open **Security** > **UEBA** and pick a window. The current window is compared with a longer baseline before it:

| Window | Compared with the prior |
| --- | --- |
| **1h** | 24 hours |
| **24h** (default) | 7 days |
| **7d** | 30 days |

Each user gets a risk score from 0 to 100: the sum of the weights of the signals they raised, capped at 100. Scores of 60 or more are **Critical risk**, 40 or more **High**, 20 or more **Medium**, and anything above 0 low. Click the risk tiles to filter.

| Signal | Weight | Raised when |
| --- | --- | --- |
| **Volume spike** | 30 | At least 20 events, at least 3× the user's usual volume, and statistically significant (z-score of 3 or more). The 1h window compares the same hours of the day. |
| **New source IP** | 20 (30 if any new IP is public) | An IP address not seen in the baseline, with at least 3 events. While the baseline is building, only public addresses are flagged. |
| **Failures jumped** | 25 | At least 5 failures, at least 30% of events, and at least 20 points above the user's baseline. |
| **Unusual hours** | 15 | At least 3 events in hours of the day the user never used in the baseline. Needs at least 20 baseline events, and history covering 90% of the baseline or two days, whichever is shorter. |
| **First seen** | 20 | A user with at least 5 events and no activity in the baseline. |
| **Far above peers** | 25 | While the user's baseline is still building: at least 20 events and at least 5× the median user. |
| **Failures far above peers** | 30 | While the user's baseline is still building: at least 10 failures and a failure rate of 50% or more, far above other users. |
| **Success after failures** | 40 | At least 5 failures, then a success, from the same IP address. |
| **Open case** | Case points | An unresolved Security case names the user. |

Every flag shows the numbers that raised it. Users without enough history are marked **Baseline building**. Volume and failure jumps are still judged against their scaled history, and they are also compared with other users.

Click a user to see:

- **Signals**: each signal, why it fired, and its weight.
- **Active hours**: the hours of the day (UTC) the user was active, in the baseline and now.
- **Source IPs**: each IP address, marked **New** or **Public address**.

**Open entity** opens the user in Entities, and **Hunt in Events** searches every source for them.

UEBA needs at least one security source with a user column, such as CloudTrail, Okta, or an authentication log. On streams with more than about 50 million rows, only the last hour is read by default, and **First seen**, **New source IP**, and **Unusual hours** are not evaluated. Signals are withheld when baseline data comes back incomplete, and the page says which.
