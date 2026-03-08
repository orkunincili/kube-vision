"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Network, Loader2, AlertCircle } from "lucide-react"
import { fetchServices } from "@/lib/api" // api.ts içindeki fonksiyonu çağırıyoruz
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

export interface K8sService {
  name: string
  namespace: string
  type: string
  ports: string
  cluster_ip: string
  external_ip: string
}

function ServiceTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    ClusterIP: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    NodePort: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    LoadBalancer: "bg-green-500/10 text-green-500 border-green-500/20",
    ExternalName: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  }
  return (
    <Badge variant="outline" className={`text-[10px] font-normal ${colors[type] || "text-muted-foreground"}`}>
      {type}
    </Badge>
  )
}

export function ServicesTable() {
  const [services, setServices] = useState<K8sService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [nsFilter, setNsFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // API'den veri çekme işlemi
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true)
        const data = await fetchServices()
        setServices(data)
        setError(null)
      } catch (err: any) {
        console.error("Service fetch error:", err)
        setError(err.message || "Failed to fetch services")
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  // Dinamik filtre seçenekleri
  const namespaces = useMemo(() => ["all", ...new Set(services.map((s) => s.namespace))], [services])
  const types = useMemo(() => ["all", ...new Set(services.map((s) => s.type))], [services])

  const filtered = useMemo(() => {
    return services.filter((svc) => {
      const matchesSearch = search === "" || svc.name.toLowerCase().includes(search.toLowerCase())
      const matchesNs = nsFilter === "all" || svc.namespace === nsFilter
      const matchesType = typeFilter === "all" || svc.type === typeFilter
      return matchesSearch && matchesNs && matchesType
    })
  }, [services, search, nsFilter, typeFilter])

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs">Fetching Services...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-destructive">API Error</h3>
          <p className="text-xs text-muted-foreground max-w-[300px]">{error}</p>
        </div>
      </div>
    )
  }

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
            className="h-8 pl-9 bg-secondary border-border text-foreground text-xs"
          />
        </div>
        
        <Select value={nsFilter} onValueChange={setNsFilter}>
          <SelectTrigger className="h-8 w-[140px] bg-secondary border-border text-xs">
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

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[140px] bg-secondary border-border text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "all" ? "All Types" : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground text-[11px] uppercase tracking-wider">Name</TableHead>
            <TableHead className="text-muted-foreground text-[11px] uppercase tracking-wider">Namespace</TableHead>
            <TableHead className="text-muted-foreground text-[11px] uppercase tracking-wider">Type</TableHead>
            <TableHead className="text-muted-foreground text-[11px] uppercase tracking-wider">Cluster IP</TableHead>
            <TableHead className="text-muted-foreground text-[11px] uppercase tracking-wider">Ports</TableHead>
            <TableHead className="text-muted-foreground text-[11px] uppercase tracking-wider hidden md:table-cell">External IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((svc) => (
            <TableRow key={`${svc.namespace}-${svc.name}`} className="border-border">
              <TableCell className="font-medium text-xs">
                <div className="flex items-center gap-2">
                  <Network className="h-3.5 w-3.5 text-muted-foreground" />
                  {svc.name}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px] font-normal border-border">
                    {svc.namespace}
                </Badge>
              </TableCell>
              <TableCell>
                <ServiceTypeBadge type={svc.type} />
              </TableCell>
              <TableCell className="font-mono text-[11px] text-foreground">
                {svc.cluster_ip}
              </TableCell>
              <TableCell className="font-mono text-[11px] text-foreground">
                {/* Obje hatasını önlemek için güvenli render */}
                {typeof svc.ports === "string" ? svc.ports : JSON.stringify(svc.ports)}
              </TableCell>
              <TableCell className="hidden md:table-cell font-mono text-[11px]">
                <span className={svc.external_ip === "None" ? "text-muted-foreground/40" : "text-primary font-medium"}>
                  {svc.external_ip}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}