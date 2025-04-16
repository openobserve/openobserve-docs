# Audit Trail

> **Note:** This feature is available aplicable to Enterprise Edition.

Audit trail is available in enterprise edition and can be enabled by setting the environment variable `O2_AUDIT_ENABLED=true` . This will capture details of all the APIs made and push it to audit stream in `_meta` org.

![audit trail screenshot](../../images/audit.webp)

All API calls except ingestion are logged that allow for understanding each and every activiity within OpenObserve. Since the data is in a regular log stream, you can build dashboard for analytics as well as build alerts if yuou need them
