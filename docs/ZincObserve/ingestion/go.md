## Golang

```golang
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

func main() {
    data := `[{
        "kubernetes.annotations.kubectl.kubernetes.io/default-container": "prometheus",
        "kubernetes.annotations.kubernetes.io/psp": "eks.privileged",
        "kubernetes.container_hash": "quay.io/prometheus/prometheus@sha256:4748e26f9369ee7270a7cd3fb9385c1adb441c05792ce2bce2f6dd622fd91d38",
        "kubernetes.container_image": "quay.io/prometheus/prometheus:v2.39.1",
        "kubernetes.container_name": "prometheus",
        "kubernetes.docker_id": "563f8f40062cd0188c11f39e89d47e6eacddb5624a8a93b39f77ec53b5c38bf5",
        "kubernetes.host": "ip-10-2-50-35.us-east-2.compute.internal",
        "kubernetes.labels.app.kubernetes.io/component": "prometheus",
        "kubernetes.labels.app.kubernetes.io/instance": "k8s",
        "kubernetes.labels.app.kubernetes.io/managed-by": "prometheus-operator",
        "kubernetes.labels.app.kubernetes.io/name": "prometheus",
        "kubernetes.labels.app.kubernetes.io/part-of": "kube-prometheus",
        "kubernetes.labels.app.kubernetes.io/version": "2.39.1",
        "kubernetes.labels.controller-revision-hash": "prometheus-k8s-5857d9766c",
        "kubernetes.labels.operator.prometheus.io/name": "k8s",
        "kubernetes.labels.operator.prometheus.io/shard": "0",
        "kubernetes.labels.prometheus": "k8s",
        "kubernetes.labels.statefulset.kubernetes.io/pod-name": "prometheus-k8s-1",
        "kubernetes.namespace_name": "monitoring",
        "kubernetes.pod_id": "ebdc171d-c891-495f-b4d6-e24711b70e64",
        "kubernetes.pod_name": "prometheus-k8s-1",
        "log": "ts=2022-12-27T14:09:59.212Z caller=klog.go:108 level=warn component=k8s_client_runtime func=Warningf msg=\"pkg/mod/k8s.io/client-go@v0.25.1/tools/cache/reflector.go:169: failed to list *v1.Pod: pods is forbidden: User \\\"system:serviceaccount:monitoring:prometheus-k8s\\\" cannot list resource \\\"pods\\\" in API group \\\"\\\" at the cluster scope\"",
        "stream": "stderr"
    }]`
    req, err := http.NewRequest("POST", "http://localhost:5080/api/default/quickstart1/_json", strings.NewReader(data))
    if err != nil {
        log.Fatal(err)
    }
    req.SetBasicAuth("root@example.com", "Complexpass#123")
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36")

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        log.Fatal(err)
    }
    defer resp.Body.Close()
    log.Println(resp.StatusCode)
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(string(body))
}
```
