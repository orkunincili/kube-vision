"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Globe, ShieldCheck, ShieldOff, Loader2, AlertCircle, Router, Clock, Layers } from "lucide-react"
import { fetchIngresses } from "@/lib/api"
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

export interface K8sIngress {
  name: string
  namespace: string
  hosts: string[]      // json:"hosts"
  endpoints: string[]  // json:"endpoints"
  address_source: string // json:"address_source"
  // Gelecek olan opsiyonel alanlar
  kind?: string 
  class_name?: string
  age?: string
  tls_enabled?: boolean
}

export function IngressTable() {
  const [ingresses, setIngresses] = useState<K8sIngress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [nsFilter, setNsFilter] = useState("all")

  useEffect(() => {
    const loadIngresses = async () => {
      try {
        setLoading(true)
        const data = await fetchIngresses()
        setIngresses(data)
        setError(null)
      } catch (err: any) {
        setError(err.message || "Failed to fetch ingresses")
      } finally {
        setLoading(false)
      }
    }
    loadIngresses()
  }, [])

  const namespaces = useMemo(() => ["all", ...new Set(ingresses.map((ing) => ing.namespace))], [ingresses])

  const filtered = useMemo(() => {
    return ingresses.filter((ing) => {
      const matchesSearch =
        search === "" ||
        ing.name.toLowerCase().includes(search.toLowerCase()) ||
        ing.hosts?.some((h) => h.toLowerCase().includes(search.toLowerCase()))
      const matchesNs = nsFilter === "all" || ing.namespace === nsFilter
      return matchesSearch && matchesNs
    })
  }, [ingresses, search, nsFilter])

  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-xs text-muted-foreground">Loading Routes...</span>
    </div>
  )

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Ingress / Routes</h2>
        <p className="text-xs text-muted-foreground">{filtered.length} of {ingresses.length} routes shown</p>
      </div>

      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-9 bg-secondary border-border text-xs text-foreground"
          />
        </div>
        <Select value={nsFilter} onValueChange={setNsFilter}>
          <SelectTrigger className="h-8 w-[150px] bg-secondary border-border text-xs text-foreground">
            <SelectValue placeholder="Namespace" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {namespaces.map((ns) => (
              <SelectItem key={ns} value={ns}>{ns === "all" ? "All Namespaces" : ns}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-[11px] uppercase">Name</TableHead>
            <TableHead className="text-[11px] uppercase">Namespace</TableHead>
            <TableHead className="text-[11px] uppercase">Kind</TableHead>
            <TableHead className="text-[11px] uppercase">Hosts</TableHead>
            <TableHead className="text-[11px] uppercase">Endpoints</TableHead>
            <TableHead className="text-[11px] uppercase">Class</TableHead>
            <TableHead className="text-[11px] uppercase text-center">TLS</TableHead>
            <TableHead className="text-[11px] uppercase">Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((ing) => (
            <TableRow key={`${ing.namespace}-${ing.name}`} className="border-border">
              {/* Name */}
              <TableCell className="font-mono text-xs text-foreground">
                <div className="flex items-center gap-2">
                  <Router className="h-3.5 w-3.5 text-muted-foreground" />
                  {ing.name}
                </div>
              </TableCell>

              {/* Namespace */}
              <TableCell>
                <Badge variant="outline" className="text-[10px] font-normal border-border">
                  {ing.namespace}
                </Badge>
              </TableCell>

              {/* Kind */}
              <TableCell>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">
                  {ing.kind || "-"}
                </span>
              </TableCell>

              {/* Hosts */}
              <TableCell>
                <div className="flex flex-col gap-1">
                  {ing.hosts?.length ? ing.hosts.map((h) => (
                    <span key={h} className="font-mono text-[10px] text-foreground flex items-center gap-1">
                      <Globe className="h-2.5 w-2.5 text-primary/60" /> {h}
                    </span>
                  )) : <span className="text-muted-foreground/40">-</span>}
                </div>
              </TableCell>

              {/* Endpoints */}
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  {ing.endpoints?.length ? ing.endpoints.map((ep, i) => (
                    <span key={i} className="font-mono text-[10px] text-muted-foreground">{ep}</span>
                  )) : <span className="text-muted-foreground/40">-</span>}
                </div>
              </TableCell>

              {/* Class */}
              
              <TableCell>
              <div className="flex items-center gap-1.5">
                {/* Katman ikonu - Class hiyerarşisini temsil eder */}
                <Layers className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                
                {/* Arka planlı, monospaced fontlu class ismi */}
                <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground tracking-tight border border-border/40">
                  {ing.class_name || "-"}
                </code>
              </div>
            </TableCell>

              {/* TLS */}
              <TableCell className="text-center">
                {ing.tls_enabled ? (
                  <ShieldCheck className="h-4 w-4 text-primary mx-auto" />
                ) : (
                  <ShieldOff className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                )}
              </TableCell>

              {/* Age */}
              <TableCell>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {ing.age || "-"}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}