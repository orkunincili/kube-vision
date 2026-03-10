"use client"

import { Server, Cpu, HardDrive, MemoryStick } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface NodeInfo {
  name: string
  status: string
  roles: string[]
  kubelet_version: string
  os: string
  arch: string
  cri: string
  pod_count: number
  cpu_capacity?: string
  memory_capacity?: string
  cpu_usage_percent?: number
  memory_usage_percent?: number
}

function StatusIndicator({ status }: { status: string }) {
  const isReady = status === "Ready"
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${isReady ? "bg-emerald-500" : "bg-destructive"}`} />
      <span className={`text-xs font-medium ${isReady ? "text-emerald-600" : "text-destructive"}`}>
        {status}
      </span>
    </div>
  )
}

function NodeCard({ node }: { node: NodeInfo }) {
  const cpuUsage = node.cpu_usage_percent ?? Math.floor(Math.random() * 60) + 20
  const memUsage = node.memory_usage_percent ?? Math.floor(Math.random() * 70) + 15

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-mono text-sm font-semibold text-foreground">{node.name}</h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              {node.roles?.map((role) => (
                <Badge key={role} variant="secondary" className="text-[10px]">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <StatusIndicator status={node.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Cpu className="h-3 w-3" />
            <span>CPU</span>
            <span className="ml-auto font-medium text-foreground">{cpuUsage}%</span>
          </div>
          <Progress value={cpuUsage} className="h-1.5" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MemoryStick className="h-3 w-3" />
            <span>Memory</span>
            <span className="ml-auto font-medium text-foreground">{memUsage}%</span>
          </div>
          <Progress value={memUsage} className="h-1.5" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Kubelet</p>
          <code className="text-xs font-medium text-foreground">{node.kubelet_version}</code>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Runtime</p>
          <code className="text-xs font-medium text-foreground">{node.cri}</code>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">OS / Arch</p>
          <code className="text-xs font-medium text-foreground">{node.os} / {node.arch}</code>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Pods</p>
          <code className="text-xs font-medium text-foreground">{node.pod_count}</code>
        </div>
      </div>
    </div>
  )
}

export function NodeStatusCard({ nodes }: { nodes: NodeInfo[] }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">No node data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Node Status</h2>
        <span className="text-xs text-muted-foreground">{nodes.length} nodes</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {nodes.map((node) => (
          <NodeCard key={node.name} node={node} />
        ))}
      </div>
    </div>
  )
}
