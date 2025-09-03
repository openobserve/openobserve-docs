---
description: >-
  Ensure your S3 config is valid in OpenObserve to prevent silent
  failures—startup halts on misconfig to protect data integrity.
---
## Ensure the S3 Configuration is Correct
To avoid silent failures during data ingestion and storage, OpenObserve validates your S3 configuration before starting. 

## Why This Is Important 
If the S3 configuration is incorrect, validation fails and application stops immediately. An error is reported with details about the configuration issue.

This behavior ensures that users are made aware of critical storage misconfigurations before the system begins processing data.

**If you are using S3 as your object storage:**

- Ensure that all required environment variables and credentials are set correctly.
- Verify bucket access, permissions, and endpoint configuration.
- Start OpenObserve only after confirming the configuration is valid.
