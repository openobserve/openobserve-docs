---
title: Security
description: "OpenObserve's built-in SIEM: hunt security events, run Sigma detections, triage alerts and cases, and track entities, threat intel, and user behavior."
---

# Security

The Security solution is OpenObserve's built-in SIEM. It normalizes your security logs to OCSF, runs Sigma rules as scheduled detections, and rolls the firings into triageable cases. Switch to it any time with the **Solution** switcher in the header, which toggles between **Observability** and **Security**.

## Enable

Security is an Enterprise feature, available on enterprise builds. Pick **Security** in the header's **Solution** switcher; the solution rail then shows **Overview**, **Events**, **Detections**, **Alerts**, **Cases**, **Entities**, **Threat Intel**, **UEBA**, **MITRE ATT&CK**, and **Content**.

## Overview

The **SOC Overview** landing page summarizes the state of your monitoring: critical and high firings, open cases, detections firing, silent sources, and active detections. Below the stats it shows a detection-activity chart, the triage queue (latest firings, newest first), your noisiest detections, **MITRE ATT&CK coverage**, and **Log source health**. Click a source to jump into **Events**.

## Events

**Security Events** is where you hunt. Pick a stream; streams whose name looks like security data are identified automatically and mapped onto OCSF columns. Add filters in the **Builder**, or switch to **SQL** to write a query. Results show a timeline and a severity breakdown. Open a record to see its **Overview**, **Detections**, **Fields**, and **JSON**.

## Detections

A detection is a Sigma rule compiled to SQL and scheduled as an alert over a security stream. Click **New detection** to write Sigma or pick from the rule library, then choose the stream, set the look-back and run-every minutes, and pick a notification destination. The page lists each detection's schedule, last run, and firings in the last 24 hours; toggle **Enable**/**Disable**, or open the **Sigma rule** and **Query** tabs.

## Alerts

**Alerts** lists every firing with the evidence behind it. Each row shows the detection, outcome, matched value, window, and when it fired and evaluated. Open one for **Overview**, **Evidence**, **Detection**, and **Raw** tabs, or click **Investigate in Events** to hunt in the same window.

## Cases

Cases correlate firings that happen together and triage them to a verdict. A case opens automatically when related detections fire together; move it through **New**, **Investigating**, and **Closed**, set its priority, assign an analyst, and add notes. The **Analysis** tab gives an AI summary of what connects the firings.

## Entities

**Entities** lists the users, IP addresses, and hosts your sources mention, with signals such as a high failure rate, many source IPs, or a public address. Switch to the **Risk graph** view to see entities ranked by risk.

## Threat Intel

**Threat Intel** holds known-bad indicators (IP, CIDR, domain, URL, file hash, or email) as enrichment tables and sweeps them against your security sources. Use **Add indicators** to paste values, **Import** a CSV, or subscribe to a feed URL, then click **Run sweep**. The **Matches** tab lists every sighting; **Coverage** shows which columns were searched.

## UEBA

**User Behavior Analytics** compares each user with their own recent past and flags risk signals — a volume spike, a new source IP, a jump in failures, unusual hours, or a first sighting — with a risk score out of 100.

## MITRE ATT&CK

**MITRE ATT&CK** maps which techniques your enabled detections cover and which fired in the selected window, so you can spot coverage gaps.

## Content

**Content** lists the Sigma rules and log sources that ship with the SIEM, matched against your own streams. A rule marked **Ready to install** or **Found in your data** can be installed as a detection; open a log source to see its field mapping and which rules target it.

## Data sources and OCSF

Security telemetry is identified and normalized automatically, and a built-in OCSF entity pack can normalize a stream at ingest. The **Data Sources** page lets you **Attach pack** to a stream — creating a VRL function and a realtime pipeline — or include the stream as a source as-is.
