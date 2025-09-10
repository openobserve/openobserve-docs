---
title: Ansible Logs Integration Guide  
description: Forward Ansible execution logs to OpenObserve using Fluent Bit for real-time search and observability.

---

# Integration with Ansible

This guide walks you through forwarding **Ansible logs** from an Ubuntu machine to OpenObserve using Fluent Bit. 

## Overview

Ansible doesn’t send logs to external systems by default. This integration configures a local playbook to write logs to a file, and uses Fluent Bit to tail that file and send logs to OpenObserve over HTTP.

## Steps to Integrate

??? "Prerequisites"

    - Ubuntu machine (local, virtual machine, or cloud VM)
    - User with `sudo` privileges
    - Basic familiarity with Ansible and Fluent Bit
    - OpenObserve account ([Cloud](https://cloud.openobserve.ai/web/) or [Self-Hosted](../../../getting-started/#self-hosted-installation))
    - Ansible Installed

??? "Step 1: Configure Ansible log File"

    1. **Configure log output path in `ansible.cfg`**:
    ```ini
    [defaults]
    log_path = /tmp/ansible_log_demo.txt
    ```

??? "Step 2: Create a Local Ansible Task (Optional)"

    1. **Create a sample playbook**:
    ```bash
    vi local_task.yml
    ```
    2. Add the following contents:
    ```yaml
    ---
    - name: Ansible Local Task Demo
      hosts: localhost
      connection: local
      tasks:
        - name: Create a sample file
          ansible.builtin.file:
            path: /tmp/ansible_log_demo.txt
            state: touch

        - name: Write a message to the sample file
          ansible.builtin.copy:
            content: "This is a demo log entry from Ansible."
            dest: /tmp/ansible_log_demo.txt
    ```

    3. **Run the playbook**:
    ```bash
    ansible-playbook local_task.yml
    ```

    After running, check `/tmp/ansible_log_demo.txt` to confirm logs are generated.

??? "Step 3: Install Fluent Bit on Ubuntu"

    1. **Install Fluent Bit using the official script**:
    ```bash
    curl https://raw.githubusercontent.com/fluent/fluent-bit/master/install.sh | sh
    ```
    > For manual install or using package managers, refer to [Fluent Bit Docs](https://docs.fluentbit.io/manual/installation/linux/ubuntu)

    2. **Verify installation**:
    ```bash
    fluent-bit --version
    ```

??? "Step 4: Configure Fluent Bit for Ansible Logs"

    1. **Edit Fluent Bit config file**:
    ```bash
    sudo vi /etc/fluent-bit/fluent-bit.conf
    ```

    2. **Add the following configuration**:
    ```ini
    [SERVICE]
        Flush         5
        Daemon        Off
        Log_Level     info

    [INPUT]
        Name          tail
        Path          /tmp/ansible_log_demo.txt
        Tag           ansible.demo
        Refresh_Interval 5

    [OUTPUT]
        Name http
        Match *
        URI /api/<O2_ORG_NAME>/<O2_STREAM_NAME>/_json
        Host <O2_HOST>
        Port 443
        tls On
        Format json
        Json_date_key    _timestamp
        Json_date_format iso8601
        HTTP_User <O2_USER>
        HTTP_Passwd <O2_PASSWORD>
        compress gzip
    ```

    > Note
        - Replace `<O2_ORG_NAME>`, `<O2_STREAM_NAME>`, `<O2_HOST>`, `<O2_USER>`, and `<O2_PASSWORD>` with your OpenObserve values.
        - Example URI: `/api/default/ansible/_json` for the `default` org and `ansible` stream.

??? "Step 5: Start Fluent Bit"

    1. **Start the Fluent Bit service**:
    ```bash
    sudo systemctl start fluent-bit
    sudo systemctl enable fluent-bit
    ```
    2. **Check service status**:
    ```bash
    sudo systemctl status fluent-bit
    ```
    > Ensure there are no startup errors. Logs will now be tailed and sent to OpenObserve.

??? "Step 6: Verify Logs in OpenObserve"

    1. In your Openobserve instance, Go to **Logs** → select your log stream → Set time range → Click **Run Query**

        ![Verify Ansible Logs in OpenObserve](https://openobserve.ai/assets%2Fansible_logs_o2_2fa50f03c6.gif)
## Troubleshooting

??? "No logs in OpenObserve?"

    - Ensure Fluent Bit is running: `sudo systemctl status fluent-bit`
    - Double-check the HTTP config and authentication
    - Use Fluent Bit in debug mode:  
    ```bash
    sudo fluent-bit -c /etc/fluent-bit/fluent-bit.conf -vv
    ```

??? "Ansible log file not updating?"

    - Confirm `log_path` is correctly set in `ansible.cfg`
    - Use verbose flags (`-v`, `-vv`, `-vvv`) to produce more logs
    - Confirm Ansible has permission to write to `/tmp`

??? "Fluent Bit not picking up logs?"

    - Make sure the path `/tmp/ansible_log_demo.txt` exists
    - Tail the file manually to confirm updates:
    ```bash
    tail -f /tmp/ansible_log_demo.txt
    ```

    - Adjust `Refresh_Interval` or restart Fluent Bit if needed
