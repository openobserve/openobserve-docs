# Integration with AWS EC2
This guide provides step-by-step instructions to integrate AWS EC2 with OpenObserve.

## Overview
The AWS EC2 integration enables streaming of system metrics and logs from EC2 instances to OpenObserve using the OpenObserve Collector, a pre-configured version of the OpenTelemetry Collector.

The integration collects:

- System metrics: CPU usage, memory utilization, disk I/O, and network traffic
- Log data: System logs from /var/log/ and custom application logs
- Real-time monitoring: Continuous collection with configurable intervals

This integration helps you monitor EC2 instance performance, troubleshoot issues, and gain visibility into your infrastructure without the complexity and cost of traditional AWS CloudWatch monitoring.

## Steps to Integrate

??? "Prerequisites"

    - **An OpenObserve account**: Sign up for a free Cloud account [here](https://cloud.openobserve.ai/web/). Alternatively, you can install a [self-hosted version of OpenObserve](https://openobserve.ai/docs/quickstart/#self-hosted-installation).
    - **An AWS account**: Sign up [here](https://signin.aws.amazon.com/signup?request_type=register).
    - An **EC2 instance** running a Linux-based OS
        - **SSH key pair** configured for EC2 instance access.


??? "Step 1: Setup Your EC2 Instance"

    1. Set appropriate permissions for your key file:

    ```bash
    chmod 400 "your-key.pem"
    ```
    2. Connect to your instance using SSH:

    ```bash
    ssh -i /path/to/your-key.pem ec2-user@your-instance-public-dns
    ```

??? "Step 2: Install OpenObserve Collector"

    1. In the OpenObserve UI, navigate to Data Sources → Linux.
    2. Copy the custom curl command provided to install OpenObserve Collector.The authentication token included in the command contains your base64 encoded credentials, which is used to authenticate your collector with the OpenObserve API.
    3. Execute the command on your EC2 instance.

    ![Install OpenObserve Collector](../images/aws-integrations/get_auth_token_linux.png)

??? "Step 3: Configure the OpenTelemetry Collector"

    The OpenObserve Collector is pre-configured during installation, but you can customize it for your specific needs.

    1. View the current configuration:
    ```bash
    sudo nano /etc/otel-collector/config.yaml
    ```

    2. The default configuration file should look similar to this:
    ```yaml
    receivers:
    hostmetrics:
        collection_interval: 30s
        scrapers:
        cpu:
            metrics:
            system.cpu.time:
                enabled: true
        memory:
            metrics:
            system.memory.usage:
                enabled: true
            system.memory.utilization:
                enabled: true
        disk:
            metrics:
            system.disk.io:
                enabled: true
            system.disk.operations:
                enabled: true
        network:
            metrics:
            system.network.io:
                enabled: true
    filelog:
        include: ["/var/log/*.log"]
        start_at: beginning

    processors:
    batch:
        timeout: 1s
        send_batch_size: 1024

    exporters:
    otlphttp:
        endpoint: "https://cloud.openobserve.ai/api/default"
        headers:
        Authorization: "Basic <YOUR_AUTH_TOKEN>"
        stream-name: "default"

    service:
    pipelines:
        metrics:
        receivers: [hostmetrics]
        processors: [batch]
        exporters: [otlphttp]
        logs:
        receivers: [filelog]
        processors: [batch]
        exporters: [otlphttp]
    ```
    3. To include additional log files, modify the `filelog` receiver:
    ```yaml
    filelog:
    include: ["/var/log/*.log", "/path/to/your/custom/app.log"]
    ```
    4. After making any configuration changes, restart the collector:
    ```bash
    sudo systemctl restart otel-collector
    ```


??? "Step 4: Generate Sample Data (Optional)"

    To populate dashboard panels with meaningful data, create a load generation script:

    1. Create the script file:
    ```bash
    nano generate_load.sh
    ```

    2. Paste the following script:
    ```bash
    #!/bin/bash
    echo "Starting comprehensive system load generation..."

    # Install required tools if not already installed
    sudo yum install -y stress-ng sysstat

    # Function to generate system logs during load generation
    generate_logs() {
        logger "System load test started"
        logger "CPU intensive operation running"
        logger "Memory allocation in progress"
        logger "Disk I/O operations started"
        logger "Network activity simulation running"
        logger -p user.warning "High CPU usage detected"
        logger -p user.error "Memory threshold exceeded"
    }

    # Generate CPU load (multiple cores)
    stress-ng --cpu 2 --cpu-method all --timeout 60s &

    # Generate memory load (256 MB)
    stress-ng --vm 1 --vm-bytes 256M --timeout 60s &

    # Generate disk I/O (write and read operations)
    dd if=/dev/zero of=/tmp/testfile bs=1M count=1024 oflag=direct &
    dd if=/tmp/testfile of=/dev/null bs=1M &

    # Generate network I/O (simulate network traffic)
    for i in {1..10}; do
        curl -s https://www.google.com > /dev/null &
        wget -q https://www.google.com -O /dev/null &
    done

    # Monitor system metrics during load generation (every 10 seconds)
    echo "Monitoring system metrics for 60 seconds..."
    for i in {1..6}; do
        echo "=== System stats at interval $i/6 ==="
        # CPU stats
        echo "CPU Usage:"
        top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}'
        
        # Memory stats
        echo "Memory Usage:"
        free -m
        
        # Disk stats
        echo "Disk Usage:"
        df -h
        
        # Generate logs at each interval to simulate activity in logs panel
        generate_logs
        sleep 10
    done

    # Cleanup temporary files created during disk I/O simulation
    rm -f /tmp/testfile
    echo "Load generation complete"
    ```

    3. Make the script executable and run it:
    ```bash
    chmod +x generate_load.sh
    ./generate_load.sh
    ```

??? "Step 5: Verify Ingestion"

    **Check Log Ingestion**

    1. In OpenObserve, navigate to **Logs**, select the appropriate stream from the dropdown.
    2. Choose your time range, and click **Run Query** to verify that EC2 system logs are appearing.

        ![Check Log Ingestion](../images/aws-integrations/view_logs.png)

    **Check Metrics Ingestion**

    1. Navigate to **Streams** in OpenObserve.
    2. You should see both Logs and Metrics streams with ingested data.
    3. Metrics will include CPU usage, memory usage, disk I/O, and network traffic data.

    > For comprehensive monitoring visualization, you can import pre-built dashboards from OpenObserve's repository or create custom dashboards with panels for CPU usage, memory utilization, disk I/O, network traffic, and system logs.
    For detailed dashboard creation instructions, refer [here](https://openobserve.ai/docs/user-guide/dashboards/dashboards-in-openobserve/).

??? "Troubleshooting"

    **Otel Misconfiguration Issues**

    - If you're not seeing logs or metrics in OpenObserve, check the collector logs for errors:

    ```bash
    sudo journalctl -u otel-collector -f | grep Error
    ```

    - Look for issues such as misconfigurations, permission problems, or connectivity errors.

    **File Permission Issues**

    The collector may encounter "permission denied" errors when trying to access specific system logs:

    - Check the permissions of the log files: `sudo ls -l /var/log/`
    - If you see permission issues, update the permissions:
    ```bash
    # Adjust permissions for specific log files
    sudo chmod 644 /var/log/cloud-init.log /var/log/cloud-init-output.log /var/log/tallylog
    ```

    **Restart the Collector Service**

    - After making configuration changes or adjusting file permissions, restart the collector: `sudo systemctl restart otel-collector`
    - Verify that the collector is running without issues: `sudo systemctl status otel-collector`


    **No Data Appearing in OpenObserve**

    - Verify that the OpenObserve endpoint and authentication token are correct in the configuration file.
    - Check that the EC2 instance has internet connectivity to reach the OpenObserve API.
    - Ensure the collector service is running and not reporting any errors in the logs.
    - Verify that the log files specified in the configuration exist and are readable by the collector.