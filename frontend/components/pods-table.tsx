"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { type K8sPod } from "@/lib/k8s-data"
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

function PodStatusBadge({ status }: { status: K8sPod["status"] }) {
  const config: Record<K8sPod["status"], { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    Running: { variant: "default", className: "bg-primary/15 text-primary border-primary/20" },
    Pending: { variant: "outline", className: "bg-warning/15 text-warning border-warning/20" },
    Succeeded: { variant: "secondary", className: "bg-secondary text-muted-foreground" },
    Failed: { variant: "destructive", className: "bg-destructive/15 text-destructive border-destructive/20" },
    CrashLoopBackOff: { variant: "destructive", className: "bg-destructive/15 text-destructive border-destructive/20" },
    Terminating: { variant: "outline", className: "bg-warning/15 text-warning border-warning/20" },
    ImagePullBackOff: { variant: "destructive", className: "bg-destructive/15 text-destructive border-destructive/20" },
    ContainerCreating: { variant: "outline", className: "bg-chart-2/15 text-chart-2 border-chart-2/20" },
  }

  const cfg = config[status]
  return (
    <Badge variant={cfg.variant} className={cfg.className}>
      {status}
    </Badge>
  )
}

export function PodsTable({
  pods,
  namespaces,
}: {
  pods: K8sPod[]
  namespaces: string[]
}) {
  const [search, setSearch] = useState("")
  const [nsFilter, setNsFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = useMemo(() => {
    return pods.filter((pod) => {
      const matchesSearch =
        search === "" || pod.name.toLowerCase().includes(search.toLowerCase())
      const matchesNs = nsFilter === "all" || pod.namespace === nsFilter
      const matchesStatus = statusFilter === "all" || pod.status === statusFilter
      return matchesSearch && matchesNs && matchesStatus
    })
  }, [pods, search, nsFilter, statusFilter])

  const statuses = [...new Set(pods.map((p) => p.status))]

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
            <SelectItem value="all">All Namespaces</SelectItem>
            {namespaces.sort().map((ns) => (
              <SelectItem key={ns} value={ns}>
                {ns}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[160px] bg-secondary border-border text-xs text-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
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
            <TableHead className="text-muted-foreground hidden sm:table-cell">Restarts</TableHead>
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
                {pod.readyContainers}/{pod.containers}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <span className={`text-xs ${pod.restarts > 5 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  {pod.restarts}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                {pod.node.replace("node-", "")}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                {pod.age}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                No pods found matching your filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
