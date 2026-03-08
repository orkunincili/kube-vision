"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Loader2, AlertCircle, Layers } from "lucide-react"
import { fetchDeployments } from "@/lib/api" // lib/api.ts içinde tanımlı olduğunu varsayıyoruz
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
import { Progress } from "@/components/ui/progress"

export interface K8sDeployment {
  name: string
  namespace: string
  desired_replicas: number
  ready_replicas: number
  available_replicas: number
}

export function DeploymentsTable() {
  const [deployments, setDeployments] = useState<K8sDeployment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [nsFilter, setNsFilter] = useState("all")

  useEffect(() => {
    const loadDeployments = async () => {
      try {
        setLoading(true)
        const data = await fetchDeployments()
        setDeployments(data)
        setError(null)
      } catch (err: any) {
        setError(err.message || "Failed to fetch deployments")
      } finally {
        setLoading(false)
      }
    }
    loadDeployments()
  }, [])

  const namespaces = useMemo(() => ["all", ...new Set(deployments.map((d) => d.namespace))], [deployments])

  const filtered = useMemo(() => {
    return deployments.filter((d) => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase())
      const matchesNs = nsFilter === "all" || d.namespace === nsFilter
      return matchesSearch && matchesNs
    })
  }, [deployments, search, nsFilter])

  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-xs text-muted-foreground">Loading Deployments...</span>
    </div>
  )

  if (error) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive">
      <AlertCircle className="h-8 w-8" />
      <p className="text-xs font-medium">{error}</p>
    </div>
  )

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Deployments</h2>
        <p className="text-xs text-muted-foreground">{filtered.length} total</p>
      </div>

      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search deployments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-9 bg-secondary text-xs"
          />
        </div>
        <Select value={nsFilter} onValueChange={setNsFilter}>
          <SelectTrigger className="h-8 w-[180px] bg-secondary text-xs">
            <SelectValue placeholder="Namespace" />
          </SelectTrigger>
          <SelectContent>
            {namespaces.map((ns) => (
              <SelectItem key={ns} value={ns} className="text-xs">
                {ns === "all" ? "All Namespaces" : ns}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-xs">Name</TableHead>
            <TableHead className="text-xs">Namespace</TableHead>
            <TableHead className="text-xs">Status (Ready/Desired)</TableHead>
            <TableHead className="text-xs text-right">Available</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((deploy) => {
            const percentage = (deploy.ready_replicas / deploy.desired_replicas) * 100
            return (
              <TableRow key={`${deploy.namespace}-${deploy.name}`} className="border-border">
                <TableCell className="font-mono text-xs font-medium">{deploy.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-normal">{deploy.namespace}</Badge>
                </TableCell>
                <TableCell className="w-[250px]">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{deploy.ready_replicas} / {deploy.desired_replicas} Ready</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <Progress value={percentage} className="h-1" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge className={deploy.available_replicas > 0 ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}>
                    {deploy.available_replicas} Available
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}