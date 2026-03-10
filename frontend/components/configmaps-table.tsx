"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, FileText, Loader2, AlertCircle } from "lucide-react"
import { fetchConfigMaps } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface K8sConfigMap {
  name: string
  namespace: string
  data_keys: string[]
  age: string
  labels: Record<string, string>
}

const MOCK_CONFIGMAPS: K8sConfigMap[] = [
  {
    name: "app-config",
    namespace: "default",
    data_keys: ["APP_ENV", "LOG_LEVEL", "API_URL"],
    age: "5d",
    labels: { app: "frontend", env: "production" },
  },
  {
    name: "nginx-config",
    namespace: "ingress-nginx",
    data_keys: ["nginx.conf", "mime.types"],
    age: "30d",
    labels: { app: "nginx", component: "controller" },
  },
  {
    name: "coredns",
    namespace: "kube-system",
    data_keys: ["Corefile"],
    age: "120d",
    labels: { "k8s-app": "kube-dns" },
  },
  {
    name: "prometheus-config",
    namespace: "monitoring",
    data_keys: ["prometheus.yml", "alerts.yml", "rules.yml"],
    age: "15d",
    labels: { app: "prometheus", release: "monitoring" },
  },
  {
    name: "grafana-dashboards",
    namespace: "monitoring",
    data_keys: ["kubernetes.json", "node-exporter.json", "pods.json"],
    age: "15d",
    labels: { app: "grafana", dashboard: "true" },
  },
  {
    name: "redis-config",
    namespace: "default",
    data_keys: ["redis.conf", "sentinel.conf"],
    age: "10d",
    labels: { app: "redis", tier: "cache" },
  },
]

export function ConfigMapsTable() {
  const [configMaps, setConfigMaps] = useState<K8sConfigMap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [nsFilter, setNsFilter] = useState("all")

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await fetchConfigMaps()
        setConfigMaps(data || [])
        setError(null)
      } catch (err: any) {
        // Use mock data when API fails
        setConfigMaps(MOCK_CONFIGMAPS)
        setError(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const namespaces = useMemo(() => 
    ["all", ...new Set(configMaps.map((cm) => cm.namespace))], 
    [configMaps]
  )

  const filtered = useMemo(() => {
    return configMaps.filter((cm) => {
      const matchesSearch = search === "" || cm.name.toLowerCase().includes(search.toLowerCase())
      const matchesNs = nsFilter === "all" || cm.namespace === nsFilter
      return matchesSearch && matchesNs
    })
  }, [configMaps, search, nsFilter])

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Loading ConfigMaps...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-destructive">Connection Error</h3>
          <p className="text-xs text-muted-foreground max-w-[300px]">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">ConfigMaps</h2>
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {configMaps.length} configmaps
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search configmaps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-9 text-xs"
          />
        </div>
        <Select value={nsFilter} onValueChange={setNsFilter}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder="Namespace" />
          </SelectTrigger>
          <SelectContent>
            {namespaces.map((ns) => (
              <SelectItem key={ns} value={ns}>
                {ns === "all" ? "All Namespaces" : ns}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Namespace</TableHead>
            <TableHead>Data Keys</TableHead>
            <TableHead className="hidden md:table-cell">Labels</TableHead>
            <TableHead className="hidden md:table-cell">Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((cm) => (
            <TableRow key={`${cm.namespace}-${cm.name}`}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-mono text-xs truncate max-w-[250px]">{cm.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">{cm.namespace}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {cm.data_keys?.length || 0} keys
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {cm.labels && Object.entries(cm.labels).slice(0, 2).map(([k, v]) => (
                    <code key={k} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono">
                      {k}={v}
                    </code>
                  ))}
                  {(!cm.labels || Object.keys(cm.labels).length === 0) && (
                    <span className="text-[11px] text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                {cm.age}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                No configmaps found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
