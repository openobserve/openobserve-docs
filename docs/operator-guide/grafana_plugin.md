---
title: OpenObserve Grafana Plugin
weight: 4450
description: >-
  Use the OpenObserve Grafana plugin to visualize logs and metrics if you're
  already using Grafana. Includes setup steps for Kubernetes and non-K8s
  installs.
---
# OpenObserve Grafana Plugin

## What is Grafana?

Grafana is a popular open-source dashboarding and visualization platform. Originally designed for time series data, it has evolved into a comprehensive tool that can pull data from multiple sources and create unified dashboards for logs, metrics, and traces. It's widely used for monitoring and observability across organizations.

## Do You Need Grafana with OpenObserve?

**Short Answer: No, but you might want it.**

OpenObserve comes with a powerful built-in GUI that handles all your visualization needs, including:

- [Logs analysis and search](../features/logs.md)
- [Metrics monitoring](../features/metrics.md)  
- [Distributed tracing](../features/distributed-tracing.md)
- [Frontend monitoring](../features/frontend.md)
- [Interactive dashboards](../user-guide/dashboards/dashboards-in-openobserve.md)
- [Alerting and notifications](../user-guide/alerts/alerts.md)

**When to Use the Grafana Plugin:**

You should consider using OpenObserve's Grafana plugin if you:

1. **Already use Grafana** for other monitoring needs (e.g., Prometheus metrics)
2. **Have existing Grafana dashboards** you want to keep
3. **Need to consolidate** OpenObserve data with other data sources in a single Grafana instance

!!! warning "Plugin Maintenance Status"
      This Grafana plugin is not actively maintained. It may work with current Grafana and OpenObserve versions, but compatibility isn’t guaranteed. Test thoroughly before production use. For best results, use OpenObserve’s built-in visualizations.

## Getting Started

The following guide will walk you through installing and configuring the plugin in a Kubernetes environment. The steps can be adapted for non-Kubernetes deployments.

**Quick Start:** If you are already familiar with grafana plugin installation, you can download the plugin from [here](https://zincsearch-releases.s3.us-west-2.amazonaws.com/zo_gp/zo_gp.tar.gz) and get started. Feel free to skip the configuration section, you can directly jump [here](#using-grafana-plugin)

## Install Grafana

Grafana requires a persistent store to store its data and configuration. While configuration can be stored in a configmap or secret, data needs to be stored in a database. Grafana supports sqlite, mysql and postgres. Most installations I have seen in the wild use a single node grafana installation using sqlite. I have also seen that many of these use a kubernetes `deployment` . 

If you are using a single node grafana installation using sqlite then you should use `statefulset` instead of `deployment` so you do not lose your data when the pod restarts. If you are using mysql/postgres then you can use `deployment` as the data is stored in the database.

You would also need a `grafana.ini` config file to configure grafana. You can use the below minimalistic working grafana.ini file to start. You can add more configuration as needed.


### Configuration

```ini title="grafana.ini" linenums="1" hl_lines="4 9"
[date_formats]
default_timezone = UTC
[server]
root_url = https://grafana.yourdomain.com

[plugins]
enable_alpha = true
app_tls_skip_verify_insecure = false
allow_loading_unsigned_plugins = zinclabs_openobserve
```

`Line 4` should be updated with the root url of your grafana installation. This is the url that you will use to access grafana. e.g. `https://grafana.yourdomain.com`

`Line 9` is the one that is important where we specify that grafana should use the unsigned plugin `zinclabs_openobserve`. This is the plugin that we will install using the init container in the statefulset.

Once you have created the file, you can create a kubernetes secret using the below command.


```bash linenums="1"
kubectl create secret generic grafana-config --from-file=grafana.ini
```


### Deployment

Now let's install grafana.

```yaml title="grafana_statefulset.yaml" linenums="1"
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: grafana
spec:
  serviceName: "grafana"
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      securityContext:
        fsGroup: 2000
        runAsUser: 10000
        runAsGroup: 3000
      initContainers:
        - name: openobserve-plugin-loader
          image: wbitt/network-multitool
          imagePullPolicy: IfNotPresent
          command:
            [
              "sh",
              "-c",
              "curl -o /var/lib/grafana/plugins/zo_gp.tar.gz https://zincsearch-releases.s3.us-west-2.amazonaws.com/zo_gp/zo_gp.tar.gz && cd /var/lib/grafana/plugins &&  tar -zxvf zo_gp.tar.gz",
            ]
          volumeMounts:
            - name: grafana-base
              mountPath: /var/lib/grafana
            - name: grafana-plugins
              mountPath: /var/lib/grafana/plugins
      containers:
        - name: grafana
          image: grafana/grafana:latest
          ports:
            - containerPort: 3000
              name: grafana
          volumeMounts:
            - name: grafana-base
              mountPath: /var/lib/grafana
            - name: grafana-plugins
              mountPath: /var/lib/grafana/plugins
            - name: grafana-config
              mountPath: /etc/grafana
      volumes:
        - name: grafana-base
          persistentVolumeClaim:
            claimName: grafana-base
        - name: grafana-plugins
          persistentVolumeClaim:
            claimName: grafana-plugins
        - name: grafana-config
          secret:
            defaultMode: 420
            secretName: grafana-config
  volumeClaimTemplates:
    - metadata:
        name: grafana-base
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 1Gi
    - metadata:
        name: grafana-plugins
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 1Gi
---
apiVersion: v1
kind: Service
metadata:
  name: grafana
spec:
  ports:
    - port: 3000
      targetPort: 3000
  selector:
    app: grafana

```

We are using an `init container` in this case to download and configure openobserve plugin for the grafana container.


Now let's install the statefulset using the below command.

```bash linenums="1"
kubectl apply -f grafana_statefulset.yaml
```

## Using Grafana plugin


### Set up data source

Once grafana starts you could go to the data sources section and search for `OpenObserve`

<img src="../images/grafana_1.png" width="50%" />

Next let's add OpenObserve data source server details.

You need to do following:

1. Update URL
1. Enable Basic Auth
1. Provide user id and password for basic auth details.

Once you have updated the above, click on `Save and Test` button. If everything is correct you should see a success message.

<img src="../images/grafana_2.png" width="50%" />


### Explore logs

Now let's explore some logs. Click on Explore menu item on the left and select OpenObserve as the data source.

<img src="../images/explore_1.png" width="50%" />

<img src="../images/explore_2.png" width="50%" />

Select appropriate:
1. organization
1. stream
1. time range

and click  on `Run Query` button. You should see the logs from the stream.

<img src="../images/explore_3.png" width="100%" />

You should now be able to see the results.

<img src="../images/explore_4.png" width="100%" />

If you want to explore metrics from OpenObserve in Grafana, you can set up OpenObserve as a Prometheus-compatible data source using an endpoint like https://api.openobserve.ai/api/org_name/prometheus. You do not need the plugin for this, as Grafana supports Prometheus natively.



