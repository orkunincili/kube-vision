"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchNodes } from "@/lib/api"

// UI şu an K8sNode type'ına göre yazılmış ama
// "ne geliyorsa bas" istediğin için burada any kullanıyoruz.
type AnyNode = any

function StatusDot({ status }: { status: any }) {
  const s = String(status ?? "")
  const color =
    s === "Ready"
      ? "bg-primary"
      : s === "NotReady"
        ? "bg-destructive"
        : "bg-warning"

  return (
    <span className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span
        className={
          s === "Ready"
            ? "text-primary"
            : s === "NotReady"
              ? "text-destructive"
              : "text-warning"
        }
      >
        {s || "Unknown"}
      </span>
    </span>
  )
}

export function NodesTable() {
  const [nodes, setNodes] = useState<AnyNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchNodes()
        if (!cancelled) setNodes(Array.isArray(data) ? data : [])
      } catch (e: any) {
        if (!cancelled) {
          setNodes([])
          setError(e?.message ?? "nodes fetch failed")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Nodes</h2>
        <p className="text-xs text-muted-foreground">
          Cluster node details and runtime versions
        </p>

        {loading && (
          <p className="mt-2 text-xs text-muted-foreground">Loading…</p>
        )}

        {!loading && error && (
          <p className="mt-2 text-xs text-destructive">
            Error: {error}
          </p>
        )}

        {!loading && !error && nodes.length === 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            No nodes returned.
          </p>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Roles</TableHead>
            <TableHead className="text-muted-foreground">Kubelet</TableHead>
            <TableHead className="text-muted-foreground">CRI</TableHead>
            <TableHead className="text-muted-foreground hidden md:table-cell">
              OS / Arch
            </TableHead>
            <TableHead className="text-muted-foreground">Pods</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {nodes.map((node, idx) => (
            <TableRow key={node?.name ?? idx} className="border-border">
              <TableCell className="font-mono text-xs text-foreground">
                {String(node?.name ?? "-")}
              </TableCell>

              <TableCell>
                <StatusDot status={node?.status} />
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(node?.roles) && node.roles.length > 0 ? (
                    node.roles.map((role: any) => (
                      <Badge
                        key={String(role)}
                        variant="secondary"
                        className="text-[10px] font-normal bg-secondary text-secondary-foreground"
                      >
                        {String(role)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <code className="rounded bg-secondary px-1.5 py-0.5 text-[11px] text-foreground font-mono">
                  {String(node?.kubelet_version ?? "-")}
                </code>
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs text-foreground">
                    {String(node?.cri ?? "-")}
                  </span>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    {String(node?.os ?? "-")}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <span className="font-mono text-xs text-foreground">
                  {String(node?.pod_count ?? "-")}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}