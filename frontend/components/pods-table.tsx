"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { fetchPods } from "@/lib/api"
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
import { useApiResource } from "@/hooks/use-api-resource"
import { ResourceErrorState, ResourceLoadingState } from "@/components/resource-state"

export interface K8sPod {
  name: string
  namespace: string
  status: string
  host_ip: string
  containers: number
  ready_containers: number
  node_name: string
  age: string
}

function PodStatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    Running: { variant: "default", className: "bg-primary/15 text-primary border-primary/20" },
    Pending: { variant: "outline", className: "bg-warning/15 text-warning border-warning/20" },
    Succeeded: { variant: "secondary", className: "bg-secondary text-muted-foreground" },
    Failed: { variant: "destructive", className: "bg-destructive/15 text-destructive border-destructive/20" },
    CrashLoopBackOff: { variant: "destructive", className: "bg-destructive/15 text-destructive border-destructive/20" },
    Terminating: { variant: "outline", className: "bg-warning/15 text-warning border-warning/20" },
    ImagePullBackOff: { variant: "destructive", className: "bg-destructive/15 text-destructive border-destructive/20" },
    ContainerCreating: { variant: "outline", className: "bg-chart-2/15 text-chart-2 border-chart-2/20" },
    Evicted: { variant: "destructive", className: "bg-destructive/10 text-destructive" },
  }

  const cfg = config[status] || { variant: "outline", className: "text-muted-foreground border-border" }
  
  return (
    <Badge variant={cfg.variant} className={cfg.className}>
      {status}
    </Badge>
  )
}

export function PodsTable() {
  const [search, setSearch] = useState("")
  const [nsFilter, setNsFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const { data, loading, error } = useApiResource<K8sPod[]>(fetchPods)
  const pods = data ?? []

  const namespaces = useMemo(() => ["all", ...new Set(pods.map((p) => p.namespace))], [pods])
  const statuses = useMemo(() => ["all", ...new Set(pods.map((p) => p.status))], [pods])

  const filtered = useMemo(() => {
    return pods.filter((pod) => {
      const matchesSearch = search === "" || pod.name.toLowerCase().includes(search.toLowerCase())
      const matchesNs = nsFilter === "all" || pod.namespace === nsFilter
      const matchesStatus = statusFilter === "all" || pod.status === statusFilter
      return matchesSearch && matchesNs && matchesStatus
    })
  }, [pods, search, nsFilter, statusFilter])

  if (loading) {
    return <ResourceLoadingState message="Connecting to Cluster..." />
  }

  if (error) {
    return <ResourceErrorState message={error} />
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Pods</h2>
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {pods.length} pods shown
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-9 bg-secondary border-border text-foreground text-xs placeholder:text-muted-foreground"
          />
        </div>
        
        <Select value={nsFilter} onValueChange={setNsFilter}>
          <SelectTrigger className="h-8 w-[160px] bg-secondary border-border text-xs text-foreground">
            <SelectValue placeholder="Namespace" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {namespaces.map((ns) => (
              <SelectItem key={ns} value={ns}>
                {ns === "all" ? "All Namespaces" : ns}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[160px] bg-secondary border-border text-xs text-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All Statuses" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Namespace</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Ready</TableHead>
            <TableHead className="text-muted-foreground hidden md:table-cell">Node</TableHead>
            <TableHead className="text-muted-foreground hidden lg:table-cell">Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((pod) => (
            <TableRow key={`${pod.namespace}-${pod.name}`} className="border-border">
              <TableCell className="max-w-[280px] truncate font-mono text-xs text-foreground">
                {pod.name}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-border">
                  {pod.namespace}
                </Badge>
              </TableCell>
              <TableCell>
                <PodStatusBadge status={pod.status} />
              </TableCell>
              <TableCell className="text-xs text-foreground">
                {pod.ready_containers}/{pod.containers}
              </TableCell>
              <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                {pod.node_name ? pod.node_name.replace("node-", "") : "-"}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                {pod.age}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                No pods found matching your filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
