"use client"

import { useState, useMemo } from "react"
import { Search, Eye, EyeOff, KeyRound } from "lucide-react"
import { type K8sSecret } from "@/lib/k8s-data"
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

function SecretTypeBadge({ type }: { type: string }) {
  const short = type.replace("kubernetes.io/", "k8s/")
  const colors: Record<string, string> = {
    "Opaque": "bg-chart-2/15 text-chart-2 border-chart-2/20",
    "kubernetes.io/tls": "bg-primary/15 text-primary border-primary/20",
    "kubernetes.io/service-account-token": "bg-warning/15 text-warning border-warning/20",
    "kubernetes.io/dockerconfigjson": "bg-chart-4/15 text-chart-4 border-chart-4/20",
  }
  return (
    <Badge variant="outline" className={`text-[10px] font-normal ${colors[type] ?? "bg-secondary text-muted-foreground border-border"}`}>
      {short}
    </Badge>
  )
}

export function SecretsTable({
  secrets,
  namespaces,
}: {
  secrets: K8sSecret[]
  namespaces: string[]
}) {
  const [search, setSearch] = useState("")
  const [nsFilter, setNsFilter] = useState("all")
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return secrets.filter((s) => {
      const matchesSearch =
        search === "" || s.name.toLowerCase().includes(search.toLowerCase())
      const matchesNs = nsFilter === "all" || s.namespace === nsFilter
      return matchesSearch && matchesNs
    })
  }, [secrets, search, nsFilter])

  const toggleReveal = (key: string) => {
    setRevealedKeys((prev) => {
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
        <h2 className="text-sm font-semibold text-foreground">Secrets</h2>
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {secrets.length} secrets shown
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search secrets..."
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
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Namespace</TableHead>
            <TableHead className="text-muted-foreground">Type</TableHead>
            <TableHead className="text-muted-foreground">Data Keys</TableHead>
            <TableHead className="text-muted-foreground hidden md:table-cell">Age</TableHead>
            <TableHead className="text-muted-foreground w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((secret) => {
            const isRevealed = revealedKeys.has(`${secret.namespace}/${secret.name}`)
            return (
              <TableRow key={`${secret.namespace}-${secret.name}`} className="border-border">
                <TableCell className="max-w-[250px] truncate">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-mono text-xs text-foreground truncate">{secret.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-border">
                    {secret.namespace}
                  </Badge>
                </TableCell>
                <TableCell>
                  <SecretTypeBadge type={secret.type} />
                </TableCell>
                <TableCell>
                  {isRevealed ? (
                    <div className="flex flex-wrap gap-1">
                      {secret.dataKeys.map((key) => (
                        <code
                          key={key}
                          className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-foreground font-mono"
                        >
                          {key}
                        </code>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {secret.dataKeys.length} key{secret.dataKeys.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {secret.age}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => toggleReveal(`${secret.namespace}/${secret.name}`)}
                    aria-label={isRevealed ? "Hide data keys" : "Show data keys"}
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
                No secrets found matching your filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
