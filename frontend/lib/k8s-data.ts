export type NodeStatus = "Ready" | "NotReady" | "Unknown"

export interface K8sNode {
  name: string
  status: NodeStatus
  roles: string[]
  kubeletVersion: string
  criName: string
  criVersion: string
  os: string
  arch: string
  podCount: number
}

export interface K8sPod {
  name: string
  namespace: string
  status: "Running" | "Pending" | "Succeeded" | "Failed" | "CrashLoopBackOff" | "Terminating" | "ImagePullBackOff" | "ContainerCreating"
  restarts: number
  node: string
  age: string
  containers: number
  readyContainers: number
}

export interface K8sSecret {
  name: string
  namespace: string
  type: string
  dataKeys: string[]
  age: string
  labels: Record<string, string>
}

export interface K8sConfigMap {
  name: string
  namespace: string
  dataKeys: string[]
  age: string
  labels: Record<string, string>
}

export interface K8sService {
  name: string
  namespace: string
  type: "ClusterIP" | "NodePort" | "LoadBalancer" | "ExternalName"
  ports: { port: number; targetPort: number | string; protocol: string; nodePort?: number }[]
  selector: Record<string, string>
  age: string
}

export interface K8sIngress {
  name: string
  namespace: string
  kind: "Ingress" | "HTTPRoute"
  hosts: string[]
  paths: { path: string; backend: string; port: number }[]
  tlsEnabled: boolean
  ingressClass: string
  age: string
}

// ---- NODES ----
export const nodes: K8sNode[] = [
  {
    name: "node-master-01",
    status: "Ready",
    roles: ["control-plane", "master"],
    kubeletVersion: "v1.29.2",
    criName: "containerd",
    criVersion: "1.7.13",
    os: "Ubuntu 22.04.3 LTS",
    arch: "amd64",
    podCount: 28,
  },
  {
    name: "node-worker-01",
    status: "Ready",
    roles: ["worker"],
    kubeletVersion: "v1.29.2",
    criName: "containerd",
    criVersion: "1.7.13",
    os: "Ubuntu 22.04.3 LTS",
    arch: "amd64",
    podCount: 35,
  },
  {
    name: "node-worker-02",
    status: "Ready",
    roles: ["worker"],
    kubeletVersion: "v1.29.2",
    criName: "containerd",
    criVersion: "1.7.13",
    os: "Ubuntu 22.04.3 LTS",
    arch: "amd64",
    podCount: 31,
  },
  {
    name: "node-worker-03",
    status: "NotReady",
    roles: ["worker"],
    kubeletVersion: "v1.28.5",
    criName: "cri-o",
    criVersion: "1.28.3",
    os: "Ubuntu 22.04.3 LTS",
    arch: "amd64",
    podCount: 12,
  },
  {
    name: "node-worker-04",
    status: "Ready",
    roles: ["worker", "gpu"],
    kubeletVersion: "v1.29.2",
    criName: "containerd",
    criVersion: "1.7.13",
    os: "Ubuntu 22.04.3 LTS",
    arch: "amd64",
    podCount: 18,
  },
]

// ---- PODS ----
export const pods: K8sPod[] = [
  { name: "nginx-deployment-7c5b8d6f4-x2k9p", namespace: "default", status: "Running", restarts: 0, node: "node-worker-01", age: "3d", containers: 1, readyContainers: 1 },
  { name: "nginx-deployment-7c5b8d6f4-m8j3n", namespace: "default", status: "Running", restarts: 0, node: "node-worker-02", age: "3d", containers: 1, readyContainers: 1 },
  { name: "nginx-deployment-7c5b8d6f4-p5t7q", namespace: "default", status: "Running", restarts: 0, node: "node-worker-01", age: "3d", containers: 1, readyContainers: 1 },
  { name: "redis-master-0", namespace: "cache", status: "Running", restarts: 1, node: "node-worker-02", age: "7d", containers: 1, readyContainers: 1 },
  { name: "redis-replica-0", namespace: "cache", status: "Running", restarts: 0, node: "node-worker-01", age: "7d", containers: 1, readyContainers: 1 },
  { name: "redis-replica-1", namespace: "cache", status: "Running", restarts: 0, node: "node-worker-04", age: "7d", containers: 1, readyContainers: 1 },
  { name: "api-gateway-5f8d9c7b6-r4k2m", namespace: "ingress", status: "Running", restarts: 0, node: "node-worker-01", age: "12h", containers: 2, readyContainers: 2 },
  { name: "api-gateway-5f8d9c7b6-t6n8p", namespace: "ingress", status: "Running", restarts: 0, node: "node-worker-02", age: "12h", containers: 2, readyContainers: 2 },
  { name: "postgres-primary-0", namespace: "database", status: "Running", restarts: 0, node: "node-worker-04", age: "14d", containers: 2, readyContainers: 2 },
  { name: "postgres-replica-0", namespace: "database", status: "Running", restarts: 0, node: "node-worker-02", age: "14d", containers: 2, readyContainers: 2 },
  { name: "auth-service-6d9f8c4b5-w3j7k", namespace: "auth", status: "Running", restarts: 2, node: "node-worker-01", age: "2d", containers: 1, readyContainers: 1 },
  { name: "auth-service-6d9f8c4b5-q9m2n", namespace: "auth", status: "CrashLoopBackOff", restarts: 15, node: "node-worker-03", age: "2d", containers: 1, readyContainers: 0 },
  { name: "monitoring-prometheus-0", namespace: "monitoring", status: "Running", restarts: 0, node: "node-worker-04", age: "21d", containers: 3, readyContainers: 3 },
  { name: "monitoring-grafana-7b8c9d6f5-h4k6m", namespace: "monitoring", status: "Running", restarts: 0, node: "node-worker-02", age: "21d", containers: 1, readyContainers: 1 },
  { name: "monitoring-alertmanager-0", namespace: "monitoring", status: "Running", restarts: 0, node: "node-worker-01", age: "21d", containers: 1, readyContainers: 1 },
  { name: "coredns-5d78c9689-x7k2p", namespace: "kube-system", status: "Running", restarts: 0, node: "node-master-01", age: "30d", containers: 1, readyContainers: 1 },
  { name: "coredns-5d78c9689-n3m8q", namespace: "kube-system", status: "Running", restarts: 0, node: "node-master-01", age: "30d", containers: 1, readyContainers: 1 },
  { name: "etcd-node-master-01", namespace: "kube-system", status: "Running", restarts: 0, node: "node-master-01", age: "30d", containers: 1, readyContainers: 1 },
  { name: "kube-apiserver-node-master-01", namespace: "kube-system", status: "Running", restarts: 0, node: "node-master-01", age: "30d", containers: 1, readyContainers: 1 },
  { name: "kube-scheduler-node-master-01", namespace: "kube-system", status: "Running", restarts: 0, node: "node-master-01", age: "30d", containers: 1, readyContainers: 1 },
  { name: "ml-training-job-8f7d6c5b4-z2x9w", namespace: "ml", status: "Running", restarts: 0, node: "node-worker-04", age: "6h", containers: 1, readyContainers: 1 },
  { name: "ml-inference-api-3c4d5e6f7-k8m2n", namespace: "ml", status: "Pending", restarts: 0, node: "node-worker-03", age: "1h", containers: 1, readyContainers: 0 },
  { name: "cert-manager-7d8e9f0a1-p3q5r", namespace: "cert-manager", status: "Running", restarts: 0, node: "node-worker-01", age: "14d", containers: 1, readyContainers: 1 },
  { name: "log-collector-fluentd-ds-node1", namespace: "logging", status: "Running", restarts: 0, node: "node-worker-01", age: "10d", containers: 1, readyContainers: 1 },
  { name: "log-collector-fluentd-ds-node2", namespace: "logging", status: "Running", restarts: 0, node: "node-worker-02", age: "10d", containers: 1, readyContainers: 1 },
  { name: "batch-processor-9e8d7c6b5-a1s2d", namespace: "default", status: "Succeeded", restarts: 0, node: "node-worker-02", age: "4h", containers: 1, readyContainers: 0 },
  { name: "frontend-app-8b7c6d5e4-v9w3x", namespace: "default", status: "ImagePullBackOff", restarts: 3, node: "node-worker-01", age: "45m", containers: 1, readyContainers: 0 },
  { name: "cronjob-cleanup-28473920-k2m4n", namespace: "default", status: "ContainerCreating", restarts: 0, node: "node-worker-02", age: "2m", containers: 1, readyContainers: 0 },
]

// ---- SECRETS ----
export const secrets: K8sSecret[] = [
  { name: "default-token-x7k2p", namespace: "default", type: "kubernetes.io/service-account-token", dataKeys: ["ca.crt", "namespace", "token"], age: "30d", labels: {} },
  { name: "nginx-tls-cert", namespace: "default", type: "kubernetes.io/tls", dataKeys: ["tls.crt", "tls.key"], age: "14d", labels: { app: "nginx" } },
  { name: "redis-auth", namespace: "cache", type: "Opaque", dataKeys: ["password", "sentinel-password"], age: "7d", labels: { app: "redis" } },
  { name: "postgres-credentials", namespace: "database", type: "Opaque", dataKeys: ["username", "password", "connection-string", "replication-password"], age: "14d", labels: { app: "postgres" } },
  { name: "api-gateway-tls", namespace: "ingress", type: "kubernetes.io/tls", dataKeys: ["tls.crt", "tls.key", "ca.crt"], age: "7d", labels: { app: "api-gateway" } },
  { name: "oauth2-client-secret", namespace: "auth", type: "Opaque", dataKeys: ["client-id", "client-secret", "cookie-secret"], age: "21d", labels: { app: "auth-service" } },
  { name: "jwt-signing-key", namespace: "auth", type: "Opaque", dataKeys: ["private-key", "public-key"], age: "21d", labels: { app: "auth-service" } },
  { name: "grafana-admin", namespace: "monitoring", type: "Opaque", dataKeys: ["admin-user", "admin-password"], age: "21d", labels: { app: "grafana" } },
  { name: "alertmanager-config", namespace: "monitoring", type: "Opaque", dataKeys: ["alertmanager.yaml", "slack-webhook-url"], age: "21d", labels: { app: "alertmanager" } },
  { name: "prometheus-etcd-certs", namespace: "monitoring", type: "Opaque", dataKeys: ["etcd-ca.crt", "etcd-client.crt", "etcd-client.key"], age: "30d", labels: { app: "prometheus" } },
  { name: "registry-pull-secret", namespace: "default", type: "kubernetes.io/dockerconfigjson", dataKeys: [".dockerconfigjson"], age: "30d", labels: { type: "registry" } },
  { name: "ml-model-credentials", namespace: "ml", type: "Opaque", dataKeys: ["aws-access-key", "aws-secret-key", "s3-bucket"], age: "6d", labels: { app: "ml-training" } },
  { name: "cert-manager-webhook-ca", namespace: "cert-manager", type: "Opaque", dataKeys: ["ca.crt", "tls.crt", "tls.key"], age: "14d", labels: { app: "cert-manager" } },
  { name: "elasticsearch-credentials", namespace: "logging", type: "Opaque", dataKeys: ["username", "password", "es-url"], age: "10d", labels: { app: "fluentd" } },
  { name: "cluster-wildcard-tls", namespace: "ingress", type: "kubernetes.io/tls", dataKeys: ["tls.crt", "tls.key"], age: "3d", labels: { domain: "*.cluster.local" } },
]

// ---- CONFIGMAPS ----
export const configMaps: K8sConfigMap[] = [
  { name: "coredns", namespace: "kube-system", dataKeys: ["Corefile"], age: "30d", labels: { "k8s-app": "kube-dns" } },
  { name: "kube-proxy", namespace: "kube-system", dataKeys: ["config.conf", "kubeconfig.conf"], age: "30d", labels: { app: "kube-proxy" } },
  { name: "kubeadm-config", namespace: "kube-system", dataKeys: ["ClusterConfiguration", "ClusterStatus"], age: "30d", labels: {} },
  { name: "kubelet-config", namespace: "kube-system", dataKeys: ["kubelet"], age: "30d", labels: {} },
  { name: "nginx-config", namespace: "default", dataKeys: ["nginx.conf", "mime.types", "default.conf"], age: "3d", labels: { app: "nginx" } },
  { name: "redis-config", namespace: "cache", dataKeys: ["redis.conf", "sentinel.conf"], age: "7d", labels: { app: "redis" } },
  { name: "postgres-init-scripts", namespace: "database", dataKeys: ["init.sql", "create-extensions.sql", "seed-data.sql"], age: "14d", labels: { app: "postgres" } },
  { name: "api-gateway-routes", namespace: "ingress", dataKeys: ["routes.yaml", "rate-limits.yaml", "cors-config.yaml"], age: "12h", labels: { app: "api-gateway" } },
  { name: "auth-config", namespace: "auth", dataKeys: ["config.yaml", "providers.yaml"], age: "2d", labels: { app: "auth-service" } },
  { name: "prometheus-config", namespace: "monitoring", dataKeys: ["prometheus.yml", "alerting-rules.yml", "recording-rules.yml"], age: "21d", labels: { app: "prometheus" } },
  { name: "grafana-dashboards", namespace: "monitoring", dataKeys: ["cluster-overview.json", "node-exporter.json", "pod-metrics.json", "networking.json"], age: "21d", labels: { app: "grafana" } },
  { name: "grafana-datasources", namespace: "monitoring", dataKeys: ["datasources.yaml"], age: "21d", labels: { app: "grafana" } },
  { name: "alertmanager-templates", namespace: "monitoring", dataKeys: ["slack.tmpl", "email.tmpl"], age: "21d", labels: { app: "alertmanager" } },
  { name: "fluentd-config", namespace: "logging", dataKeys: ["fluent.conf", "kubernetes.conf", "output.conf"], age: "10d", labels: { app: "fluentd" } },
  { name: "ml-pipeline-config", namespace: "ml", dataKeys: ["pipeline.yaml", "hyperparams.json", "feature-config.yaml"], age: "6h", labels: { app: "ml-training" } },
  { name: "cert-manager-config", namespace: "cert-manager", dataKeys: ["config.yaml"], age: "14d", labels: { app: "cert-manager" } },
  { name: "cluster-info", namespace: "kube-public", dataKeys: ["kubeconfig"], age: "30d", labels: {} },
  { name: "istio-mesh", namespace: "istio-system", dataKeys: ["mesh", "meshNetworks"], age: "15d", labels: { app: "istiod" } },
]

// ---- SERVICES ----
export const services: K8sService[] = [
  { name: "kubernetes", namespace: "default", type: "ClusterIP", ports: [{ port: 443, targetPort: 6443, protocol: "TCP" }], selector: {}, age: "30d" },
  { name: "nginx-service", namespace: "default", type: "LoadBalancer", ports: [{ port: 80, targetPort: 8080, protocol: "TCP" }, { port: 443, targetPort: 8443, protocol: "TCP" }], selector: { app: "nginx" }, age: "3d" },
  { name: "redis-master", namespace: "cache", type: "ClusterIP", ports: [{ port: 6379, targetPort: 6379, protocol: "TCP" }], selector: { app: "redis", role: "master" }, age: "7d" },
  { name: "redis-replica", namespace: "cache", type: "ClusterIP", ports: [{ port: 6379, targetPort: 6379, protocol: "TCP" }], selector: { app: "redis", role: "replica" }, age: "7d" },
  { name: "redis-sentinel", namespace: "cache", type: "ClusterIP", ports: [{ port: 26379, targetPort: 26379, protocol: "TCP" }], selector: { app: "redis", role: "sentinel" }, age: "7d" },
  { name: "api-gateway", namespace: "ingress", type: "LoadBalancer", ports: [{ port: 80, targetPort: 8080, protocol: "TCP" }, { port: 443, targetPort: 8443, protocol: "TCP" }], selector: { app: "api-gateway" }, age: "12h" },
  { name: "postgres-primary", namespace: "database", type: "ClusterIP", ports: [{ port: 5432, targetPort: 5432, protocol: "TCP" }], selector: { app: "postgres", role: "primary" }, age: "14d" },
  { name: "postgres-replica", namespace: "database", type: "ClusterIP", ports: [{ port: 5432, targetPort: 5432, protocol: "TCP" }], selector: { app: "postgres", role: "replica" }, age: "14d" },
  { name: "auth-service", namespace: "auth", type: "ClusterIP", ports: [{ port: 8080, targetPort: 8080, protocol: "TCP" }, { port: 9090, targetPort: 9090, protocol: "TCP" }], selector: { app: "auth-service" }, age: "2d" },
  { name: "prometheus", namespace: "monitoring", type: "ClusterIP", ports: [{ port: 9090, targetPort: 9090, protocol: "TCP" }], selector: { app: "prometheus" }, age: "21d" },
  { name: "grafana", namespace: "monitoring", type: "NodePort", ports: [{ port: 3000, targetPort: 3000, protocol: "TCP", nodePort: 30300 }], selector: { app: "grafana" }, age: "21d" },
  { name: "alertmanager", namespace: "monitoring", type: "ClusterIP", ports: [{ port: 9093, targetPort: 9093, protocol: "TCP" }], selector: { app: "alertmanager" }, age: "21d" },
  { name: "kube-dns", namespace: "kube-system", type: "ClusterIP", ports: [{ port: 53, targetPort: 53, protocol: "UDP" }, { port: 53, targetPort: 53, protocol: "TCP" }, { port: 9153, targetPort: 9153, protocol: "TCP" }], selector: { "k8s-app": "kube-dns" }, age: "30d" },
  { name: "elasticsearch", namespace: "logging", type: "ClusterIP", ports: [{ port: 9200, targetPort: 9200, protocol: "TCP" }, { port: 9300, targetPort: 9300, protocol: "TCP" }], selector: { app: "elasticsearch" }, age: "10d" },
  { name: "ml-inference-api", namespace: "ml", type: "ClusterIP", ports: [{ port: 8000, targetPort: 8000, protocol: "TCP" }], selector: { app: "ml-inference" }, age: "1h" },
  { name: "frontend-app", namespace: "default", type: "ClusterIP", ports: [{ port: 3000, targetPort: 3000, protocol: "TCP" }], selector: { app: "frontend" }, age: "45m" },
]

// ---- INGRESS / HTTPROUTE ----
export const ingresses: K8sIngress[] = [
  { name: "nginx-ingress", namespace: "default", kind: "Ingress", hosts: ["app.example.com"], paths: [{ path: "/", backend: "nginx-service", port: 80 }], tlsEnabled: true, ingressClass: "nginx", age: "3d" },
  { name: "api-ingress", namespace: "ingress", kind: "Ingress", hosts: ["api.example.com"], paths: [{ path: "/v1", backend: "api-gateway", port: 80 }, { path: "/v2", backend: "api-gateway", port: 80 }], tlsEnabled: true, ingressClass: "nginx", age: "12h" },
  { name: "grafana-ingress", namespace: "monitoring", kind: "Ingress", hosts: ["grafana.internal.example.com"], paths: [{ path: "/", backend: "grafana", port: 3000 }], tlsEnabled: true, ingressClass: "nginx", age: "21d" },
  { name: "prometheus-ingress", namespace: "monitoring", kind: "Ingress", hosts: ["prometheus.internal.example.com"], paths: [{ path: "/", backend: "prometheus", port: 9090 }], tlsEnabled: false, ingressClass: "nginx", age: "21d" },
  { name: "auth-httproute", namespace: "auth", kind: "HTTPRoute", hosts: ["auth.example.com"], paths: [{ path: "/login", backend: "auth-service", port: 8080 }, { path: "/callback", backend: "auth-service", port: 8080 }, { path: "/logout", backend: "auth-service", port: 8080 }], tlsEnabled: true, ingressClass: "istio", age: "2d" },
  { name: "ml-api-httproute", namespace: "ml", kind: "HTTPRoute", hosts: ["ml.example.com"], paths: [{ path: "/predict", backend: "ml-inference-api", port: 8000 }, { path: "/health", backend: "ml-inference-api", port: 8000 }], tlsEnabled: true, ingressClass: "istio", age: "1h" },
  { name: "frontend-httproute", namespace: "default", kind: "HTTPRoute", hosts: ["www.example.com", "example.com"], paths: [{ path: "/", backend: "frontend-app", port: 3000 }], tlsEnabled: true, ingressClass: "istio", age: "45m" },
  { name: "kibana-ingress", namespace: "logging", kind: "Ingress", hosts: ["kibana.internal.example.com"], paths: [{ path: "/", backend: "kibana", port: 5601 }], tlsEnabled: false, ingressClass: "nginx", age: "10d" },
]

// ---- HELPERS ----
export function getClusterSummary() {
  const totalPods = pods.length
  const runningPods = pods.filter((p) => p.status === "Running").length
  const pendingPods = pods.filter((p) => p.status === "Pending").length
  const failedPods = pods.filter((p) => p.status === "Failed" || p.status === "CrashLoopBackOff" || p.status === "ImagePullBackOff").length
  const totalNodes = nodes.length
  const readyNodes = nodes.filter((n) => n.status === "Ready").length
  const totalSecrets = secrets.length
  const totalConfigMaps = configMaps.length
  const totalServices = services.length
  const totalIngresses = ingresses.length
  const namespaces = [...new Set([
    ...pods.map((p) => p.namespace),
    ...secrets.map((s) => s.namespace),
    ...configMaps.map((c) => c.namespace),
    ...services.map((s) => s.namespace),
    ...ingresses.map((i) => i.namespace),
  ])]

  return {
    totalPods,
    runningPods,
    pendingPods,
    failedPods,
    totalNodes,
    readyNodes,
    totalSecrets,
    totalConfigMaps,
    totalServices,
    totalIngresses,
    namespaces,
  }
}

export function getPodDistribution() {
  const distribution: Record<string, { total: number; running: number; other: number }> = {}
  for (const node of nodes) {
    distribution[node.name] = { total: 0, running: 0, other: 0 }
  }
  for (const pod of pods) {
    if (distribution[pod.node]) {
      distribution[pod.node].total++
      if (pod.status === "Running") {
        distribution[pod.node].running++
      } else {
        distribution[pod.node].other++
      }
    }
  }
  return distribution
}
