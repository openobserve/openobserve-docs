# OpenObserve: Introduction

## What is OpenObserve?

**OpenObserve**, also referred to as O2, is a cloud native observability platform that unifies **logs, metrics, and traces**. It provides *~140x lower storage costs* (compared to Elasticsearch. Results can be higher or lower based on data entropy) for real life log data, significantly lower operational cost and ease of use. 

It can scale to **petabytes of data**, is highly performant and allows you to sleep better at night 😀. If you are looking for an observability tool for logs, metrics and traces, do evaluate OpenObserve and understand how its architectural approach can optimize your observability costs and enhance software development.

## OpenObserve Features

#### Logs Management
| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 1 | Log search | ✅ Available | Advanced search capabilities with SQL-based queries |
| 2 | Highly compressed storage of data | ✅ Available | Efficient data compression reduces storage requirements |
| 3 | Dynamic evolution of schema | ✅ Available | Automatic schema evolution without manual intervention |
| 9 | Search-around logs data | ✅ Available | Contextual log exploration around specific events |
| 8 | Support for very high cardinality data | ✅ Available | Handle datasets with millions of unique values |
| 10 | User defined Ingest and Query functions (VRL based) | ✅ Available | Custom data processing and transformation functions |
| 14 | Standard alerts | ✅ Available | Log-based alerting system |
| 15 | Real time Alerts  | ✅ Available | Immediate log-based notifications |

#### Metrics & Monitoring
| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 24 | Metrics | ✅ Available | Native metrics ingestion and storage |
| 25 | PromQL support for metrics | ✅ Available | 97% PromQL compliant for Prometheus compatibility |
| 23 | Dashboards | ✅ Available | Customizable visualization dashboards |
| 27 | Standard alerts  | ✅ Available | Metric-based alerting system |
| 28 | Real time Alerts | ✅ Available | Immediate metric-based notifications |

#### Distributed Tracing
| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 26 | Traces | ✅ Available | Complete distributed tracing support |

#### Query & Analysis
| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 7 | SQL based query language | ✅ Available | Standard SQL interface for familiar querying |
| 6 | Advanced GUI | ✅ Available | Built-in interface eliminates need for additional components |


#### Deployment & Scaling
| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 16 | High Availability (HA) and clustering | ✅ Available | Clustering and failover capabilities |
| 17 | Stateless nodes | ✅ Available | Horizontal scaling without data replication concerns |
| 11 | Multi-tenancy | ✅ Available | Secure data isolation between tenants |
| 22 | SIMD support for vectorized processing (AVX512 and Neon) | ✅ Available | Hardware-accelerated data processing |
| 21 | Prebuilt container images with SIMD acceleration | ✅ Available | Optimized container deployments |

#### Storage & Integration
| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 5 | Support of S3, MinIO, GCS, Azure blob for data storage | ✅ Available | Multi-cloud storage backend support |
| 12 | Ingestion API compatibility with Elasticsearch | ✅ Available | Compatible ingestion APIs for existing tooling |
| 13 | Search and aggregation API compatibility with Elasticsearch | 🔧 Through zPlane | Full Elasticsearch API compatibility via enterprise add-on |
| 4 | Out of the box authentication | ✅ Available | Built-in authentication system |
| 18 | Localization for multiple languages | ✅ Available | Support for multiple languages |

#### Cloud Integration
| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 31 | Ingest AWS logs (cloudwatch, VPC flow logs, AWS WAF and more) using Kinesis firehose | ✅ Available | Native AWS log ingestion |

### Enterprise Features

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 32 | Single Sign On (SSO) | ✅ Available (Enterprise) | Integration with enterprise identity providers |
| 33 | RBAC (Role Based Access Control) | ✅ Available (Enterprise) | Role-based access control with granular permissions |

### Alerting & Notifications

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 29 | Template based alert target (Allows alerting to slack, teams and many more) | ✅ Available | Flexible alerting to multiple platforms |
| 30 | Send alerts to Prometheus alertmanager | ✅ Available | Integration with Prometheus AlertManager |

### Frontend Observability

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 34 | Front end - Performance analytics | ✅ Available | Frontend performance monitoring |
| 35 | Front end - Session Replay | ✅ Available | User session recording and analysis |
| 36 | Front end - Error tracking | ✅ Available | Frontend error monitoring and alerting |

### Deployment Options

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 19 | Prebuilt binaries for multiple platforms | ✅ Available | Cross-platform binary distributions |
| 20 | Prebuilt container images for multiple platforms | ✅ Available | Multi-architecture container support |

#### Getting Started
For detailed instructions on installation and setting up your first observation, refer to our [Getting Started Guide](getting-started.md).

### Roadmap

#### Upcoming Features

| Feature | Status | Description |
|---------|--------|-------------|
| Log patterns | 🔨 In Development | Automated pattern recognition in log data |
| Anomaly detection | 🔨 In Development | Machine learning-based anomaly identification |
| Cross-signal correlation | 🔨 In Development | Unified correlation between logs, metrics, and traces |

Please raise any new feature requests via [GitHub issue tracker](https://github.com/openobserve/openobserve/issues).

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

Elasticsearch is a general purpose search engine which can be used for app search or log search. OpenObserve is built specifically for log search. If you are looking for a lightweight alternative to Elasticsearch then you should take a look at ZincSearch.

#### Technical Advantages
OpenObserve provides ability to index data in multiple ways to make it faster yet keep storage size low. It uses a combination of:

- Partitioning
- Bloom filters
- Inverted indexes
- Caching
- Columnar storage

[Uber found 80% of queries in their production environment to be aggregation queries](https://www.uber.com/en-IN/blog/logging/) and columnar data storage of OpenObserve means that aggregation queries will typically be much faster than Elasticsearch.

#### Storage Cost Comparison

Below is the result when we sent real life log data from our kubernetes cluster to both Elasticsearch and OpenObserve using fluentbit. This only pertains to storage. Cost of EBS volume is [8 cents/GB/Month (GP3)](https://aws.amazon.com/ebs/pricing/), cost of s3 is [2.3 cents/GB/month](https://aws.amazon.com/s3/pricing/). In HA mode in Elasticsearch you generally have 1 primary node and 2 replicas. You don't need to replicate s3 for data durability/availability as [AWS redundantly stores your objects on multiple devices across a minimum of three Availability Zones (AZs) in an Amazon S3 Region](https://aws.amazon.com/s3/faqs/).

![OpenObserve Vs Elasticsearch storage](./images/zo_vs_es.png)

OpenObserve offers significant advantage of 140x lower storage costs compared to Elasticsearch in the above scenario. Your actual results may vary depending on how compressible your specific log data is. This doesn't even consider additional unused EBS volume capacity and monitoring overhead.

#### Operational Advantages

- `Stateless Architecture`: Scale horizontally without data replication or corruption challenges
- `No Index Mapping`: Hassle-free cluster management without index mapping complexities
- `Lower Operational Cost`: Significantly reduced effort in managing clusters
- `Built-in GUI`: Eliminates need for additional components like Kibana
- `Rust Performance`: Awesome performance without JVM challenges
- `Purpose-Built`: Built from ground up as observability tool, not general-purpose search

## Elasticsearch compatibility

OpenObserve `_bulk` API endpoint is elasticsearch compatible and can be used by log forwarders like fluentbit, fluentd and vector. Filebeat is supported through zPlane.

Search and aggregation API compatibility with Elasticsearch is provided through zPlane.

zPlane is the enterprise product offered by ZincLabs that among other things provides Elasticsearch search and aggregation compatibility. Learn more about it at [zPlane docs](zplane)
## Are there any benchmarks?
OpenObserve is currently under heavy development with many changes still happening to the core engine. We will do benchmarking soon as we complete implementation of some of the items at hand. 

In the meanwhile, there are hundreds of production installations of OpenObserve globally at small, mid tier and very large scale being used by startups and enterprises alike. Many have reported that OpenObserve is highly performant. Some of them have replaced 5-7 node Elasticsearch clusters with a single node of OpenObserve. 

Here is a [case study of Jidu](https://openobserve.ai/blog/jidu-journey-to-100-tracing-fidelity) that increased their throughput and query performance by 10x and reduced their storage costs by 10x by switching from Elasticsearch to OpenObserve, ingesting 10TB of data everyday. Jidu is a large EV manufacturer in China.



