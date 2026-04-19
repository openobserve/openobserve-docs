---
title: Capacity Planning Guide - Resource Sizing for Production Deployment | OpenObserve
description: Complete capacity planning guide for OpenObserve deployment - compute, memory, and storage sizing for production observability workloads and high availability clusters.
---
# Capacity Planning - Resource Sizing & Deployment Planning

Plan capacity and resource sizing for OpenObserve production deployment. This capacity planning guide helps you size compute, memory, and storage for your observability workloads and high availability clusters.

## Introduction

For running OpenObserve in production and high availability mode, you need to plan capacity for the following resources:

1. Compute capacity
2. Memory capacity
3. S3 storage capacity
4. Disk storage for caching and ingestion
5. Storage capacity

Capacity planing can be complex as the hardware requirements can vary based on the use case as well as the availability of hardware can vary.

We have provided a capcity planning sheet that can help you plan for your OpenObserve cluster. It is based in infrastructure in AWS.

## Capacity planning sheet

[Capacity planning sheet](https://docs.google.com/spreadsheets/d/1pVCDcX73FZ8mSqagGUW6HE2mcD46CEpQlwahm9r6fLo/edit?usp=sharing) can be used to estimate your OpenObserve cluster hardware requirements. The sheet is based on AWS infrastructure.

In order to use it, make a copy of the sheet and fill in the following information:

1. Daily Ingestion Volume (TB/Day)
2. Data Retention (Days)
