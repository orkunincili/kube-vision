import type {
  ConfigMapInfo,
  DeploymentInfo,
  IngressInfo,
  NodeInfo,
  PodInfo,
  SecretInfo,
  ServiceInfo,
  SummaryData,
} from "@/lib/types"

function getBaseUrl() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL
  if (!base) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL missing")
  }
  return base
}

async function fetchFromApi<T>(path: string, errorLabel: string) {
  const res = await fetch(`${getBaseUrl()}${path}`, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`${errorLabel} fetch failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function fetchNodes(): Promise<NodeInfo[]> {
  return fetchFromApi("/nodes", "nodes")
}

export function fetchPods(): Promise<PodInfo[]> {
  return fetchFromApi("/pods", "pods")
}

export function fetchDeployments(): Promise<DeploymentInfo[]> {
  return fetchFromApi("/deployments", "deployments")
}

export function fetchServices(): Promise<ServiceInfo[]> {
  return fetchFromApi("/services", "services")
}

export function fetchIngresses(): Promise<IngressInfo[]> {
  return fetchFromApi("/ingresses", "ingresses")
}

export function fetchConfigMaps(): Promise<ConfigMapInfo[]> {
  return fetchFromApi("/configmaps", "configmaps")
}

export function fetchSecrets(): Promise<SecretInfo[]> {
  return fetchFromApi("/secrets", "secrets")
}

export async function fetchSummary(): Promise<SummaryData> {
  const data = await fetchFromApi<any>("/summary", "summary")
  const getStatus = (statusName: string) => data.pod_status?.[statusName] || 0

  return {
    totalPods: data.pod_count || 0,
    runningPods: getStatus("Running"),
    pendingPods: getStatus("Pending"),
    failedPods:
      getStatus("Failed") +
      getStatus("Error") +
      getStatus("ImagePullBackOff") +
      getStatus("CrashLoopBackOff") +
      getStatus("ErrImagePull") +
      getStatus("CreateContainerConfigError"),
    totalNodes: data.node?.length || 0,
    readyNodes: data.node?.filter((node: { status: string }) => node.status === "Ready").length || 0,
    node: data.node || [],
    namespaces: data.namespaces || [],
    totalServices: data.service_count || 0,
    totalIngresses: data.ingress_count || 0,
    totalConfigMaps: data.configmap_count || 0,
    totalSecrets: data.secret_count || 0,
  }
}
