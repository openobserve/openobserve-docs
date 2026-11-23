---
title: Threat Intel
metaTitle: Threat intelligence indicators in OpenObserve Security
description: "Store known-bad IPs, domains, URLs, hashes, and emails as threat-intel lists, import them from CSV or a feed, and sweep your sources for sightings."
---

# Threat Intel

**Threat Intel** holds known-bad indicators and shows every place they appeared in your security data. Open **Security** > **Threat Intel**.

## Lists and indicators

A threat-intel list is an [enrichment table](../data-processing/enrichment-tables/enrichment.md) whose name starts with `ioc_` or `threat_intel`. Lists you create in Security get the `ioc_` prefix automatically, and their names are lowercased with other characters replaced by `_`. Because they are enrichment tables, detections and VRL functions can use them too.

Lists added or imported from Security hold up to 5,000 indicators each. Feed lists and tables uploaded on the **Enrichment Tables** page can be larger, but only the first 10,000 rows of each list are read and swept. Lists have these columns: `indicator`, `type`, `severity`, `confidence`, `source`, `description`, `added_at`, and `expires_at`.

| Type | Examples |
| --- | --- |
| IP address | `185.220.101.47` |
| CIDR range | `10.0.0.0/8`. Kept on the list but not swept. |
| Domain | `evil.example` |
| URL | `https://evil.example/payload` |
| File hash | MD5, SHA-1, SHA-256, or SHA-512 |
| Email address | `attacker@evil.example` |

Defanged values such as `evil[.]com` and `hxxp://` are accepted and refanged.

Reading lists needs read access to Security and to enrichment tables. Adding, importing, or subscribing needs the Create permission on Security; removing an indicator needs both Create and Delete, because the list is written back. Each also needs the matching enrichment table access.

## Add indicators

Click **Add indicators** and paste values from a report, one per line or separated by commas, semicolons, or spaces. If you force a **Type**, values of other types are rejected.

| Field | Default |
| --- | --- |
| **List** | The first list that is not a feed, or `ioc_manual`. |
| **Type** | **Detect automatically**, or force one type. |
| **Severity** | High |
| **Confidence (0–100)** | 75 |
| **Source** | Empty. Enter the report, vendor, or feed name. |
| **Expires** | In 90 days. Choose never, or 7, 30, 90, or 365 days. |
| **Description** | Optional. |

OpenObserve validates the values first. One unrecognized value, or going over 5,000 indicators, blocks the whole add until you fix it; values already on the list are skipped. Added indicators are appended to the list.

## Import from CSV

Click **Import** > **CSV file**. The file needs an indicator column named `indicator`, `ioc`, or `value`; `severity`, `confidence`, `source`, `description`, `added_at`, and `expires_at` are optional. Files can be up to 5 MB.

- **List** defaults to `ioc_imported`.
- **Severity for rows without one** defaults to medium. Rows without a confidence get 50.
- **Add to the list instead of replacing it** is on by default. Turn it off to replace the list entirely, including its columns and settings.

Rows that are not indicators are skipped and counted. The CSV's `type` column is ignored and each type is detected from the value; unrecognized severities become medium. **Source** defaults to the file name. A file that would take the list past 5,000 indicators is refused, and you cannot import into a feed list.

## Subscribe to a feed

Click **Import** > **Feed URL** and enter the `http://` or `https://` URL of a public CSV with an indicator column. **List** defaults to `ioc_feed`. OpenObserve downloads the CSV in the background; indicators appear once the download finishes. Rows get medium severity and confidence 50 unless the CSV sets them. Private and loopback URLs are refused. You cannot add indicators to a feed list by hand, and a list filled from a file cannot become a feed, or the other way round.

## Sweep for sightings

A sweep searches your security sources for every live indicator. It runs when you open the page, when you change the range (**24h**, **7d** (default), or **30d**), after you add, import, or remove indicators, and when you click **Run sweep**. There is no scheduled sweep, and **Run sweep** is disabled when there are no live indicators.

- Expired indicators and CIDR ranges are not swept.
- Each type is searched in columns named for it (for example email-like columns for emails), in the source's mapped IP and user columns, in known vendor columns, and in free-text columns such as `message`, `log`, `raw`, and `commandline`. Each column is matched on its whole value and on whole tokens inside it, ignoring case. Domains also match their subdomains.
- Only security sources you can read are searched.
- Each query checks a batch of up to 250 indicators of one type against one source, and a sweep runs at most 200 queries, so the more sources you have, the fewer indicators fit. Indicators are checked most severe and most confident first, so if the limit is reached, the least severe ones are left out, and the page says so.

### Tabs

| Tab | Shows |
| --- | --- |
| **Matches** (default) | Each indicator that was seen, with its type, severity, number of sightings, where it was seen (stream and column), and when. |
| **Indicators** | Every indicator on every list, with confidence, source, and expiry. Click **Expiring** to see indicators that expired or expire within 7 days. |
| **Coverage** | What the sweep searched: for each indicator type, how many columns were searched and which were not. A type with no matching column cannot be sighted at all. |

Click an indicator to see its sightings over time and per stream and column. **Hunt** opens [Events](events.md) on that stream filtered to the indicator.

## Remove an indicator

Open the indicator and click **Remove** (needs the Create and Delete permissions on Security). OpenObserve reads the list and writes it back without the indicator. This is not atomic, so avoid removing indicators while someone else edits the same list. Indicators on a feed list must be removed at the feed. Lists larger than 10,000 rows must be edited on the **Enrichment Tables** page.
