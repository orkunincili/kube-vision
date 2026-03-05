"use client"

import { useState, useMemo } from "react"
import { Search, FileText, ChevronDown, ChevronRight } from "lucide-react"
import { type K8sConfigMap } from "@/lib/k8s-data"
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

export function ConfigMapsTable({
  configMaps,
  namespaces,
}: {
  configMaps: K8sConfigMap[]
  namespaces: string[]
}) {
  const [search, setSearch] = useState("")
  const [nsFilter, setNsFilter] = useState("all")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return configMaps.filter((cm) => {
      const matchesSearch =
        search === "" || cm.name.toLowerCase().includes(search.toLowerCase())
      const matchesNs = nsFilter === "all" || cm.namespace === nsFilter
      return matchesSearch && matchesNs
    })
  }, [configMaps, search, nsFilter])

  const toggleExpand = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">ConfigMaps</h2>
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {configMaps.length} configmaps shown
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search configmaps..."
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
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground w-[30px]" />
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Namespace</TableHead>
            <TableHead className="text-muted-foreground">Data</TableHead>
            <TableHead className="text-muted-foreground hidden md:table-cell">Labels</TableHead>
            <TableHead className="text-muted-foreground hidden md:table-cell">Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((cm) => {
            const rowKey = `${cm.namespace}/${cm.name}`
            const isExpanded = expandedRows.has(rowKey)
            return (
              <>
                <TableRow
                  key={rowKey}
                  className="border-border cursor-pointer hover:bg-secondary/30"
                  onClick={() => toggleExpand(rowKey)}
                >
                  <TableCell className="w-[30px] pr-0">
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="font-mono text-xs text-foreground truncate max-w-[250px]">{cm.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-border">
                      {cm.namespace}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {cm.dataKeys.length} key{cm.dataKeys.length !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(cm.labels).slice(0, 2).map(([k, v]) => (
                        <code
                          key={k}
                          className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono"
                        >
                          {k}={v}
                        </code>
                      ))}
                      {Object.keys(cm.labels).length === 0 && (
                        <span className="text-[11px] text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {cm.age}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow key={`${rowKey}-detail`} className="border-border hover:bg-transparent">
                    <TableCell colSpan={6} className="bg-secondary/20 px-6 py-3">
                      <p className="mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Data Keys</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cm.dataKeys.map((key) => (
                          <code
                            key={key}
                            className="rounded bg-secondary px-2 py-1 text-[11px] text-foreground font-mono"
                          >
                            {key}
                          </code>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )
          })}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                No configmaps found matching your filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
