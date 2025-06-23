This guide provides an overview of downsampling, including its configuration, rule format, and an example.

> **Downsampling is an enterprise feature in OpenObserve. It applies only to metrics data.**

Downsampling summarizes historical data into fewer data points. Each summarized data point is calculated using an aggregation method, such as the last recorded value, the average, or the total, applied over a defined time block. 

## Configure Downsampling

Downsampling is configured using the following environment variables.:

- `O2_COMPACT_DOWNSAMPLING_INTERVAL`: Defines how often the downsampling job runs or the interval, in seconds. 
> For example, `O2_COMPACT_DOWNSAMPLING_INTERVAL`: "300", this downsampling job runs every 5 minutes.  
- `O2_METRICS_DOWNSAMPLING_RULES`: Specifies which data streams to target and how they should be downsampled using defined rules. You can add a comma-separated list of rules.
> For example, `O2_METRICS_DOWNSAMPLING_RULES`: "o2_cpu_usage:avg:30d:5m, app_analytics:last:10d:10m"

> Refer to the [Downsampling Rule](#downsampling-rule) section. <br> 

#### Downsampling Configuration For Helm Chart Users

Add the environment variables under the `enterprise.parameters` section in your `values.yaml` file:  
```  
enterprise:  
  enabled: true  
  parameters:  
    `O2_COMPACT_DOWNSAMPLING_INTERVAL`: "60"    
    `O2_METRICS_DOWNSAMPLING_RULES`: "o2_cpu_usage:avg:30d:5m"    
```

#### Downsampling Configuration For Terraform Users

Set the same variables in your `terraform.tfvars` file:  
```  
`O2_COMPACT_DOWNSAMPLING_INTERVAL` = "60"  
`O2_METRICS_DOWNSAMPLING_RULES`    = "up:avg:30d:5m"  
```
> **Note**: **After setting the environment variables, make sure to redeploy the OpenObserve instance for the changes to apply.**


### Downsampling Rule

User-defined rules determine how downsampling is applied to metrics streams. You can define multiple downsampling rules to target different streams or use different configurations. 

Each rule must follow the format: `pattern:function:offset:step`.  

Here:

- **pattern**: It is a regular expression that specifies the data streams the rule applies to. For example, `o2_.*`.  
- **function**: The aggregation function used to summarize values. 
> You may apply one of the supported function based on your requirement:
>
>   - **avg**: Calculates the average of all values in the time block.
>   - **sum**: Returns the total (sum) of all values in the time block.
>   - **count**: Returns the number of data points in the time block.
>   - **min**: Returns the smallest value in the time block.
>   - **max**: Returns the largest value in the time block.
>   - **last**: Retains the last recorded value in the time block.
>   - **first**: Retains the first recorded value in the time block.  
- **offset**: It defines the age of data eligible for downsampling. For example, 15d for applying downsampling on data older than 15 days.  
- **step**: The time block used to group data points. For example, 30m for applying downsampling to retain one value every 30 minutes.

### Sample Downsampling Rules

#### Single Rule
```yaml
O2_METRICS_DOWNSAMPLING_RULES: "o2_cpu_metrics:avg:30d:5m"
```
Retains one average value every 5 minutes for `o2_cpu_metrics` data older than 30 days.<br>
**Multiple Rules**
```yaml
O2_METRICS_DOWNSAMPLING_RULES: "o2_cpu_metrics:avg:30d:5m, o2_app_logs:last:10d:10m"
```
Applies two rules: the first rule averages `o2_cpu_metrics` every 5 minutes after 30 days, and the second rule keeps the last value for `o2_app_logs` every 10 minutes after 10 days. <br>
**Rule with Regular Expression Pattern**
```yaml
O2_METRICS_DOWNSAMPLING_RULES: "o2_cpu_.*:sum:10d:60m"
```
Targets all streams starting with `o2_cpu_`, and for each matching stream, retains one hourly sum for data older than 10 days.

### Downsampling Example

**Scenario**<br>
A system is recording CPU usage data every 10 seconds to the stream `o2_cpu_usage`, generating a large volume of high-resolution metrics. Over time, this data becomes too granular and expensive to store or query efficiently for historical analysis.
<br>
**Goal**<br>
Downsample data older than 30 days to retain one average for every 2-minute time block. Run the downsampling job every 3 minutes.

**Configuration**<br>
`O2_COMPACT_DOWNSAMPLING_INTERVAL` = "180"     
`O2_METRICS_DOWNSAMPLING_RULES` = "o2_cpu_usage:avg:30d:2m"  

**Input Metrics**<br>

```json

{ "timestamp": "2024-03-01 00:00:00", "cpu": 20.0 }  
{ "timestamp": "2024-03-01 00:00:10", "cpu": 20.1 }  
{ "timestamp": "2024-03-01 00:00:20", "cpu": 20.2 }  
{ "timestamp": "2024-03-01 00:00:30", "cpu": 20.3 }  
{ "timestamp": "2024-03-01 00:00:40", "cpu": 20.4 }  
{ "timestamp": "2024-03-01 00:00:50", "cpu": 20.5 }  
{ "timestamp": "2024-03-01 00:01:00", "cpu": 20.6 }  
{ "timestamp": "2024-03-01 00:01:10", "cpu": 20.7 }  
{ "timestamp": "2024-03-01 00:01:20", "cpu": 20.8 }  
{ "timestamp": "2024-03-01 00:01:30", "cpu": 20.9 }  
{ "timestamp": "2024-03-01 00:01:40", "cpu": 21.0 }  
{ "timestamp": "2024-03-01 00:01:50", "cpu": 21.1 }

{ "timestamp": "2024-03-01 00:02:00", "cpu": 21.2 }  
{ "timestamp": "2024-03-01 00:02:10", "cpu": 21.3 }  
{ "timestamp": "2024-03-01 00:02:20", "cpu": 21.4 }  
{ "timestamp": "2024-03-01 00:02:30", "cpu": 21.5 }  
{ "timestamp": "2024-03-01 00:02:40", "cpu": 21.6 }  
{ "timestamp": "2024-03-01 00:02:50", "cpu": 21.7 }  
{ "timestamp": "2024-03-01 00:03:00", "cpu": 21.8 }  
{ "timestamp": "2024-03-01 00:03:10", "cpu": 21.9 }  
{ "timestamp": "2024-03-01 00:03:20", "cpu": 22.0 }  
{ "timestamp": "2024-03-01 00:03:30", "cpu": 22.1 }  
{ "timestamp": "2024-03-01 00:03:40", "cpu": 22.2 }  
{ "timestamp": "2024-03-01 00:03:50", "cpu": 22.3 }

{ "timestamp": "2024-03-01 00:04:00", "cpu": 22.4 }  
{ "timestamp": "2024-03-01 00:04:10", "cpu": 22.5 }  
{ "timestamp": "2024-03-01 00:04:20", "cpu": 20.0 }  
{ "timestamp": "2024-03-01 00:04:30", "cpu": 20.1 }  
{ "timestamp": "2024-03-01 00:04:40", "cpu": 20.2 }  
{ "timestamp": "2024-03-01 00:04:50", "cpu": 20.3 }  
{ "timestamp": "2024-03-01 00:05:00", "cpu": 20.4 }  
{ "timestamp": "2024-03-01 00:05:10", "cpu": 20.5 }  
{ "timestamp": "2024-03-01 00:05:20", "cpu": 20.6 }  
{ "timestamp": "2024-03-01 00:05:30", "cpu": 20.7 }  
{ "timestamp": "2024-03-01 00:05:40", "cpu": 20.8 }  
{ "timestamp": "2024-03-01 00:05:50", "cpu": 20.9 }

{ "timestamp": "2024-03-01 00:06:00", "cpu": 21.0 }  
{ "timestamp": "2024-03-01 00:06:10", "cpu": 21.1 }  
{ "timestamp": "2024-03-01 00:06:20", "cpu": 21.2 }  
{ "timestamp": "2024-03-01 00:06:30", "cpu": 21.3 }  
{ "timestamp": "2024-03-01 00:06:40", "cpu": 21.4 }  
{ "timestamp": "2024-03-01 00:06:50", "cpu": 21.5 }  
{ "timestamp": "2024-03-01 00:07:00", "cpu": 21.6 }  
{ "timestamp": "2024-03-01 00:07:10", "cpu": 21.7 }  
{ "timestamp": "2024-03-01 00:07:20", "cpu": 21.8 }  
{ "timestamp": "2024-03-01 00:07:30", "cpu": 21.9 }  
{ "timestamp": "2024-03-01 00:07:40", "cpu": 22.0 }  
{ "timestamp": "2024-03-01 00:07:50", "cpu": 22.1 }

{ "timestamp": "2024-03-01 00:08:00", "cpu": 22.2 }  
{ "timestamp": "2024-03-01 00:08:10", "cpu": 22.3 }  
{ "timestamp": "2024-03-01 00:08:20", "cpu": 22.4 }  
{ "timestamp": "2024-03-01 00:08:30", "cpu": 20.0 }  
{ "timestamp": "2024-03-01 00:08:40", "cpu": 20.1 }  
{ "timestamp": "2024-03-01 00:08:50", "cpu": 20.2 }  
```

**Downsampling Time Blocks (Step = 2m) and Average CPU Usage**

- Time Block 1: From 00:00:00 to 00:01:59, average CPU usage is 20.55  
- Time Block 2: From 00:02:00 to 00:03:59, average CPU usage is 21.75  
- Time Block 3: From 00:04:00 to 00:05:59, average CPU usage is 20.66  
- Time Block 4: From 00:06:00 to 00:07:59, average CPU usage is 21.65  
- Time Block 5: From 00:08:00 to 00:09:59, average CPU usage is 20.88 (not processed yet)

**Downsampling Job Runs and Outputs**

Job 1 runs at 00:03:00 and processes Time Block 1 <br>
Output:
```json  
{ "timestamp": "2024-03-01 00:00:00", "cpu_avg": 20.55 }  
```  
Job 2 runs at 00:06:00 and processes Time Block 2 and Time Block 3<br>
Output:
```json  
{ "timestamp": "2024-03-01 00:02:00", "cpu_avg": 21.75 }  
{ "timestamp": "2024-03-01 00:04:00", "cpu_avg": 20.66 }  
```  
Job 3 runs at 00:09:00 and processes Time Block 4 <br>
Output:
```json  
{ "timestamp": "2024-03-01 00:06:00", "cpu_avg": 21.65 }  
```  
**Note**: Time Block 5 is still in progress at 00:09:00. It will be processed at 00:12:00.

