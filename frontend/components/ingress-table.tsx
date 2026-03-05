"use client"

import { useState, useMemo } from "react"
import { Search, Globe, ShieldCheck, ShieldOff } from "lucide-react"
import { type K8sIngress } from "@/lib/k8s-data"
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

function KindBadge({ kind }: { kind: K8sIngress["kind"] }) {
  const colors: Record<K8sIngress["kind"], string> = {
    Ingress: "bg-chart-2/15 text-chart-2 border-chart-2/20",
    HTTPRoute: "bg-primary/15 text-primary border-primary/20",
  }
  return (
    <Badge variant="outline" className={`text-[10px] font-normal ${colors[kind]}`}>
      {kind}
    </Badge>
  )
}

export function IngressTable({
  ingresses,
  namespaces,
}: {
  ingresses: K8sIngress[]
  namespaces: string[]
}) {
  const [search, setSearch] = useState("")
  const [nsFilter, setNsFilter] = useState("all")
  const [kindFilter, setKindFilter] = useState("all")

  const filtered = useMemo(() => {
    return ingresses.filter((ing) => {
      const matchesSearch =
        search === "" ||
        ing.name.toLowerCase().includes(search.toLowerCase()) ||
        ing.hosts.some((h) => h.toLowerCase().includes(search.toLowerCase()))
      const matchesNs = nsFilter === "all" || ing.namespace === nsFilter
      const matchesKind = kindFilter === "all" || ing.kind === kindFilter
      return matchesSearch && matchesNs && matchesKind
    })
  }, [ingresses, search, nsFilter, kindFilter])

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Ingress / HTTPRoute</h2>
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {ingresses.length} routes shown
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or host..."
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
        <Select value={kindFilter} onValueChange={setKindFilter}>
          <SelectTrigger className="h-8 w-[140px] bg-secondary border-border text-xs text-foreground">
            <SelectValue placeholder="Kind" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Kinds</SelectItem>
            <SelectItem value="Ingress">Ingress</SelectItem>
            <SelectItem value="HTTPRoute">HTTPRoute</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Namespace</TableHead>
            <TableHead className="text-muted-foreground">Kind</TableHead>
            <TableHead className="text-muted-foreground">Hosts</TableHead>
            <TableHead className="text-muted-foreground hidden md:table-cell">Paths</TableHead>
            <TableHead className="text-muted-foreground hidden lg:table-cell">Class</TableHead>
            <TableHead className="text-muted-foreground">TLS</TableHead>
            <TableHead className="text-muted-foreground hidden lg:table-cell">Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((ing) => (
            <TableRow key={`${ing.namespace}-${ing.name}`} className="border-border">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-mono text-xs text-foreground truncate max-w-[180px]">{ing.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-border">
                  {ing.namespace}
                </Badge>
              </TableCell>
              <TableCell>
                <KindBadge kind={ing.kind} />
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  {ing.hosts.map((host) => (
                    <span key={host} className="font-mono text-xs text-foreground">
                      {host}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {ing.paths.map((p, i) => (
                    <code
                      key={i}
                      className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono"
                    >
                      {p.path} &rarr; {p.backend}:{p.port}
                    </code>
                  ))}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <code className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                  {ing.ingressClass}
                </code>
              </TableCell>
              <TableCell>
                {ing.tlsEnabled ? (
                  <span className="flex items-center gap-1.5 text-primary" title="TLS enabled">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="sr-only">TLS Enabled</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-warning" title="No TLS">
                    <ShieldOff className="h-3.5 w-3.5" />
                    <span className="sr-only">No TLS</span>
                  </span>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                {ing.age}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                No ingress/routes found matching your filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
