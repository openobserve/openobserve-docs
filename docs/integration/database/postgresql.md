# Integration with PostgreSQL

This guide provides step-by-step instructions to integrate PostgreSQL with OpenObserve.

## Overview

The PostgreSQL integration enables monitoring of PostgreSQL database performance metrics through OpenTelemetry. This integration streams telemetry data from PostgreSQL to OpenObserve, providing insights into database health, query performance, and operational metrics for effective monitoring and troubleshooting.


## Steps to Integrate
??? "Prerequisites"

    - PostgreSQL must be installed and running.
    - OpenObserve must be installed and running.
    - You should have a basic understanding of OpenTelemetry.

??? "Step 1: Set Up PostgreSQL Access"

    Ensure that your PostgreSQL server is installed and running. If it is running locally, the default endpoint is `localhost:5432`.

    Create a user role with login access. Open the PostgreSQL shell and run the following command:

    ```sql
    CREATE ROLE myuser WITH LOGIN PASSWORD 'mypassword';
    ```
    ![Set up PostgreSQL Access](../../images/postgresql-set-up-access.png)

    Replace `myuser` and `mypassword` with credentials suitable for your environment. You will use these values in later steps to authenticate the OpenTelemetry Collector.

??? "Step 2: Install OpenTelemetry Collector Contrib"

    Install the OpenTelemetry Collector Contrib package to access the PostgreSQL receiver.

    **Note:** The default OpenTelemetry Collector does not include all receivers, including the PostgreSQL receiver required for database metrics collection. The OpenTelemetry Collector Contrib package includes additional receivers for various data sources including PostgreSQL.

    1. Visit the [OpenTelemetry Collector Contrib Releases](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases) page.

    2. Download the latest release for your machine. Use the following command in your terminal, replacing the version number with the latest available version:

    ```bash
    curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.115.1/otelcol-contrib_0.115.1_darwin_arm64.tar.gz
    ```

    3. Extract the downloaded file:

    ```bash
    tar -xvf otelcol-contrib_0.115.1_darwin_arm64.tar.gz
    ```

    4. Move the binary to a directory in your PATH:

    ```bash
    sudo mv otelcol-contrib /usr/local/bin/
    ```

    5. Verify the installation by checking the collector version:

    ```bash
    otelcol-contrib --version
    ```

    This command displays the collector version and confirms successful installation.

??? "Step 3: Configure OpenTelemetry Collector for PostgreSQL"

    Receivers in the OpenTelemetry Collector collect telemetry data from various sources. They serve as the entry point for data into the collector, gathering metrics, logs, and traces from different systems. Each receiver handles specific data types and protocols.

    **PostgreSQL Receiver Overview**

    The PostgreSQL receiver collects performance metrics from PostgreSQL databases. This receiver is useful for monitoring database performance, identifying bottlenecks, and optimizing queries. The receiver provides insights into database health and operational metrics for troubleshooting and performance tuning.

    **Configuration Requirements**

    The following settings are required to create a database connection:

    - `username`: Database user account name
    - `password`: Database user account password

    The following settings are optional:

    - `endpoint`: The endpoint of the PostgreSQL server. The default value is `localhost:5432`. For TCP or Unix sockets, use the format `host:port`. If `transport` is set to `unix`, the endpoint translates internally from `host:port` to `/host.s.PGSQL.port`.
    - `transport`: The transport protocol for connecting to PostgreSQL. The default value is `tcp`. Available options are `tcp` and `unix`.
    - `databases`: The list of databases for which the receiver attempts to collect statistics. The default value is an empty list. If you provide an empty list, the receiver attempts to collect statistics for all non-template databases.
    - `exclude_databases`: List of databases to exclude when collecting statistics. The default value is an empty list.

    The following example shows a basic configuration for the PostgreSQL receiver:

    ```yaml linenums="1"
    receivers:
    postgresql:
        endpoint: localhost:5432
        transport: tcp
        username: otel
        password: ${env:POSTGRESQL_PASSWORD}
        connection_pool:
        max_idle_time: 10m
        max_lifetime: 0
        max_idle: 2
        max_open: 5
    ```

    Create a configuration file named `config.yaml`. This file defines how the collector behaves, including data sources, processing methods, and export destinations.

    ```yaml linenums="1"
    receivers:
    postgresql:
        endpoint: localhost:5432
        transport: tcp
        username: myuser
        password: ${env:POSTGRESQL_PASSWORD}
        databases:
        - postgres
        connection_pool:
        max_idle_time: 10m
        max_lifetime: 0
        max_idle: 2
        max_open: 5

    processors:
    memory_limiter:
        check_interval: 1s
        limit_percentage: 75
        spike_limit_percentage: 15
    batch:
        send_batch_size: 10000
        timeout: 10s

    exporters:
    otlphttp/openobserve:
        endpoint: http://localhost:5080/api/default
        headers:
        Authorization: Basic cm9vdEBleGFtcGxlLmNvbTpSYUJaRVFJTWRSVlJxWGFy
        stream-name: default

    service:
    pipelines:
        metrics:
        receivers: [postgresql]
        processors: [memory_limiter, batch]
        exporters: [otlphttp/openobserve]
    ```

    **Configuration Components**

    - **Receivers**: The `postgresql` receiver collects data from your PostgreSQL instance. Ensure the endpoint, username, and password match the credentials you configured in Step 1.
    - **Processors**: The `memory_limiter` and `batch` processors manage and optimize data flow to exporters.
    - **Exporters**: The `otlphttp/openobserve` exporter sends collected telemetry data to OpenObserve. Replace the endpoint and authorization values with your actual OpenObserve API endpoint and authentication token. <br>You can find these values in **Data Sources** > **Custom** > **Metrics** > **Otel Collector**.

??? "Step 4: Start OpenTelemetry Collector"

    Run the OpenTelemetry Collector with the specified configuration using the following command:

    ```bash
    otelcol-contrib --config /path/to/your/config.yaml
    ```

    Replace the placeholder path with the actual location of your `config.yaml` file.

    The command displays output similar to the following, confirming successful startup.

??? "Step 5: View PostgreSQL Metrics in OpenObserve"

    After completing the setup, navigate **Streams** to view available data streams. If you do not see your data immediately, click **Refresh Stats**. Use the search functionality to find the desired stream.


??? "Troubleshooting"

    ### Enable SSL for PostgreSQL Metrics Collection

    When using the OpenTelemetry Collector to monitor PostgreSQL database metrics, connection errors may occur because SSL is not enabled by default. This issue may result in connection errors and interrupt metrics collection. This section details the steps to enable SSL on your PostgreSQL server for secure metrics collection.

    **Configure SSL on PostgreSQL**

    Follow these steps to enable SSL on your PostgreSQL server:

    **1. Edit PostgreSQL Configuration**

    Locate and edit the `postgresql.conf` file. This file is typically located in the PostgreSQL data directory. To find the data directory, run the following command in your PostgreSQL client:

    ```sql
    SHOW data_directory;
    ```

    After you identify the data directory, open the `postgresql.conf` file using your preferred text editor. For example, using nano:

    ```bash
    nano /path/to/your/postgresql.conf
    ```

    **2. Update SSL Configuration**

    In the `postgresql.conf` file, locate the SSL configuration section. If SSL is not configured, add the following settings. This configuration assumes you have generated your SSL certificate (`server.crt`) and key (`server.key`) and placed them in the PostgreSQL data directory.

    **3. Apply Configuration Changes**

    After updating the configuration:

    - Save and close the configuration file.
    - Restart the PostgreSQL service using one of the following commands.
    - Verify the configuration by connecting to the database and running the SSL status command.

    If you are using nano, press Ctrl+X, then Y, and finally Enter to save the changes.

    Restart PostgreSQL service. Depending on your system setup, use one of the following commands:

    ```bash
    brew services restart postgresql
    ```

    **4. Verify SSL Configuration**

    After PostgreSQL restarts, connect to your database and run the following command to verify that SSL is enabled:

    ```sql
    SHOW ssl;
    ```

    This command returns `on`, confirming that SSL is successfully enabled.

