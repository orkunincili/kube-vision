export interface NodeInfo {
  name: string
  status: string
  roles: string[]
  kubelet_version: string
  os: string
  cri: string
  pod_count: number
  cpu_capacity?: string
  memory_capacity?: string
  cpu_usage_percent?: number
  mem_usage_percent?: number
}

export interface SummaryData {
  totalPods: number
  runningPods: number
  pendingPods: number
  failedPods: number
  totalNodes: number
  readyNodes: number
  node: NodeInfo[]
  namespaces: string[]
  totalServices: number
  totalIngresses: number
  totalConfigMaps: number
}

export interface PodInfo {
  name: string
  namespace: string
  status: string
  host_ip: string
  containers: number
  ready_containers: number
  node_name: string
  age: string
}

export interface DeploymentInfo {
  name: string
  namespace: string
  desired_replicas: number
  ready_replicas: number
  available_replicas: number
}

export interface ServiceInfo {
  name: string
  namespace: string
  type: string
  ports: string
  cluster_ip: string
  external_ip: string
}

export interface IngressInfo {
  name: string
  namespace: string
  hosts: string[]
  endpoints: string[]
  address_source: string
  kind?: string
  class_name?: string
  age?: string
  tls_enabled?: boolean
}

export interface ConfigMapInfo {
  name: string
  namespace: string
  data_keys: string[]
  age: string
  labels: Record<string, string>
}
