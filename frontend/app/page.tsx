"use client"

import { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Server, Box, KeyRound, LayoutDashboard, FileText, Network, Globe, Loader2 } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ClusterSummary } from "@/components/cluster-summary"
import { NodesTable } from "@/components/nodes-table"
import { PodDistribution } from "@/components/pod-distribution"
import { PodsTable } from "@/components/pods-table"
import { SecretsTable } from "@/components/secrets-table"
import { ConfigMapsTable } from "@/components/configmaps-table"
import { ServicesTable } from "@/components/services-table"
import { IngressTable } from "@/components/ingress-table"
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

  // Grafik verisini node listesinden dinamik olarak üretiyoruz
  const distributionData = useMemo(() => {
    if (!data?.node) return {};
    return data.node.reduce((acc: any, node: any) => {
      acc[node.name] = {
        total: node.pod_count || 0,
        running: node.running || 0,
        other: node.others || 0 // Backend'deki "others" alanını bağladık
      };
      return acc;
    }, {});
  }, [data])

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center gap-3 bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-sm font-medium">Cluster verileri yükleniyor...</span>
    </div>
  )

  if (!data) return <div className="p-10 text-center">Veri alınamadı. Backend API'yi kontrol edin.</div>

  const nodes = data.node || []
  const namespaces = data.namespaces || []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader onRefresh={() => setRefreshKey(k => k + 1)} />

      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-[1400px]">
          <Tabs defaultValue="overview" className="gap-4">
            <TabsList className="flex-wrap bg-secondary h-auto gap-0.5 p-1">
              <TabsTrigger value="overview" className="gap-1.5 text-xs"><LayoutDashboard className="h-3.5 w-3.5" /> Overview</TabsTrigger>
              <TabsTrigger value="nodes" className="gap-1.5 text-xs"><Server className="h-3.5 w-3.5" /> Nodes</TabsTrigger>
              <TabsTrigger value="pods" className="gap-1.5 text-xs"><Box className="h-3.5 w-3.5" /> Pods</TabsTrigger>
              <TabsTrigger value="services" className="gap-1.5 text-xs"><Network className="h-3.5 w-3.5" /> Services</TabsTrigger>
              <TabsTrigger value="ingress" className="gap-1.5 text-xs"><Globe className="h-3.5 w-3.5" /> Ingress</TabsTrigger>
              <TabsTrigger value="configmaps" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" /> ConfigMaps</TabsTrigger>
              <TabsTrigger value="secrets" className="gap-1.5 text-xs"><KeyRound className="h-3.5 w-3.5" /> Secrets</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex flex-col gap-4">
              <ClusterSummary data={data} />
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <PodDistribution distribution={distributionData} nodes={nodes} />
                
                <div className="rounded-lg border border-border bg-card">
                  <div className="border-b border-border px-4 py-3 text-sm font-semibold">Node Overview</div>
                  <div className="flex flex-col gap-3 p-4">
                    {nodes.map((node: any) => (
                      <div key={node.name} className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${node.status === "Ready" ? "bg-primary" : "bg-destructive"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium font-mono">{node.name}</p>
                          <p className="text-[11px] text-muted-foreground">{node.roles?.join(", ") || "worker"} &middot; {node.kubelet_version}</p>
                        </div>
                        <div className="text-right text-[11px]">
                          <p className="font-medium text-foreground">{node.pod_count} pods</p>
                          <p className="text-muted-foreground">{node.os}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Diğer Tab İçerikleri */}
            <TabsContent value="nodes"><NodesTable /></TabsContent>
            <TabsContent value="pods"><PodsTable  /></TabsContent>
            <TabsContent value="services"><ServicesTable  /></TabsContent>
            <TabsContent value="ingress"><IngressTable  /></TabsContent>
            <TabsContent value="configmaps"><ConfigMapsTable configMaps={data.configMaps} namespaces={namespaces} /></TabsContent>
            <TabsContent value="secrets"><SecretsTable secrets={data.secrets} namespaces={namespaces} /></TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  )
}