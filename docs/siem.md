# **Building a SIEM with OpenObserve**

OpenObserve can be transformed from a high-performance observability platform into a robust Security Information and Event Management (SIEM) solution. By leveraging its Petabyte-scale storage, powerful pipelines, enrichment tables, SQL capabilities, and native Incident Management, you can build a complete SOC (Security Operations Center) without the complexity of managing multiple disparate tools.

This guide outlines the architecture, data ingestion strategies, and detection engineering required to use OpenObserve as a SIEM.

## **1. High-Level Architecture**

OpenObserve acts as an all-in-one **Data Lake**, **Detection Engine**, and **Response Platform** in a modern SIEM architecture.

### **The Stack**

1. **Collection Layer (The Integrations):** Tools like **Vector**, **Fluent Bit**, or **Logstash** collect logs from API sources (M365, Dropbox, AWS) and Endpoints.  
2. **Normalization Layer:** Data is transformed using **OpenObserve Pipelines** (VRL) into a common schema immediately upon ingestion.  
3. **Threat Intelligence Layer:** Live logs are enriched in real-time against external feeds (ingested into **Enrichment Tables**) to add context and flag Indicators of Compromise (IOCs) before storage.  
4. **Storage & Search:** **OpenObserve** stores the data on object storage (S3/GCS/Azure Blob) and provides sub-second search.  
5. **Detection Layer:** OpenObserve **Alerts** run scheduled SQL queries to identify Threats.  
6. **Visualization Layer:** **Dashboards** provide real-time situational awareness, visual trend analysis, and compliance reporting for SOC analysts.  
7. **Response Layer:** Alerts automatically trigger **Incidents** within OpenObserve's native Incident Management module for triage, assignment, and state tracking.

## **2. Ingestion & Integrations**

To build a SIEM, you need to ingest security telemetry from "dozens" of sources. We recommend using **Vector** as a highly efficient log shipper. In this architecture, Vector acts as a "dumb pipe"—it simply polls the APIs and forwards the raw JSON to OpenObserve.

### **Example: Ingesting SaaS Logs (Microsoft 365 / Dropbox)**

**vector.toml Configuration Example:**

```toml
# Source: Pulling data from an HTTP source or File
[sources.office365_logs]
type = "file"
include = ["/var/log/microsoft/*.json"]

# Sink: Sending raw logs to OpenObserve
[sinks.openobserve]
type = "http"
inputs = ["office365_logs"]
# The URL path defines the stream name (e.g., 'security_raw')
uri = "https://api.openobserve.ai/api/default/security_raw/_json"
auth.strategy = "basic"
auth.user = "root@example.com"
auth.password = "YOUR_OPENOBSERVE_PASSWORD"
compression = "gzip"
encoding.codec = "json"
```

**Pro Tip:** By sending data to a `_raw` stream first, you ensure you never lose the original log. You can then use Pipelines to process and route it to clean streams.

## **3. The Golden Rule: Normalization (Pipelines & VRL)**

To run efficient rules, you **must** standardize your data. We recommend adopting the **Open Cybersecurity Schema Framework (OCSF)**, an open standard for security telemetry.

Since OpenObserve flattens JSON fields using **underscores**, you will map OCSF's dot-notation to underscore-notation.

OpenObserve uses **VRL (Vector Remap Language)** natively. You can create a function in the UI (Pipelines > Functions) to rename disparate fields into this Common Schema.

### **Recommended Schema (OCSF Adapted)**

| Concept | OCSF Field (Standard) | OpenObserve Field (Flattened) |
| :---- | :---- | :---- |
| **User** | actor.user.name | actor_user_name |
| **Source IP** | src_endpoint.ip | src_endpoint_ip |
| **Destination IP** | dst_endpoint.ip | dst_endpoint_ip |
| **Activity/Action** | activity_name | activity_name |
| **Status/Outcome** | status | status |
| **Device/Host** | device.hostname | device_hostname |

### **Example VRL Script**

*Paste this into the OpenObserve Pipeline Editor to normalize generic logs.*

```ruby
# 1. Parse JSON if the message is a string
if is_string(.message) {
    parsed, err = parse_json(.message)
    if err == null {
        . = merge(., parsed)
    }
}

# 2. Normalize User Identity (OCSF: actor.user.name)
if exists(.UserId) {
    .actor_user_name = .UserId
    del(.UserId)
} else if exists(.actor.email) {
    .actor_user_name = .actor.email
} else if exists(.user_principal_name) {
    .actor_user_name = .user_principal_name
}

# 3. Normalize IP Addresses (OCSF: src_endpoint.ip)
if exists(.ClientIP) {
    .src_endpoint_ip = .ClientIP
    del(.ClientIP)
} else if exists(.source_address) {
    .src_endpoint_ip = .source_address
}

# 4. Standardize Actions & Status (OCSF: activity_name / status)
if .Operation == "UserLoginFailed" {
    .activity_name = "Logon"
    .status = "Failure"
}
```

## **4. Enrichment: Integrating Threat Intel**

Raw logs often lack context. Is IP 1.2.3.4 a customer or a known botnet? OpenObserve allows you to use **Enrichment Tables** to correlate live logs with external Threat Intelligence.

Threat Intel feeds (such as lists of malicious IPs or domains) can be uploaded periodically as CSV files to OpenObserve. For detailed instructions on managing these tables, refer to the [Enrichment Tables Documentation](https://openobserve.ai/docs/user-guide/enrichment-tables/enrichment/).

There are two primary methods to utilize this data:

### **Method 1: Ingestion-Time Enrichment (Recommended)**

Ideally, you should enrich your logs **at the time of ingestion**. By using Pipelines to look up IPs in your enrichment table as logs arrive, you add context (e.g., threat_group, confidence_score) directly to the log record *before* it is stored.

* **Pros:** Search performance is faster (no expensive JOINs needed at query time), and the data is permanently tagged with the intelligence available at that moment
* **VRL Example:** Use the `get_enrichment_table_record` function in your pipeline to match the log's `.src_endpoint_ip` against the `ip` column in your uploaded `malicious_ips` table

```ruby
# Lookup src_endpoint_ip in the 'malicious_ips' table.
record, err = get_enrichment_table_record("malicious_ips", {"ip": .src_endpoint_ip})

# If a match is found (no error and record is not null), enrich the log
if err == null && record != null {
    .threat_group = record.threat_group
    .threat_confidence = record.confidence
    .is_malicious = true
}
```

### **Method 2: Query-Time Correlation (SQL Join)**

Alternatively, you can correlate logs dynamically using SQL JOINs. This method is ideal for **retrospective analysis**—for example, checking if an IP that was added to a blocklist *today* accessed your network *last week*. OpenObserve supports performing SQL JOINs directly against your Enrichment Tables.

**Note:** When performing a JOIN, you must prefix the enrichment table name with **enrich.**.

**Scenario:** Trigger an alert if any source IP in your firewall logs matches a known malicious IP in your threat table.

**SQL Query Example:**

```sql
SELECT
  l.src_endpoint_ip,
  l.device_hostname,
  t.threat_group,
  t.confidence,
  count(*) as events
FROM
  firewall_logs l
  INNER JOIN enrich.malicious_ips_table t ON l.src_endpoint_ip = t.ip
GROUP BY
  l.src_endpoint_ip,
  l.device_hostname,
  t.threat_group,
  t.confidence
```

### **Recommended Threat Intelligence Sources**

A SIEM is only as good as the intelligence you feed it. To detect threats effectively, you should ingest high-fidelity Indicators of Compromise (IOCs) such as malicious IPs, domains, and file hashes.

### **Open Source (Free)**

*Great for getting started and blocking high-volume "noisy" threats.*

* **AlienVault OTX (Open Threat Exchange):** One of the world's largest crowd-sourced threat intelligence communities. You can subscribe to specific "pulses" relevant to your industry.
* **Abuse.ch:** A gold standard for specific threat types.
  * **URLhaus:** Malicious URLs used for malware distribution.
  * **ThreatFox:** Detailed IOCs for botnets and ransomware.
* **MISP (Malware Information Sharing Platform):** While MISP is a platform, it provides access to hundreds of free feeds (CIRCL, etc.). You can run MISP alongside OpenObserve and export IOCs into OpenObserve Enrichment Tables.
* **CINS Army:** A high-fidelity list of IPs with poor reputation.

### **Commercial (Paid)**

*Recommended for sophisticated threat actor profiling, dark web monitoring, and lower false-positive rates.*

* **CrowdStrike Falcon Intelligence:** Highly rated for its integration of endpoint telemetry with threat data, offering excellent attribution of adversary groups.
* **Recorded Future:** Massive breadth of coverage, including dark web, social media, and technical sources. Their "Intelligence Graph" is excellent for contextualizing why an IP is bad.
* **Mandiant (Google Cloud):** Intelligence derived from frontline incident response. If Mandiant says it's bad, it is likely a confirmed breach.
* **GreyNoise:** *Unique Value.* Instead of telling you what is bad, GreyNoise tells you what is "internet background noise" (scanners, researchers). Use this to **filter out** alerts and reduce false positives.

## **5. Detection Engineering (Writing Rules)**

In OpenObserve, "Rules" are simply **Scheduled Alerts** running SQL queries. When these alerts trigger, they create an incident.

### **Type A: Threshold Detection**

*Detects when a volume of events exceeds a norm (e.g., Brute Force).*

**Scenario:** 10 Failed Logins in 5 minutes.

1. Navigate to **Alerts** > **Create Alert**.
2. **Query Type:** SQL
3. **SQL Query:**

```sql
SELECT
  "actor_user_name",
  "src_endpoint_ip",
  count(*) as fail_count
FROM
  security_audit_logs
WHERE
  "activity_name" = 'Logon'
  AND "status" = 'Failure'
GROUP BY
  "actor_user_name",
  "src_endpoint_ip"
HAVING
  count(*) > 10
```

**Note:** Field names are quoted when they contain special characters or match SQL keywords. System fields like `_timestamp` don't require quotes.

4. **Schedule:** Run every 5 minutes.

### **Type B: IOC Matching (Indicators of Compromise)**

*Detects known bad artifacts (IPs, Hashes).*

**Scenario:** Detect connection to a known malicious C2 IP.

1. **Query:**

```sql
SELECT
  *
FROM
  firewall_logs
WHERE
  "dst_endpoint_ip" IN ('103.1.2.3', '45.33.22.11', '192.0.2.1')
```

*(Note: For large lists of IOCs, use the Enrichment Table JOIN method described in the Enrichment section above).*

### **Type C: Behavioral/Sigma**

*Detects suspicious patterns based on process execution.*

**Scenario:** User running whoami (Reconnaissance).

1. **Query:**

```sql
SELECT
  _timestamp,
  "device_hostname",
  "process_cmd_line"
FROM
  windows_events
WHERE
  "process_name" = 'whoami.exe'
```

## **6. Converting Sigma Rules to SQL**

Most modern threat detection logic is shared in the **Sigma** format (YAML). Since OpenObserve uses SQL for alerts, you can convert these industry-standard rules to run on your data.

### **The Mapping Logic**

| Sigma Concept | OpenObserve SQL Equivalent (OCSF) |
| :---- | :---- |
| **Log Source** (product: `windows`) | FROM windows_stream |
| **Selection** (Image: `cmd.exe`) | WHERE process_name = 'cmd.exe' |
| **User** (User: `alice`) | WHERE actor_user_name = 'alice' |
| **Wildcards** (CommandLine: `evil`) | WHERE process_cmd_line LIKE '%evil%' |

### **Automation with Sigma CLI**

You can use the official sigma-cli to generate base SQL queries. While there is no direct "OpenObserve" target yet, the PostgreSQL target is 95% compatible.

1. **Install Sigma CLI:**

```bash
pip install sigma-cli
```

2. **Convert a Rule:**

```bash
sigma convert -t sql -p postgresql rules/windows/process_creation/proc_creation_win_whoami.yml
```

3. **Refine the Output:**
   The tool will generate standard SQL. You must manually update the **Table Name** (Stream) and **Field Names** to match your OCSF schema (e.g., changing image_path to process_file_path).

### **Example Conversion**

**Sigma Rule (Input):**

```yaml
detection:
  selection:
    Image|endswith: '\\whoami.exe'
  condition: selection
```

**OpenObserve SQL (Output):**

```sql
SELECT
  _timestamp, device_hostname, actor_user_name, message
FROM
  windows_events
WHERE
  process_file_path LIKE '%\\whoami.exe'
```

## **7. Incident Management (Triage & Response)**

OpenObserve closes the loop from detection to response with native Incident Management. Alerts are no longer just "fire-and-forget" notifications; they are stateful records that teams can collaborate on.

* **Lifecycle Tracking:** Every triggered rule creates an incident. Move incidents through states: New -> Investigating -> Resolved (or False Positive)
* **Assignment:** Assign incidents to specific analysts to ensure accountability
* **Evidence & Comments:** Analysts can add notes and attach query results directly to the incident record to document the investigation
* **Metrics:** Track Mean Time to Detect (MTTD) and Mean Time to Respond (MTTR) directly within the platform

## **8. Dashboards for Analysts**

A SIEM is not just for alerting; it is for investigation. You should create dashboards in OpenObserve to monitor key security metrics:

1. **User Activity:**
   * Bar Chart: Top Users by Failed Logins
   * Map: Geo-location of logins (using geoip functions)
   * Table: Administrative actions (User creation, Permission changes)
2. **Network/System Hygiene:**
   * Line Chart: Outbound Traffic Volume (Spikes may indicate data exfiltration)
   * Table: Top blocked firewall connections

## **9. Retention and Compliance**

One of OpenObserve's biggest strengths as a SIEM is cost-effective long-term retention via Object Storage (S3). OpenObserve automatically manages data lifecycle, ensuring that recent data is instantly accessible while older data is stored efficiently on object storage (S3/MinIO/GCS/Azure Blob) for compliance and historical analysis.

* **Unified Storage:** No manual tiering is required. OpenObserve transparently handles the movement of data to object storage, allowing you to query petabytes of historical data as easily as real-time logs
* **Compliance:** Retain data for 1 year (or any required compliance period) at the cost of S3 storage, significantly cheaper than block storage
* **Audit:** Use OpenObserve's built-in audit logs to track who queried the SIEM data to ensure chain of custody

## **Checklist for Production**

* [ ] **Data Source Map:** List all required sources (Dropbox, Endpoint, M365, Firewall)
* [ ] **Schema Definition:** Adopt OCSF and define `actor_user_name`, `src_endpoint_ip`, `activity_name`, etc
* [ ] **Pipeline Config:** Create VRL Functions in OpenObserve to map incoming logs to your OCSF Schema
* [ ] **Threat Intel:** Subscribe to at least 2 open source feeds (e.g., Abuse.ch + AlienVault) and ingest them into OpenObserve Enrichment Tables
* [ ] **Base Ruleset:** Implement the "Top 10" critical alerts (Brute force, Root login, Malware detected)
* [ ] **Incident Workflow:** Define your team's triage process (e.g., "All Critical incidents must be acknowledged within 30 minutes") and configure notification channels to alert on new incident creation
