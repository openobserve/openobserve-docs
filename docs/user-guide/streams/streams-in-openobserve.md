Streams define how observability data is ingested, stored, indexed, and queried in OpenObserve. This guide introduces key concepts related to streams and explains how to create and use them.

## What Is a Stream

A stream is a logical container that holds one type of observability data, such as logs, metrics, or traces. It is the required entry point for data ingestion in OpenObserve. Every log, metric, or trace must be associated with a stream at the time of ingestion.

!!! Note
    Each stream has the following characteristics:
        
    - It belongs to an organization.  
    - It has a unique name.  
    - It stores only one type of data such as logs, metrics, and traces.

## Access

=== "Cloud"
    - The **Add Stream** button is present by default on the **Streams** page.
    - Users can create streams without enabling any configuration.
    - During stream creation, the Fields section is optional.
    - If you do not define any fields, OpenObserve will automatically detect them from the data you ingest. These detected fields will appear under **All Fields** in the Stream Details page.

=== "Self-hosted"
    - By default, the **Add Stream** button is not visible on the **Streams** page.
    - To enable the **Add Stream** button, set the following environment variable to `true`: <br>
        `ZO_ALLOW_USER_DEFINED_SCHEMAS`
    - After enabling the variable:

        - The **Add Stream** button becomes visible.
        - During stream creation, the **Fields** section is mandatory. You must define at least one field name and field type. This defines a user-defined schema for the stream.

## Permission

### OpenObserve Cloud or the Enterprise Edition with Role Based Access Control (RBAC)

If RBAC is enabled in OpenObserve Cloud and the enterprise edition:

- **Root:** Full access to all streams across all organizations.  
- **Admin** and **Editor:** Can view, create, update, and delete streams within their organization.  
- **Viewer:** Can view streams. Cannot create, update, or delete streams.  
- **User:** Cannot view, create, or modify streams.  
- **Custom roles**: A user or service account with custom roles can create and manage streams if the required permissions are granted using RBAC.
> Learn more about [OpenObserve Cloud](https://cloud.openobserve.ai/) and the [Enterprise Edition](https://openobserve.ai/docs/openobserve-enterprise-edition-installation-guide/). 

## Create a Stream in OpenObserve

### Prerequisite

- You have set up OpenObserve using [OpenObserve Cloud](https://cloud.openobserve.ai/) or the [self hosted](https://openobserve.ai/docs/quickstart/) option.   
- You have created the organization where you plan to create the stream.
- For self-hosted deployment, ensure that the `ZO_ALLOW_USER_DEFINED_SCHEMAS` environment variable is enabled. 

The following steps vary for **Cloud** and **Self-hosted** deployment: 
> If RBAC is enabled, ensure that you have required permissions to create streams.  

=== "Create Streams in OpenObserve Cloud"
    1. Select the organization from the top navigation bar.   
    2. From the left navigation menu, select **Streams**.  
    3. Click **Add Stream.**   
    4. In the **Add Stream** dialog: 

        - Enter a unique stream name.   
        - Select the **Stream Type**.  
        - Specify the **Data Retention** in days. For example, enter 14 to keep data for 14 days after ingestion. When the period ends, OpenObserve removes the data automatically.  
            To keep data longer, select **Extended Retention** in the Stream Details sidebar.  
        - (Optional) Use the **Add Fields**, if you wish to create fields to the **User Defined Schema**. Learn more about [user defined schema](../../user-guide/streams/schema-settings.md/#user-defined-schema-uds).    
    5. Click **Create Stream**.

    The new stream appears on the Streams page. Ingest data into the stream to populate and start using it.


=== "Create Streams in OpenObserve Self-Hosted"
    1. Select the organization from the top navigation bar.   
    2. From the left navigation menu, select **Streams**.  
    3. Click **Add Stream.**   
    4. In the **Add Stream** dialog: 

        - Enter a unique stream name.   
        - Select the **Stream Type**.  
        - Specify the **Data Retention** in days. For example, enter 14 to keep data for 14 days after ingestion. When the period ends, OpenObserve removes the data automatically.  
            To keep data longer, select **Extended Retention** in the Stream Details sidebar.  
        - In the **Add Fields** section, you must define at least one field name and field type. This creates a user-defined schema at stream creation.
    
        ??? info "Click to see how User-defined Schema works."
            Let us say you define the following fields while creating a stream:

            - job (String)
            - code (Integer)
            - message (String)

            After you ingest data into this stream:
            
            - These fields (job, code, message) will appear under User Defined Schema in the [Stream Details](../../user-guide/streams/stream-details.md) page.
            - Any additional fields not defined earlier will appear under All Fields.
        
        This creates a user-defined schema at stream creation. Learn more about [user defined schema](../../user-guide/streams/schema-settings.md/#user-defined-schema-uds).    
    5. Click **Create Stream**.

!!! Note

    You can also create a stream during the first data ingestion, without using the UI. The organization must already exist before ingestion. <br>

    OpenObserve does not support organization creation as part of the ingestion process.<br>
    
    However, if the environment variable `ZO_CREATE_ORG_THROUGH_INGESTION` is set as `true`, only the `root` user can create organization through ingestion. By default, ZO_CREATE_ORG_THROUGH_INGESTION is set as `false` by default.

## Ingest Data into Stream

- [Ingest Data Using curl](https://openobserve.ai/docs/quickstart/#load-sample-data). 
- Ingest Data Using API in [JSON formatted logs](https://openobserve.ai/docs/api/ingestion/logs/json/) and [multiple records in a batch with multiple JSON lines](https://openobserve.ai/docs/api/ingestion/logs/multi/). 
- [Ingest Data Continuously Using Data Sources](../../ingestion/index.md). 

!!! Note
    You can now use the stream in Logs search, Dashboards, Pipelines, Alerts, and Actions.

## Next Steps
- [Stream Details](stream-details.md)
- [Schema Settings](schema-settings.md)
- [Extended Retention](extended-retention.md)

