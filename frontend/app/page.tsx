"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Server, Box, KeyRound, LayoutDashboard, FileText, Network, Globe } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ClusterSummary } from "@/components/cluster-summary"
import { NodesTable } from "@/components/nodes-table"
import { PodDistribution } from "@/components/pod-distribution"
import { PodsTable } from "@/components/pods-table"
import { SecretsTable } from "@/components/secrets-table"
import { ConfigMapsTable } from "@/components/configmaps-table"
import { ServicesTable } from "@/components/services-table"
import { IngressTable } from "@/components/ingress-table"
import {
  nodes,
  pods,
  secrets,
  configMaps,
  services,
  ingresses,
  getClusterSummary,
  getPodDistribution,
} from "@/lib/k8s-data"

export default function KubernetesDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)
  const summary = getClusterSummary()
  const distribution = getPodDistribution()

  return (
    <div className="flex min-h-screen flex-col bg-background" key={refreshKey}>
      <DashboardHeader onRefresh={() => setRefreshKey((k) => k + 1)} />

      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-[1400px]">
          <Tabs defaultValue="overview" className="gap-4">
            <TabsList className="flex-wrap bg-secondary h-auto gap-0.5 p-1">
              <TabsTrigger value="overview" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="nodes" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                <Server className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Nodes</span>
              </TabsTrigger>
              <TabsTrigger value="pods" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                <Box className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Pods</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                <Network className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Services</span>
              </TabsTrigger>
              <TabsTrigger value="ingress" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ingress</span>
              </TabsTrigger>
              <TabsTrigger value="configmaps" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ConfigMaps</span>
              </TabsTrigger>
              <TabsTrigger value="secrets" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                <KeyRound className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Secrets</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex flex-col gap-4">
              <ClusterSummary data={summary} />
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <PodDistribution distribution={distribution} nodes={nodes} />
                <div className="rounded-lg border border-border bg-card">
                  <div className="border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold text-foreground">Node Overview</h2>
                    <p className="text-xs text-muted-foreground">
                      Status, versions and runtime info
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    {nodes.map((node) => (
                      <div
                        key={node.name}
                        className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2.5"
                      >
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            node.status === "Ready" ? "bg-primary" : "bg-destructive"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground font-mono">
                            {node.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {node.roles.join(", ")} &middot; {node.kubeletVersion} &middot; {node.criName} {node.criVersion}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-foreground">{node.podCount} pods</p>
                          <p className="text-[11px] text-muted-foreground">
                            {node.os} / {node.arch}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nodes">
              <NodesTable nodes={nodes} />
            </TabsContent>

            <TabsContent value="pods">
              <PodsTable pods={pods} namespaces={summary.namespaces} />
            </TabsContent>

            <TabsContent value="services">
              <ServicesTable services={services} namespaces={summary.namespaces} />
            </TabsContent>

            <TabsContent value="ingress">
              <IngressTable ingresses={ingresses} namespaces={summary.namespaces} />
            </TabsContent>

            <TabsContent value="configmaps">
              <ConfigMapsTable configMaps={configMaps} namespaces={summary.namespaces} />
            </TabsContent>

            <TabsContent value="secrets">
              <SecretsTable secrets={secrets} namespaces={summary.namespaces} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
