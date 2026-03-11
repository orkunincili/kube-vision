"use client"

import { useState, useMemo } from "react"
import { Search, FileText, Eye, EyeOff } from "lucide-react"
import { fetchConfigMaps } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

interface K8sConfigMap {
  name: string
  namespace: string
  data_keys: string[]
  age: string
  labels: Record<string, string>
}

export function ConfigMapsTable() {
  const [search, setSearch] = useState("")
  const [nsFilter, setNsFilter] = useState("all")
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())
  const { data, loading, error } = useApiResource<K8sConfigMap[]>(fetchConfigMaps)
  const configMaps = data ?? []

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

  const toggleReveal = (key: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (loading) {
    return <ResourceLoadingState message="Loading ConfigMaps..." />
  }

  if (error) {
    return <ResourceErrorState message={error} />
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
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((cm) => {
            const key = `${cm.namespace}/${cm.name}`
            const isRevealed = revealedKeys.has(key)
            return (
              <TableRow key={key}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-mono text-xs truncate max-w-[250px]">{cm.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">{cm.namespace}</Badge>
                </TableCell>
                <TableCell>
                  {isRevealed ? (
                    <div className="flex flex-wrap gap-1">
                      {cm.data_keys?.map((k) => (
                        <code key={k} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono">
                          {k}
                        </code>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {cm.data_keys?.length || 0} keys
                    </span>
                  )}
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => toggleReveal(key)}
                  >
                    {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                No configmaps found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
