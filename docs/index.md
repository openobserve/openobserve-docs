# OpenObserve: Introduction

`OpenObserve` is a cloud native observability platform (`Logs`, `Metrics`, `Traces`) that provides `~140x lower storage costs` (compared to Elasticsearch. YMMV. Could be higher or lower based on data entropy) for real life log data, significantly lower operational cost and ease of use. It can scale to petabytes of data, is highly performant and allows you to sleep better at night 😀. If you are looking for an observability tool for logs, metrics and traces, do evaluate OpenObserve and how its approach towards observability could help you build better software, save money on observability costs, and sleep better.


## Project Status, Features and Roadmap

Following is the list of available features and roadmap.

| # | Feature                                                       | Status              |
|---|---------------------------------------------------------------|---------------------|
| 1 | Log search                                                    | Available           |
| 2 | Highly compressed storage of data                             | Available           |
| 3 | Dynamic evolution of schema                                   | Available           |
| 4 | Out of the box authentication                                 | Available           |
| 5 | Support of S3, MinIO, GCS, Azure blob for data storage        | Available           |
| 6 | Advanced GUI                                                  | Available           |
| 7 | SQL based query language                                      | Available           |
| 8 | Support for very high cardinality data                        | Available           |
| 9 | Search-around logs data                                       | Available           |
| 10 | User defined Ingest and Query functions (VRL based)          | Available           |
| 11 | Multi-tenancy                                                | Available           |
| 12 | Ingestion API compatibility with Elasticsearch               | Available           |
| 13 | Search and aggregation API compatibility with Elasticsearch  | [Through zPlane](zplane) |
| 14 | Standard alerts (Based on logs)                              | Available           |
| 15 | Real time Alerts (Based on logs)                             | Available           |
| 16 | High Availability (HA) and clustering                        | Available           |
| 17 | Stateless nodes                                              | Available           |
| 18 | Localization for multiple languages                          | Available           |
| 19 | Prebuilt binaries for multiple platforms                     | Available           |
| 20 | Prebuilt container images for multiple platforms             | Available           |
| 21 | Prebuilt container images for with SIMD acceleration         | Available           |
| 22 | SIMD support for vectorized processing (AVX512 and Neon)     | Available           |
| 23 | Dashboards                                                   | Available           |
| 24 | Metrics                                                      | Available           |
| 25 | PromQL support for metrics                                   | Available (97% PromQL compliant) |
| 26 | Traces                                                       | Available           |
| 27 | Standard alerts (Based on metrics)                           | Available           |
| 28 | Real time Alerts (Based on metrics)                          | Available           |
| 29 | Template based alert target (Allows alerting to slack, teams and many more)  | Available |
| 30 | Send alerts to Prometheus alertmanager                       | Available           |
| 31 | Ingest AWS logs (cloudwatch, VPC flow logs, AWS WAF and more) using Kinesis firehose | Available |
| 32 | Single Sign On(SSO)                                          | Available (Enterprise) |
| 33 | RBAC (Role Based Access Control)                             | Available (Enterprise) |
| 34 | Front end - Performance analytics                            | Available           |
| 35 | Front end - Session Replay                                   | Available           |
| 36 | Front end - Error tracking                                   | Available           |
| 37 | Log patterns                                                 | To start            |
| 38 | Anomaly detection                                            | To start            |
| 39 | Correlation between logs, metrics and traces                 | To start            |
| 40 | Dashboard migration from Splunk, Kibana and Grafana | beta. [https://dc.openobserve.ai](https://dc.openobserve.ai) [https://github.com/openobserve/dashboard_converter](https://github.com/openobserve/dashboard_converter) |


Please raise any new feature requests via [github issue tracker](https://github.com/openobserve/openobserve/issues).

You can use either the open source version or [OpenObserve Cloud](https://cloud.openobserve.ai). [OpenObserve Cloud](https://cloud.openobserve.ai) is built on top of open source OpenObserve but has minor differences to account for its SaaS nature. We will highlight the differences in the documentation whenever needed.

## Guiding principles

We want to build the best software in the observability category in the world, and we believe that the below principles will keep us aligned towards that:

1. Day 1: It should be easy to setup and use
    1. You should be able to install (for self hosted option) or sign up (for SaaS platform) in under 2 minutes.
    1. You should be able to start ingesting data in under 2 minutes and start observing the behavior of your applications without any major configuration.
2. Day 2: It should not be painful to keep the system up and running
    1. Application should be stable and in the case of issues should be able to heal itself automatically.
    1. Majority of the users should be able to start using the system efficiently with ZERO configuration.
    1. Scaling up/down should be as easy as changing the number of nodes in an autoscaling group (in AWS) or changing the number of replicas (in k8s).
    1. Majority of the folks should not need backups or should be able to do it without DBA level skills.
    1. Fear of upgrades should not make you lose your sleep
3. Features and Usability: It should have good features and functionality to do the job efficiently
    1. System should be highly usable from the get go - providing excellent ROI on the invested time. A great UI and API are important to achieve it.
    1. Logs themselves do not provide you visibility into your application. You need metrics and traces as well and the ability to correlate them.
4. Cost: It should be cost effective
    1. You should not have to mortgage your house or company assets in order to run the system either in self hosted mode (with or without licensing cost) or for SaaS platform.
5. Learning curve: It should allow beginners to do a lot of tasks easily and advanced users should be able to use most of their existing skills
    1. A user who has never used the system should be able to set up and use the system efficiently for basic needs or should be able to use existing skills for advanced purposes.
6. Performance: It should be highly performant
    1. System should be highly performant for most of the use cases in the real world.
    1. Many a times performance requires a tradeoff. In situations of tradeoffs, it should be generally acceptable to the majority of the users for the use case with excellent tradeoff value in return.

## How does OpenObserve compare to Elasticsearch

Elasticsearch is a general purpose search engine which can be used app search or log search. OpenObserve is built specifically for log search. If you are looking for a lightweight alternative of Elasticsearch then you should take a look at ZincSearch.

OpenObserve provides ability to index data in multiple ways to make it faster yet keep storage size low. It uses a combination of partitioning, bloom filters, inverted indexes, caching and columnar storage to make search and aggregation queries faster. You can combine these to find the right balance between storage and performance. [Uber found 80% of queries in their production environment to be aggregation queries](https://www.uber.com/en-IN/blog/logging/) and columnar data storage of OpenObserve means that aggregation queries will typically be much faster than Elasticsearch.

Below is the result when we sent real life log data from our kubernetes cluster to both Elasticsearch and OpenObserve using fluentbit. This only pertains to storage. Cost of EBS volume is [8 cents/GB/Month (GP3)](https://aws.amazon.com/ebs/pricing/), cost of s3 is [2.3 cents/GB/month](https://aws.amazon.com/s3/pricing/). In HA mode in Elasticsearch you generally have 1 primary node and 2 replicas. You don't need to replicate s3 for data durability/availability as [AWS redundantly stores your objects on multiple devices across a minimum of three Availability Zones (AZs) in an Amazon S3 Region](https://aws.amazon.com/s3/faqs/).

![OpenObserve Vs Elasticsearch storage](./images/zo_vs_es.png)

OpenObserve offers significant advantage of 140x lower storage costs compared to Elasticsearch in the above scenario (YMMV, you could get higher or lower values based on entropy of data). That does not even consider additional unused EBS volume capacity that needs to be available in order to not run out of disk space and the effort that it requires to keep monitoring disk usage so it is not filled.

Stateless node architecture allows OpenObserve to scale horizontally without worrying about data replication or corruption challenges.

OpenObserve's lack of index mapping and associated challenges provides a hassle-free experience in managing clusters.

You will typically see much lower operational effort and cost in managing OpenObserve clusters compared to Elasticsearch.

The platform's built-in GUI eliminates the need for another component like Kibana, and has awesome performance, thanks to Rust, without the challenges of JVM. 

In contrast to Elasticsearch, which is a general-purpose search engine that doubles as an observability tool, OpenObserve was built from the ground up as an observability tool, with high focus on delivering exceptional observability.

## Elasticsearch compatibility

OpenObserve `_bulk` API endpoint is elasticsearch compatible and can be used by log forwarders like fluentbit, fluentd and vector. Filebeat is supported through zPlane.

Search and aggregation API compatibility with Elasticsearch is provided through zPlane.

zPlane is the enterprise product offered by ZincLabs that among other things provides Elasticsearch search and aggregation compatibility. Learn more about it at [zPlane docs](zplane)
## Are there any benchmarks?
OpenObserve is currently under heavy development with many changes still happening to the core engine. We will do benchmarking soon as we complete implementation of some of the items at hand. 

In the meanwhile, there are hundreds of production installations of OpenObserve globally at small, mid tier and very large scale being used by startups and enterprises alike. Many have reported that OpenObserve is highly performant. Some of them have replaced 5-7 node Elasticsearch clusters with a single node of OpenObserve. 

Here is a [case study of Jidu](https://openobserve.ai/blog/jidu-journey-to-100-tracing-fidelity) that increased their throughput and query performance by 10x and reduced their storage costs by 10x by switching from Elasticsearch to OpenObserve, ingesting 10TB of data everyday. Jidu is a large EV manufacturer in China.



