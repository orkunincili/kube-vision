"use client"

import { useState, useEffect } from "react"
import { 
  Server, Box, KeyRound, LayoutDashboard, FileText, 
  Network, Globe, Loader2, Layers, GitBranch 
} from "lucide-react"

import { DashboardHeader } from "@/components/dashboard-header"
import { ClusterSummary } from "@/components/cluster-summary"
import { NodesTable } from "@/components/nodes-table"
import { PodsTable } from "@/components/pods-table"
import { DeploymentsTable } from "@/components/deployments-table"
import { SecretsTable } from "@/components/secrets-table"
import { ConfigMapsTable } from "@/components/configmaps-table"
import { ServicesTable } from "@/components/services-table"
import { IngressTable } from "@/components/ingress-table"
import { ClusterDiagram } from "@/components/cluster-diagram"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchSummary } from "@/lib/api"

export default function KubernetesDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const result = await fetchSummary()
        setData(result)
      } catch (err) {
        console.error("Dashboard load error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [refreshKey])

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
        <button 
          onClick={() => setRefreshKey(k => k + 1)}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Retry
        </button>
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
              <TabsTrigger value="diagram" className="gap-2 text-xs">
                <GitBranch className="h-3.5 w-3.5" /> Cluster Diagram
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
              <TabsTrigger value="secrets" className="gap-2 text-xs">
                <KeyRound className="h-3.5 w-3.5" /> Secrets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ClusterSummary data={data} />
            </TabsContent>

            <TabsContent value="diagram">
              <ClusterDiagram />
            </TabsContent>

            <TabsContent value="nodes"><NodesTable /></TabsContent>
            <TabsContent value="deployments"><DeploymentsTable /></TabsContent>
            <TabsContent value="pods"><PodsTable /></TabsContent>
            <TabsContent value="services"><ServicesTable /></TabsContent>
            <TabsContent value="ingress"><IngressTable /></TabsContent>
            <TabsContent value="configmaps"><ConfigMapsTable /></TabsContent>
            <TabsContent value="secrets"><SecretsTable /></TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  )
}
