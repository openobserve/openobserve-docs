---
title: Ensure the S3 Configuration is Correct
description: Ensure your S3 config is valid in OpenObserve to prevent silent failures—startup halts on misconfig to protect data integrity.
---

## Ensure the S3 Configuration is Correct
To avoid silent failures during data ingestion and storage, OpenObserve tests your object storage configuration at startup. When remote object storage is configured (anything other than local disk), it reads and then writes a small test file in the bucket.

## Why This Is Important 
If the S3 configuration is incorrect, or the bucket cannot be read from or written to, the test fails and OpenObserve stops immediately. The error message names the failed step (`S3 download test failed` or `S3 upload test failed`) with the cause.

This behavior ensures that users are made aware of critical storage misconfigurations before the system begins processing data.

**If you are using S3 as your object storage:**

- Ensure that all required environment variables and credentials are set correctly.
- Verify bucket access, permissions, and endpoint configuration.
- Start OpenObserve only after confirming the configuration is valid.
