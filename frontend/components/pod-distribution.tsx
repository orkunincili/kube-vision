"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { type K8sNode } from "@/lib/k8s-data"

interface DistributionData {
  [nodeName: string]: { total: number; running: number; other: number }
}

export function PodDistribution({
  distribution,
  nodes,
}: {
  distribution: DistributionData
  nodes: K8sNode[]
}) {
  const chartData = Object.entries(distribution).map(([name, data]) => {
    const node = nodes.find((n) => n.name === name)
    const shortName = name.replace("node-", "")
    return {
      name: shortName,
      fullName: name,
      running: data.running,
      other: data.other,
      total: data.total,
      status: node?.status ?? "Unknown",
    }
  })

  const totalPods = chartData.reduce((sum, d) => sum + d.total, 0)

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Pod Distribution</h2>
            <p className="text-xs text-muted-foreground">
              Pod allocation across cluster nodes
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{totalPods}</p>
            <p className="text-xs text-muted-foreground">Total Pods</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.26 0.008 260)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "oklch(0.60 0 0)", fontSize: 11 }}
                axisLine={{ stroke: "oklch(0.26 0.008 260)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.60 0 0)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.005 260)",
                  border: "1px solid oklch(0.26 0.008 260)",
                  borderRadius: "8px",
                  color: "oklch(0.95 0 0)",
                  fontSize: "12px",
                }}
                cursor={{ fill: "oklch(0.22 0.008 260 / 0.5)" }}
                formatter={(value: number, name: string) => [value, name === "running" ? "Running" : "Other"]}
                labelFormatter={(label: string) => `node-${label}`}
              />
              <Bar dataKey="running" stackId="a" radius={[0, 0, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`running-${index}`}
                    fill={entry.status === "NotReady" ? "oklch(0.58 0.22 27)" : "oklch(0.72 0.19 155)"}
                  />
                ))}
              </Bar>
              <Bar dataKey="other" stackId="a" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`other-${index}`}
                    fill={entry.status === "NotReady" ? "oklch(0.58 0.22 27 / 0.4)" : "oklch(0.72 0.19 155 / 0.3)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            Running
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary/30" />
            Other
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-destructive" />
            NotReady Node
          </div>
        </div>
      </div>
    </div>
  )
}
