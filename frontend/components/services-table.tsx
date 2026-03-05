"use client"

import { useState, useMemo } from "react"
import { Search, Network } from "lucide-react"
import { type K8sService } from "@/lib/k8s-data"
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

function ServiceTypeBadge({ type }: { type: K8sService["type"] }) {
  const colors: Record<K8sService["type"], string> = {
    ClusterIP: "bg-chart-2/15 text-chart-2 border-chart-2/20",
    NodePort: "bg-warning/15 text-warning border-warning/20",
    LoadBalancer: "bg-primary/15 text-primary border-primary/20",
    ExternalName: "bg-chart-4/15 text-chart-4 border-chart-4/20",
  }
  return (
    <Badge variant="outline" className={`text-[10px] font-normal ${colors[type]}`}>
      {type}
    </Badge>
  )
}

export function ServicesTable({
  services,
  namespaces,
}: {
  services: K8sService[]
  namespaces: string[]
}) {
  const [search, setSearch] = useState("")
  const [nsFilter, setNsFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filtered = useMemo(() => {
    return services.filter((svc) => {
      const matchesSearch =
        search === "" || svc.name.toLowerCase().includes(search.toLowerCase())
      const matchesNs = nsFilter === "all" || svc.namespace === nsFilter
      const matchesType = typeFilter === "all" || svc.type === typeFilter
      return matchesSearch && matchesNs && matchesType
    })
  }, [services, search, nsFilter, typeFilter])

  const types = [...new Set(services.map((s) => s.type))]

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Services</h2>
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {services.length} services shown
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services..."
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[160px] bg-secondary border-border text-xs text-foreground">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Types</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
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
            <TableHead className="text-muted-foreground">Type</TableHead>
            <TableHead className="text-muted-foreground">Ports</TableHead>
            <TableHead className="text-muted-foreground hidden md:table-cell">Selector</TableHead>
            <TableHead className="text-muted-foreground hidden lg:table-cell">Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((svc) => (
            <TableRow key={`${svc.namespace}-${svc.name}`} className="border-border">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Network className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-mono text-xs text-foreground truncate max-w-[200px]">{svc.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-border">
                  {svc.namespace}
                </Badge>
              </TableCell>
              <TableCell>
                <ServiceTypeBadge type={svc.type} />
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {svc.ports.map((p, i) => (
                    <code
                      key={i}
                      className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-foreground font-mono"
                    >
                      {p.port}{p.nodePort ? `:${p.nodePort}` : ""}/{p.protocol}
                    </code>
                  ))}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(svc.selector).slice(0, 2).map(([k, v]) => (
                    <code
                      key={k}
                      className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono"
                    >
                      {k}={v}
                    </code>
                  ))}
                  {Object.keys(svc.selector).length === 0 && (
                    <span className="text-[11px] text-muted-foreground">-</span>
                  )}
                  {Object.keys(svc.selector).length > 2 && (
                    <span className="text-[10px] text-muted-foreground">+{Object.keys(svc.selector).length - 2}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                {svc.age}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                No services found matching your filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
