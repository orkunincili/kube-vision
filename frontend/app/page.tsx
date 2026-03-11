"use client"

import { useState } from "react"
import { 
  Server, Box, LayoutDashboard, FileText, 
  Network, Globe, Loader2, Layers 
} from "lucide-react"

import { DashboardHeader } from "@/components/dashboard-header"
import { ClusterSummary } from "@/components/cluster-summary"
import { NodesTable } from "@/components/nodes-table"
import { PodsTable } from "@/components/pods-table"
import { DeploymentsTable } from "@/components/deployments-table"
import { ConfigMapsTable } from "@/components/configmaps-table"
import { ServicesTable } from "@/components/services-table"
import { IngressTable } from "@/components/ingress-table"
import { NodeStatusCard } from "@/components/node-status-card"
import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchSummary } from "@/lib/api"
import { useApiResource } from "@/hooks/use-api-resource"
import type { SummaryData } from "@/lib/types"

export default function KubernetesDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data, loading } = useApiResource<SummaryData>(fetchSummary, [refreshKey])

  if (loading) return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Loading Cluster Data...</span>
    </div>
  )

  if (!data) return (
    <div className="flex h-screen w-full items-center justify-center p-10 text-center">
      <div className="max-w-md space-y-4">
        <h2 className="text-xl font-bold">Connection Failed</h2>
        <p className="text-muted-foreground">Unable to connect to backend API.</p>
        <Button
          onClick={() => setRefreshKey(k => k + 1)}
          size="sm"
        >
          Retry
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader onRefresh={() => setRefreshKey(k => k + 1)} />

      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-[1440px]">
          <Tabs defaultValue="overview" className="space-y-6">
            
            <TabsList className="flex flex-wrap gap-1">
              <TabsTrigger value="overview" className="gap-2 text-xs">
                <LayoutDashboard className="h-3.5 w-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="nodes" className="gap-2 text-xs">
                <Server className="h-3.5 w-3.5" /> Nodes
              </TabsTrigger>
              <TabsTrigger value="deployments" className="gap-2 text-xs">
                <Layers className="h-3.5 w-3.5" /> Deployments
              </TabsTrigger>
              <TabsTrigger value="pods" className="gap-2 text-xs">
                <Box className="h-3.5 w-3.5" /> Pods
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-2 text-xs">
                <Network className="h-3.5 w-3.5" /> Services
              </TabsTrigger>
              <TabsTrigger value="ingress" className="gap-2 text-xs">
                <Globe className="h-3.5 w-3.5" /> Ingress
              </TabsTrigger>
              <TabsTrigger value="configmaps" className="gap-2 text-xs">
                <FileText className="h-3.5 w-3.5" /> ConfigMaps
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ClusterSummary data={data} />
              <NodeStatusCard nodes={data.node} />
            </TabsContent>

            <TabsContent value="nodes"><NodesTable /></TabsContent>
            <TabsContent value="deployments"><DeploymentsTable /></TabsContent>
            <TabsContent value="pods"><PodsTable /></TabsContent>
            <TabsContent value="services"><ServicesTable /></TabsContent>
            <TabsContent value="ingress"><IngressTable /></TabsContent>
            <TabsContent value="configmaps"><ConfigMapsTable /></TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  )
}
