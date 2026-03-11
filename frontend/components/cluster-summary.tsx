import { Server, Box, ShieldAlert, KeyRound, FileText, Network, Globe } from "lucide-react"
import type { SummaryData } from "@/lib/types"

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  sub?: string
  accent?: "default" | "warning" | "destructive"
}) {
  const accentColor =
    accent === "warning"
      ? "text-warning"
      : accent === "destructive"
        ? "text-destructive"
        : "text-primary"

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary ${accentColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

export function ClusterSummary({ data }: { data: SummaryData }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
      <SummaryCard
        icon={Server}
        label="Nodes"
        value={data.totalNodes}
        sub={`${data.readyNodes} Ready`}
      />
      <SummaryCard
        icon={Box}
        label="Pods"
        value={data.totalPods}
        sub={`${data.runningPods} Running`}
      />
      <SummaryCard
        icon={ShieldAlert}
        label="Unhealthy"
        value={data.failedPods + data.pendingPods}
        sub={`${data.failedPods} Failed / ${data.pendingPods} Pending`}
        accent={data.failedPods > 0 ? "destructive" : "warning"}
      />
      <SummaryCard
        icon={Network}
        label="Services"
        value={data.totalServices}
      />
      <SummaryCard
        icon={Globe}
        label="Ingress"
        value={data.totalIngresses}
      />
      <SummaryCard
        icon={FileText}
        label="ConfigMaps"
        value={data.totalConfigMaps}
      />
      <SummaryCard
        icon={KeyRound}
        label="Secrets"
        value={data.totalSecrets}
      />
    </div>
  )
}
