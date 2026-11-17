---
title: Streams in OpenObserve
description: Streams in OpenObserve define how logs, metrics, and traces are ingested, stored, and queried—essential for data processing, retention, and access control.
---

Streams define how observability data is ingested, stored, indexed, and queried in OpenObserve. This guide introduces key concepts related to streams and explains how to create and use them.

## What is a stream?

A stream is a logical container that holds one type of observability data, such as logs, metrics, or traces. It is the required entry point for data ingestion in OpenObserve. Every log, metric, or trace must be associated with a stream at the time of ingestion.

:::note[Note]
Each stream has the following characteristics:

- It belongs to an organization.  
- It has a unique name.  
- It stores only one type of data such as logs, metrics, and traces.
:::

## Access

::::tabs
:::tab[Cloud]
- The **New stream** button is present by default on the **Streams** page.
- Users can create streams without enabling any configuration.
- During stream creation, the Fields section is optional.
- If you do not define any fields, OpenObserve will automatically detect them from the data you ingest. These detected fields will appear under **All Fields** in the Stream Details page.
:::
:::tab[Self-hosted]
- By default, the **New stream** button is not visible on the **Streams** page.
- To enable the **New stream** button, set the following environment variable to `true`: <br>
    `ZO_ALLOW_USER_DEFINED_SCHEMAS`
- After enabling the variable:

    - The **New stream** button becomes visible.
    - During stream creation, the **Fields** section is optional. The fields you add form the user-defined schema for the stream.
:::
::::

## Permission

### OpenObserve Cloud or the Enterprise Edition with Role Based Access Control (RBAC)

If RBAC is enabled in OpenObserve Cloud and the enterprise edition:

- **Root:** Full access to all streams across all organizations.  
- **Admin** and **Editor:** Can view, create, update, and delete streams within their organization.  
- **Viewer:** Can view streams. Cannot create, update, or delete streams.  
- **User:** Cannot view, create, or modify streams.  
- **Custom roles**: A user or service account with custom roles can create and manage streams if the required permissions are granted using RBAC.
> Learn more about [OpenObserve Cloud](https://cloud.openobserve.ai/) and the [Enterprise Edition](https://openobserve.ai/docs/enterprise-setup/). 

## Create a Stream in OpenObserve

### Prerequisite

- You have set up OpenObserve using [OpenObserve Cloud](https://cloud.openobserve.ai/) or the [self hosted](https://openobserve.ai/docs/getting-started/) option.   
- You have created the organization where you plan to create the stream.
- For self-hosted deployment, ensure that the `ZO_ALLOW_USER_DEFINED_SCHEMAS` environment variable is enabled. 

The following steps vary for **Cloud** and **Self-hosted** deployment: 
> If RBAC is enabled, ensure that you have required permissions to create streams.  

::::tabs
:::tab[Create Streams in OpenObserve Cloud]
### Create streams in OpenObserve Cloud

1. Select the organization from the top navigation bar.   
2. From the left navigation menu, select **Streams**.  
3. Click **New stream**.   
4. In the **New stream** dialog: 

    - Enter a unique stream **Name**. Use letters, numbers, underscores and colons only.   
    - Select the **Stream Type**.  
    - Specify the **Data Retention** in days. For example, enter 14 to keep data for 14 days after ingestion. When the period ends, OpenObserve removes the data automatically.  
        To keep data longer, select **Extended Retention** in the Stream Details sidebar.  
    - (Optional) In the **Fields** section, click **Add Field** to define fields for your stream:
        - **Field Name**: Name of the field
        - **Data Type**: Select Utf8, Int64, Uint64, Float64, or Boolean
        - **Index Type**: Choose an indexing strategy (Full text search, Secondary index, Bloom filter, KeyValue partition, Prefix partition, or Hash partition with 8 to 128 buckets) <br>
        For detailed information about each field type and index strategy, see [Field and Index Types in Streams](data-type-and-index-type-in-streams.md)

    These fields create a User Defined Schema. Learn more about [user defined schema](schema-settings.md#user-defined-schema-uds).    
5. Click **Save**.

The new stream appears on the Streams page. Ingest data into the stream to populate and start using it.
:::
::::


::::tabs
:::tab[Create streams in OpenObserve self-hosted]
### Create streams in OpenObserve self-hosted
1. Select the organization from the top navigation bar.   
2. From the left navigation menu, select **Streams**.  
3. Click **New stream**.   
4. In the **New stream** dialog: 

    - Enter a unique stream **Name**. Use letters, numbers, underscores and colons only.   
    - Select the **Stream Type**.  
    - Specify the **Data Retention** in days. For example, enter 14 to keep data for 14 days after ingestion. When the period ends, OpenObserve removes the data automatically.  
        To keep data longer, select **Extended Retention** in the Stream Details sidebar.  
    - (Optional) In the **Fields** section, click **Add Field** to define fields with:
        - **Field Name**: Name of the field
        - **Data Type**: Select Utf8, Int64, Uint64, Float64, or Boolean
        - **Index Type**: Choose an indexing strategy (Full text search, Secondary index, Bloom filter, KeyValue partition, Prefix partition, or Hash partition with 8 to 128 buckets)<br>
        For detailed information about each field type and index strategy, see [Field and Index Types in Streams](data-type-and-index-type-in-streams.md)
    The fields you add form the user-defined schema at stream creation. Learn more about [user defined schema](schema-settings.md#user-defined-schema-uds).  

    :::accordion[Click to see how User-defined Schema works.]
    Let us say you define the following fields while creating a stream:

    - job (String)
    - code (Integer)
    - message (String)

    After you ingest data into this stream:

    - These fields (job, code, message) will appear under User Defined Schema in the [Stream Details](stream-details.md) page.
    - Any additional fields not defined earlier will appear under All Fields.
    :::


5. Click **Save**.
:::
::::

:::note[Note]

You can also create a stream during the first data ingestion, without using the UI. For other users, the organization must already exist before ingestion. <br>

The `root` user can create an organization through ingestion while the environment variable `ZO_CREATE_ORG_THROUGH_INGESTION` is `true`, which is the default. Set it to `false` to turn this off.
:::

## Ingest Data into Stream

- [Ingest Data Using curl](https://openobserve.ai/docs/getting-started/#load-sample-data). 
- Ingest Data Using API in [JSON formatted logs](https://openobserve.ai/docs/reference/api/ingestion/logs/json/) and [multiple records in a batch with multiple JSON lines](https://openobserve.ai/docs/reference/api/ingestion/logs/multi/). 
- [Ingest Data Continuously Using Data Sources](../../../index.md). 

:::note[Note]
You can now use the stream in Logs search, Dashboards, Pipelines, Alerts, and Actions.
:::

## Next Steps
- [Stream Details](stream-details.md)
- [Schema Settings](schema-settings.md)
- [Extended Retention](extended-retention.md)

