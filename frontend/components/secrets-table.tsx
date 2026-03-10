"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, KeyRound, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { fetchSecrets } from "@/lib/api"
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

interface K8sSecret {
  name: string
  namespace: string
  type: string
  data_keys: string[]
  age: string
  labels: Record<string, string>
}

const MOCK_SECRETS: K8sSecret[] = [
  {
    name: "db-credentials",
    namespace: "default",
    type: "Opaque",
    data_keys: ["username", "password", "host", "port"],
    age: "30d",
    labels: { app: "backend", component: "database" },
  },
  {
    name: "tls-certificate",
    namespace: "ingress-nginx",
    type: "kubernetes.io/tls",
    data_keys: ["tls.crt", "tls.key"],
    age: "90d",
    labels: { app: "ingress", type: "tls" },
  },
  {
    name: "docker-registry",
    namespace: "default",
    type: "kubernetes.io/dockerconfigjson",
    data_keys: [".dockerconfigjson"],
    age: "60d",
    labels: { type: "registry" },
  },
  {
    name: "api-keys",
    namespace: "default",
    type: "Opaque",
    data_keys: ["stripe-key", "sendgrid-key", "aws-access-key", "aws-secret-key"],
    age: "15d",
    labels: { app: "backend", component: "integrations" },
  },
  {
    name: "jwt-secret",
    namespace: "default",
    type: "Opaque",
    data_keys: ["secret", "refresh-secret"],
    age: "45d",
    labels: { app: "auth", component: "jwt" },
  },
  {
    name: "default-token-abc123",
    namespace: "kube-system",
    type: "kubernetes.io/service-account-token",
    data_keys: ["token", "ca.crt", "namespace"],
    age: "120d",
    labels: {},
  },
  {
    name: "grafana-admin",
    namespace: "monitoring",
    type: "Opaque",
    data_keys: ["admin-user", "admin-password"],
    age: "15d",
    labels: { app: "grafana", release: "monitoring" },
  },
]

function SecretTypeBadge({ type }: { type: string }) {
  const short = type.replace("kubernetes.io/", "k8s/")
  return (
    <Badge variant="outline" className="text-[10px]">
      {short}
    </Badge>
  )
}

export function SecretsTable() {
  const [secrets, setSecrets] = useState<K8sSecret[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [nsFilter, setNsFilter] = useState("all")
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await fetchSecrets()
        setSecrets(data || [])
        setError(null)
      } catch (err: any) {
        // Use mock data when API fails
        setSecrets(MOCK_SECRETS)
        setError(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const namespaces = useMemo(() => 
    ["all", ...new Set(secrets.map((s) => s.namespace))], 
    [secrets]
  )

  const filtered = useMemo(() => {
    return secrets.filter((s) => {
      const matchesSearch = search === "" || s.name.toLowerCase().includes(search.toLowerCase())
      const matchesNs = nsFilter === "all" || s.namespace === nsFilter
      return matchesSearch && matchesNs
    })
  }, [secrets, search, nsFilter])

  const toggleReveal = (key: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Loading Secrets...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-destructive">Connection Error</h3>
          <p className="text-xs text-muted-foreground max-w-[300px]">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Secrets</h2>
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {secrets.length} secrets
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search secrets..."
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
            <TableHead>Type</TableHead>
            <TableHead>Data Keys</TableHead>
            <TableHead className="hidden md:table-cell">Age</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((secret) => {
            const key = `${secret.namespace}/${secret.name}`
            const isRevealed = revealedKeys.has(key)
            return (
              <TableRow key={key}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-mono text-xs truncate max-w-[250px]">{secret.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">{secret.namespace}</Badge>
                </TableCell>
                <TableCell>
                  <SecretTypeBadge type={secret.type} />
                </TableCell>
                <TableCell>
                  {isRevealed ? (
                    <div className="flex flex-wrap gap-1">
                      {secret.data_keys?.map((k) => (
                        <code key={k} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono">
                          {k}
                        </code>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {secret.data_keys?.length || 0} keys
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
                No secrets found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
