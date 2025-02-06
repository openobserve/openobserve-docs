This guide shows you how to create and use real-time and scheduled pipelines in OpenObserve.

## Create a Pipeline
### Prerequisites

- Your OpenObserve Cloud or the self-hosted instance is up and running.
- You have a functioning [Stream](https://openobserve.ai/docs/user-guide/streams/) where data gets ingested. This Stream will be used as a source stream in the pipeline.

### Step 1: Open the pipeline editor
1. Log in to OpenObserve.
2. From the navigation panel, select **Pipelines**.
3. In the **Pipelines** tab, click the **Add Pipeline** button in the top-right corner. 
This opens up the pipeline editor.

![Pipeline Editor in OpenObserve](https://github.com/debashisborgohain/Project2025/blob/main/images/realtime%20pipeline%202.png)
### Step 2: Enter a unique pipeline name

### Step 3: Configure the Source node based on the pipeline type
1. From the **Source** section, drag a **Stream** or **Query** node into the editor based on the following requirement:

    - To set up a real-time pipeline: Select **Stream**.
    - To set up a scheduled pipeline: Select **Query**.

2. Edit the source node:

    - Select **Stream Type**:
    - **If you selected Stream in the previous step**: Use the drop-down menu under **Stream Name** to select the source stream. Ensure that the source stream is active and receiving data. 
    ![source stream realtime](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/images/Pipeline1-%20Source%20stream.png)
    - **If you selected Query in the previous step**: Under **SQL**, write a query to fetch data from a source. Schedule the query execution by setting the **Frequency** and **Period**. For details, visit [Pipelines in OpenObserve](#). <br>In the following example, data is ingested periodically into the stream **k8s_logs**. The query runs every 2 minutes and fetches all data that was ingested into the stream **k8s_logs** in the preceding 2-minute interval.
    ![Query node](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/images/Pipeline2-%20Source%20query.png)
     
3. Click **Save** to confirm the source node.


### Step 4: Configure the Transform node
1. From the **Transform** section, drag a **Function** or **Condition** node into the pipeline editor.
2. Click the edit icon to configure the selected node.

    - **For a Condition node**: In the **Associate Condition** form, add one or more conditions to refine the data. Select the field name from the drop-down menu. <br>**Note**: If the selected source stream is active, the drop-down list shows all the field names from the ingested data.

    ![condition in realtime pipeline](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/images/Pipeline3%20-%20Transform%20using%20condition.png)  
    
    - **For a Function node**: In the **Associate Function** form, select an existing function or create a new function to associate with the pipeline. 

    ![function in realtime pipeline](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/images/Pipeline4-%20Transform%20using%20functions.png)
    <br>
    In the above example, the associated function, **del_message_field**, deletes the **message** field from the ingested data. 
    
    ![del function](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/images/Pipeline5-%20Function%20to%20delete%20the%20message%20field.png)
    <br>
    For more details, see the [Functions Guide](https://openobserve.ai/docs/user-guide/functions/).

3. Click **Save** to confirm the transform node.

### Step 5: Edit the Destination node

1. Drag a **Stream** node into the editor.
2. Click the edit icon in the destination **Stream** node.
3. In the **Associate Stream** form:

    - From the **Stream Name** drop-down, select an existing stream or toggle **Create New Stream** to create a new destination stream.
    - Select the **Stream Type**.

4. Click **Save** to confirm the destination node.

![destination stream](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/images/Pipeline6-%20destination%20stream.png)
### Step 6: Connect the Source, Transform, and Destination nodes to complete the data flow order

- Use the **remove icon** (![remove icon](https://github.com/debashisborgohain/Project2025/blob/main/images/icon%201.png)) to remove any incorrect connection.
- Use the **connection icon** (![connection icon](https://github.com/debashisborgohain/Project2025/blob/main/images/icon%202.png)) to build a connection between two nodes.

![realtime pipeline node connection](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/images/Pipeline7-%20connect%20nodes.png)
### Step 7: Save the pipeline

After you click Save, it gets activated automatically. Learn how to [manage pipelines](#).

![active pipeline](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/images/Pipeline8-%20Save%20pipeline.png)


## Use the Pipeline

### Prerequisite
Ensure that the pipeline is active.

### Step 1: Ingest Data 

Use `curl` or other [data ingestion options in OpenObserve](https://openobserve.ai/docs/user-guide/ingestion/).

**Example**: Ingesting new data from the **k8slog_json.json** file into the **k8s_logs** stream, which is under the **default** organization:
> `curl http://localhost:5080/api/default/k8s_logs/_json -i -u 'root@example.com:Complexpass#123' --data-binary "@k8slog_json.json"`

### Step 2: Execute Pipeline 

- **For real-time pipelines**: As soon as you ingest data into the source stream, the pipeline gets executed, and starts fetching and processing the data in real time.
- **For scheduled pipelines**: The pipeline executes according to its predefined schedule, fetching and processing data from the source stream at the specified intervals.

### Step 3: Verify Output 
1. Click **Streams** in the navigation panel.
2. Select the destination stream and click the **Stream Details** icon to verify that the transformed data is present.  

![verify output](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/images/Pipeline9-%20output%20verification.png)

Your pipeline has successfully transformed the ingested data and sent them to the destination stream. <br>

## Troubleshoot

1. **Unable to view the field names while configuring Transform Condition node?**  

    Verify if the source stream is functioning:

    a. In the navigation panel, select **Streams**. <br>
    b. Select the desired stream and check if the **Records** and **Ingested data** fields are populated.

2. **No data in destination stream?**

    - Ensure the pipeline is active.
    - Check the **Transform** node for errors.

## Next Step
- [Manage Pipelines](#)