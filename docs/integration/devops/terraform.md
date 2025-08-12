---
title: Terraform Logs Integration Guide  
description: Forward Terraform execution logs to OpenObserve using Fluent Bit for real-time analysis and search.

---

# Integration with Terraform

This guide explains how to forward **Terraform logs** to OpenObserve using Fluent Bit. 

## Overview

Terraform doesn’t log to files by default. This integration enables detailed logging by setting environment variables and then uses Fluent Bit to ship those logs to OpenObserve. The setup is lightweight, easy to run locally, and enables structured log analysis and dashboarding for infrastructure-as-code workflows.

## Steps to Integrate

??? "Prerequisites"

    - Terraform installed
    - OpenObserve account ([Cloud](https://cloud.openobserve.ai/web/) or [Self-Hosted](../../../quickstart/#self-hosted-installation))

??? "Step 1: Enable Logging in Terraform"

    1. **Set environment variables:**: Add the following lines to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.):
    ```bash
    export TF_LOG=DEBUG
    export TF_LOG_PATH="./tf.log"
    ```
        > `TF_LOG=DEBUG` captures detailed debug-level logs.  
        > `TF_LOG_PATH` sets the location where logs are written.

    2. **Test log generation:**: Run any Terraform command, such as:

    ```bash
    terraform apply
    ```
    Confirm that a file named `tf.log` is created in your working directory and is populated with Terraform debug logs.

??? "Step 2: Configure Fluent Bit"

    1. Install Fluent Bit:
    ```bash
    brew install fluent-bit
    ```
       > On **Linux or Windows**, install Fluent Bit using platform-specific methods: [Fluent Bit installation guide](https://docs.fluentbit.io/manual/installation)

    2. Create a Fluent Bit config file (e.g., `fluent-bit.conf`):

    ```ini
    [INPUT]
        Name            tail
        Path            ./tf.log
        Tag             terraform
        Mem_Buf_Limit   5MB
        Skip_Long_Lines On
        Read_from_Head  On

    [FILTER]
        Name            record_modifier
        Match           terraform
        Record          level DEBUG

    [FILTER]
        Name            record_modifier
        Match           terraform
        Record          log_source terraform

    [OUTPUT]
        Name            http
        Match           *
        URI             /api/default/terraform/_json
        Host            localhost
        Port            5080
        tls             Off
        Format          json
        Json_date_key   _timestamp
        Json_date_format iso8601
        HTTP_User       <openobserve_user>
        HTTP_Passwd     <openobserve_basic_password>
        compress        gzip
    ```

    **Key Settings:**

    - `Path`: Location of the Terraform log file
    - `Tag`: Identifies the Terraform logs
    - `record_modifier`: Adds metadata like `level` and `log_source`
    - `HTTP_User` and `HTTP_Passwd`: Your OpenObserve credentials
    

??? "Step 3: Run Fluent Bit"

    1. Start Fluent Bit with your config file:
    ```bash
    fluent-bit -c /path/to/fluent-bit.conf
    ```

    > This will start reading `tf.log` and forwarding entries to OpenObserve in real time.

??? "Step 4: Validate Logs in OpenObserve"

    1. In your Openobserve instance, Go to **Logs** → select your log stream → Set time range → Click **Run Query**
    ![Validate Terraform logs in OpenObserve](https://openobserve.ai/assets%2Ftf_sc_a64795ae12.gif)

## Troubleshooting

??? "tf.log not generated?"

    - Ensure both `TF_LOG` and `TF_LOG_PATH` are exported in your shell
    - Run `terraform plan` or `terraform apply` to trigger log generation
    - Verify `tf.log` exists in the specified path


??? "Fluent Bit not forwarding logs?"

    - Confirm that the `Path` in `[INPUT]` matches your actual `tf.log` location
    - Run Fluent Bit with `-vv` to see verbose logs
    - Ensure OpenObserve is reachable at `localhost:5080`

??? "No logs in OpenObserve?"

    - Check for correct username/password in the `[OUTPUT]` section
    - Confirm the URI path matches your OpenObserve stream:
    ```
    /api/default/terraform/_json
    ```
    - Look for errors in the Fluent Bit output

??? "Log fields missing or incorrect?"

    - Check the `[FILTER]` configuration
    - `log_source` and `level` fields should be injected by `record_modifier`
    - Verify your log entries contain structured key-value output
