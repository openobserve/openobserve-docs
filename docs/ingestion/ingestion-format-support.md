OpenObserve supports ingestion in both JSON and HEC formats. 

=== "Ingest JSON-formatted Logs"
    If your log files are in JSON format, use the following endpoint:

    ```
    https://api.openobserve.ai/api/<organization_id>/<stream_id>/_json
    ```
    **Example:** 
    Ingest JSON-formatted Logs Using cURL
    ```
    curl https://api.openobserve.ai/api/<organization_id>/<stream_id>/_hec -i -u "root@example.com:Complexpass#123"  -d "@k8slogs_json.json" 
    ```

=== "Ingest HEC-formatted Logs"
    If your log files are in HEC format, use the following endpoint:

    ```
    https://api.openobserve.ai/api/<organization_id>/<stream_id>/_hec
    ```
    This ingestion method is useful for teams migrating from Splunk or using tools that generate logs in HEC format.

    **Example:**
    Ingest HEC-formatted Logs Using cURL
    ```
    curl https://api.openobserve.ai/api/<organization_id>/<stream_id>/_hec -i -u "root@example.com:Complexpass#123"  -d "@logs_hec.hec" 
    ```

!!! Note
    Ensure that the log file matches the required format for the selected endpoint. Improperly formatted files will result in ingestion errors.






