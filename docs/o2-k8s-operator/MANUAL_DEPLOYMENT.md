
## Manual Deployment Process

If you prefer to deploy the operator manually without using the deployment script, follow these steps:

### Step 1: Create Namespace
```bash
kubectl apply -f manifests/00-namespace.yaml
```

### Step 2: Install Custom Resource Definitions (CRDs)
```bash
kubectl apply -f manifests/01-o2configs.crd.yaml
kubectl apply -f manifests/01-o2alerts.crd.yaml
kubectl apply -f manifests/01-o2alerttemplates.crd.yaml
kubectl apply -f manifests/01-o2destinations.crd.yaml
kubectl apply -f manifests/01-o2pipelines.crd.yaml
kubectl apply -f manifests/01-o2functions.crd.yaml
```

### Step 3: Set up RBAC
```bash
kubectl apply -f manifests/02-rbac.yaml
```

### Step 4: Apply ConfigMap for Operator Configuration
```bash
kubectl apply -f manifests/02-configmap.yaml
```

This ConfigMap contains configuration for:
- Controller concurrency settings
- API rate limiting
- HTTP connection pool settings
- Logging level

**Note:** You can edit the ConfigMap values before applying to tune the operator performance based on your requirements. After modifying, restart the operator deployment for changes to take effect.

### Step 5: Deploy the Operator
```bash
kubectl apply -f manifests/03-deployment.yaml
```

### Step 6: Configure Webhook (Optional)

**Note:** The deploy.sh script handles certificate generation automatically and updates the caBundle in the webhook configuration file. For manual setup:

```bash
# Generate self-signed certificates for webhook
openssl req -x509 -newkey rsa:2048 -nodes -keyout /tmp/tls.key -out /tmp/tls.crt -days 365 \
  -subj "/CN=openobserve-webhook.o2operator.svc"

# Create secret with certificates
kubectl -n o2operator create secret tls openobserve-webhook-server-cert \
  --cert=/tmp/tls.crt --key=/tmp/tls.key

# Get the CA bundle and update the webhook configuration
CA_BUNDLE=$(cat /tmp/tls.crt | base64 | tr -d '\n')
# Update the caBundle field in manifests/04-webhook.yaml with the CA_BUNDLE value

# Apply webhook configuration
kubectl apply -f manifests/04-webhook.yaml
```

### Step 7: Verify Installation
```bash
# Check if operator pod is running
kubectl get pods -n o2operator

# Verify CRDs are installed
kubectl get crds | grep openobserve

# Check operator logs
kubectl logs -n o2operator deployment/openobserve-operator
```

### Manual Uninstallation

To manually uninstall the operator:

```bash
# 1. Remove any custom resources (this example removes all in all namespaces)
kubectl delete openobserveconfigs,openobservealerts,openobservealerttemplates,openobservedestinations,openobservepipelines,openobservefunctions --all -A

# 2. Delete webhook configuration
kubectl delete -f manifests/04-webhook.yaml

# 3. Delete operator deployment
kubectl delete -f manifests/03-deployment.yaml

# 4. Delete ConfigMap
kubectl delete -f manifests/02-configmap.yaml

# 5. Delete RBAC resources
kubectl delete -f manifests/02-rbac.yaml

# 6. Delete CRDs
kubectl delete -f manifests/01-o2configs.crd.yaml
kubectl delete -f manifests/01-o2alerts.crd.yaml
kubectl delete -f manifests/01-o2alerttemplates.crd.yaml
kubectl delete -f manifests/01-o2destinations.crd.yaml
kubectl delete -f manifests/01-o2pipelines.crd.yaml
kubectl delete -f manifests/01-o2functions.crd.yaml

# 7. Delete namespace (this will also delete the webhook secret)
kubectl delete -f manifests/00-namespace.yaml
```
