---
title: Troubleshooting Guide
description: Troubleshoot the OpenObserve operator with kubectl commands to list, patch, and delete stuck resources, remove finalizers, and fix reconciliation failures.
---

# OpenObserve Operator - Troubleshooting Guide

This guide provides kubectl commands and procedures for manually managing OpenObserve resources when they become stuck or need manual intervention.

## Table of Contents
- [Resource Types](#resource-types)
- [Listing Resources](#listing-resources)
- [Viewing Resource Details](#viewing-resource-details)
- [Patching Resources](#patching-resources)
- [Deleting Stuck Resources](#deleting-stuck-resources)
- [Common Troubleshooting Scenarios](#common-troubleshooting-scenarios)
- [Best Practices](#best-practices)

## Resource Types

The OpenObserve operator manages the following Custom Resource Definitions (CRDs):

| Short Name | Full Name | Purpose |
|------------|-----------|---------|
| `o2config` | `configs.openobserve.ai` | Connection configuration to OpenObserve instance |
| `o2alert` | `alerts.openobserve.ai` | Alert definitions |
| `o2pipeline` | `pipelines.openobserve.ai` | Data pipeline configurations |
| `o2function` | `functions.openobserve.ai` | VRL/JavaScript functions |
| `o2alerttemplate` | `alerttemplates.openobserve.ai` | Alert notification templates |
| `o2dest` | `destinations.openobserve.ai` | Alert and pipeline destinations |
| `o2dash` | `dashboards.openobserve.ai` | Dashboard definitions |
| `prb` | `prometheusrulebindings.openobserve.ai` | Syncs PrometheusRule objects into alerts |

## Listing Resources

### List all resources of a specific type

```bash
# List in current namespace
kubectl get alerts.openobserve.ai
kubectl get o2alert  # Using short name

# List in specific namespace
kubectl get alerts.openobserve.ai -n o2operator

# List across all namespaces
kubectl get alerts.openobserve.ai -A
kubectl get alerts.openobserve.ai --all-namespaces

# List multiple resource types at once
kubectl get o2alert,o2pipeline,o2function -n o2operator

# List with more details
kubectl get alerts.openobserve.ai -o wide

# List with custom columns
kubectl get destinations.openobserve.ai \
  -o custom-columns=NAME:.metadata.name,TYPE:.spec.type,CATEGORY:.status.destinationCategory,TEMPLATE:.spec.template
```

### Filter resources

```bash
# Using label selectors
kubectl get alerts.openobserve.ai -l environment=production

# Using field selectors
kubectl get alerts.openobserve.ai --field-selector metadata.name=my-alert

# Using grep for quick filtering
kubectl get alerts.openobserve.ai | grep critical

# List resources in specific states
kubectl get alerts.openobserve.ai -o json | jq '.items[] | select(.status.conditions[]? | select(.type=="Ready" and .status=="False")) | .metadata.name'
```

## Viewing Resource Details

### Get detailed information about a resource

```bash
# Describe a resource (human-readable format)
kubectl describe alerts.openobserve.ai my-alert -n o2operator

# Get full YAML output
kubectl get alerts.openobserve.ai my-alert -n o2operator -o yaml

# Get specific fields using JSONPath
kubectl get alerts.openobserve.ai my-alert -o jsonpath='{.status.conditions[?(@.type=="Ready")].message}'

# Get JSON output and filter with jq
kubectl get alerts.openobserve.ai my-alert -o json | jq '.status'

# View events related to a resource
kubectl get events --field-selector involvedObject.name=my-alert -n o2operator
```

### Check resource status

```bash
# Check if resource is ready
kubectl get alerts.openobserve.ai my-alert -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'

# View last error
kubectl get functions.openobserve.ai my-function -o jsonpath='{.status.lastError}'

# Check deletion timestamp (for stuck resources)
kubectl get destinations.openobserve.ai my-dest -o jsonpath='{.metadata.deletionTimestamp}'

# View finalizers
kubectl get alerts.openobserve.ai my-alert -o jsonpath='{.metadata.finalizers[*]}'
```

## Patching Resources

### Update resource specifications

```bash
# Patch using strategic merge
kubectl patch alerts.openobserve.ai my-alert -n o2operator \
  --type='merge' -p '{"spec":{"enabled":false}}'

# Patch using JSON patch
kubectl patch alerts.openobserve.ai my-alert -n o2operator \
  --type='json' -p='[{"op": "replace", "path": "/spec/enabled", "value": false}]'

# Update multiple fields
kubectl patch destinations.openobserve.ai my-dest -n o2operator \
  --type='merge' -p '{
    "spec": {
      "url": "https://new-webhook-url.com",
      "skipTlsVerify": true
    }
  }'

# Add labels
kubectl label alerts.openobserve.ai my-alert environment=staging

# Add annotations
kubectl annotate alerts.openobserve.ai my-alert description="Critical CPU alert"
```

### Remove finalizers (for stuck resources)

```bash
# Remove all finalizers
kubectl patch destinations.openobserve.ai stuck-dest -n o2operator \
  -p '{"metadata":{"finalizers":[]}}' --type=merge

# Remove specific finalizer
kubectl patch alerts.openobserve.ai stuck-alert -n o2operator \
  --type='json' -p='[{"op": "remove", "path": "/metadata/finalizers/0"}]'

# Alternative method using kubectl edit
kubectl edit alerts.openobserve.ai stuck-alert -n o2operator
# Then manually remove the finalizers section and save
```

## Deleting Stuck Resources

### Standard deletion

```bash
# Delete a single resource
kubectl delete alerts.openobserve.ai my-alert -n o2operator

# Delete using a manifest file
kubectl delete -f alert-definition.yaml

# Delete multiple resources
kubectl delete alerts.openobserve.ai alert1 alert2 alert3 -n o2operator

# Delete all resources of a type
kubectl delete alerts.openobserve.ai --all -n o2operator

# Delete with grace period
kubectl delete alerts.openobserve.ai my-alert --grace-period=30

# Force immediate deletion (use with caution)
kubectl delete alerts.openobserve.ai my-alert --grace-period=0 --force
```

### Handling stuck resources

When a resource is stuck in "Terminating" state:

```bash
# 1. Check why it's stuck
kubectl describe destinations.openobserve.ai stuck-dest -n o2operator

# 2. Check for finalizers
kubectl get destinations.openobserve.ai stuck-dest -n o2operator -o yaml | grep -A 5 finalizers

# 3. Check operator logs for errors
kubectl logs -n o2operator -l app=openobserve-operator --tail=50 | grep stuck-dest

# 4. Remove finalizers if the external resource is already deleted
kubectl patch destinations.openobserve.ai stuck-dest -n o2operator \
  -p '{"metadata":{"finalizers":null}}' --type=merge

# 5. If still stuck, edit and remove finalizers manually
kubectl edit destinations.openobserve.ai stuck-dest -n o2operator
```

## Common Troubleshooting Scenarios

### Scenario 1: Resource stuck in deletion due to "in use" error

```bash
# Example: Alert template can't be deleted because it's used by a destination

# 1. Identify what's using the resource
kubectl get destinations.openobserve.ai -A -o json | \
  jq '.items[] | select(.spec.template=="my-template") | {name: .metadata.name, namespace: .metadata.namespace}'

# 2. Delete the dependent resources first
kubectl delete destinations.openobserve.ai dependent-dest -n o2operator

# 3. If the dependent resource is also stuck, remove its finalizer
kubectl patch destinations.openobserve.ai dependent-dest -n o2operator \
  -p '{"metadata":{"finalizers":[]}}' --type=merge

# 4. Now delete the original resource
kubectl delete alerttemplates.openobserve.ai my-template -n o2operator
```

### Scenario 2: Resource out of sync with OpenObserve

```bash
# When Kubernetes resource exists but OpenObserve resource doesn't

# 1. Check resource status
kubectl get alerts.openobserve.ai my-alert -n o2operator -o jsonpath='{.status}'

# 2. Force reconciliation by updating a label
kubectl label alerts.openobserve.ai my-alert reconcile=true --overwrite

# 3. If reconciliation fails, check operator logs
kubectl logs -n o2operator deployment/openobserve-operator --tail=100 | grep my-alert

# 4. As last resort, delete and recreate
kubectl delete alerts.openobserve.ai my-alert -n o2operator
kubectl apply -f my-alert.yaml
```

### Scenario 3: Webhook validation blocking operations

```bash
# When webhook prevents deletion/updates

# 1. Check webhook configuration
kubectl get validatingwebhookconfigurations | grep openobserve

# 2. Temporarily disable webhook (emergency only!)
kubectl delete validatingwebhookconfiguration openobserve-webhook-config

# 3. Perform the operation
kubectl delete alerttemplates.openobserve.ai stuck-template -n o2operator

# 4. Reinstall webhook
kubectl apply -f manifests/04-webhook.yaml
```

### Scenario 4: Mass cleanup of failed resources

```bash
# Delete all resources in Failed state

# 1. List failed resources
kubectl get alerts.openobserve.ai -n o2operator -o json | \
  jq '.items[] | select(.status.conditions[]? | select(.type=="Ready" and .status=="False")) | .metadata.name'

# 2. Delete them
kubectl get alerts.openobserve.ai -n o2operator -o json | \
  jq -r '.items[] | select(.status.conditions[]? | select(.type=="Ready" and .status=="False")) | .metadata.name' | \
  xargs -I {} kubectl delete alerts.openobserve.ai {} -n o2operator

# 3. Clean up stuck resources with finalizers
for resource in $(kubectl get alerts.openobserve.ai -n o2operator -o name | grep terminating); do
  kubectl patch $resource -n o2operator -p '{"metadata":{"finalizers":[]}}' --type=merge
done
```

### Scenario 5: Debugging reconciliation failures

```bash
# 1. Check resource events
kubectl describe alerts.openobserve.ai my-alert -n o2operator | tail -20

# 2. Check operator logs with increased verbosity
kubectl logs -n o2operator deployment/openobserve-operator --tail=100 -f

# 3. Check resource generation vs observed generation
kubectl get alerts.openobserve.ai my-alert -n o2operator \
  -o jsonpath='{.metadata.generation} vs {.status.observedGeneration}'

# 4. Check retry count for deletion
kubectl get alerts.openobserve.ai my-alert -n o2operator \
  -o jsonpath='{.status.deletionRetryCount}'

# 5. Force requeue by changing something trivial
kubectl annotate alerts.openobserve.ai my-alert force-sync="`date`" --overwrite
```

## Best Practices

### DO's:
1. **Always use kubectl delete** for removing resources instead of manually deleting from OpenObserve UI
2. **Check dependencies** before deleting resources (e.g., templates used by destinations)
3. **Monitor operator logs** when performing operations to understand any failures
4. **Use dry-run** to preview changes before applying them:
   ```bash
   kubectl delete alerts.openobserve.ai my-alert --dry-run=client
   ```
5. **Backup resources** before major changes:
   ```bash
   kubectl get alerts.openobserve.ai -n o2operator -o yaml > alerts-backup.yaml
   ```

### DON'Ts:
1. **Don't manually delete resources from OpenObserve UI** - This causes sync issues
2. **Don't remove finalizers unless you understand the consequences** - Data loss may occur
3. **Don't force delete without checking logs first** - You might miss important errors
4. **Don't disable webhooks in production** - They provide important validation
5. **Don't ignore resource dependencies** - Check what uses a resource before deleting it

## Getting Help

### View operator logs
```bash
# Current logs
kubectl logs -n o2operator deployment/openobserve-operator

# Follow logs
kubectl logs -n o2operator deployment/openobserve-operator -f

# Previous container logs (if crashed)
kubectl logs -n o2operator deployment/openobserve-operator --previous

# Logs with timestamps
kubectl logs -n o2operator deployment/openobserve-operator --timestamps
```

### Check operator status
```bash
# Operator pod status
kubectl get pods -n o2operator -l app=openobserve-operator

# Operator deployment status
kubectl rollout status deployment/openobserve-operator -n o2operator

# Operator resource usage
kubectl top pods -n o2operator -l app=openobserve-operator
```

### Export resources for support
```bash
# Export all OpenObserve resources
for crd in alerts pipelines functions alerttemplates destinations configs; do
  kubectl get ${crd}.openobserve.ai -A -o yaml > openobserve-${crd}-export.yaml
done

# Create a support bundle
kubectl cluster-info dump --namespaces o2operator --output-directory ./support-bundle
```

## Emergency Recovery

If the operator is completely broken and resources need emergency cleanup:

```bash
#!/bin/bash
# Emergency cleanup script - USE WITH EXTREME CAUTION

NAMESPACE="o2operator"

# Remove all finalizers from all OpenObserve resources
for resource_type in alerts.openobserve.ai pipelines.openobserve.ai functions.openobserve.ai alerttemplates.openobserve.ai destinations.openobserve.ai; do
  echo "Cleaning up $resource_type..."
  kubectl get $resource_type -n $NAMESPACE -o name | while read resource; do
    echo "  Removing finalizers from $resource"
    kubectl patch $resource -n $NAMESPACE -p '{"metadata":{"finalizers":[]}}' --type=merge
  done
done

echo "Emergency cleanup complete. Resources should now delete normally."
```

---

**Note**: This guide assumes you have appropriate RBAC permissions to perform these operations. Always test commands in a development environment before running in production.