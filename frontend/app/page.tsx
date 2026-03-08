"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Server, Box, KeyRound, LayoutDashboard, FileText, 
  Network, Globe, Loader2, Layers, Activity 
} from "lucide-react"

// Bileşen Importları (Dosya yollarının doğruluğundan emin ol)
import { DashboardHeader } from "@/components/dashboard-header"
import { ClusterSummary } from "@/components/cluster-summary"
import { NodesTable } from "@/components/nodes-table"
import { PodDistribution } from "@/components/pod-distribution"
import { PodsTable } from "@/components/pods-table"
import { DeploymentsTable } from "@/components/deployments-table"
import { SecretsTable } from "@/components/secrets-table"
import { ConfigMapsTable } from "@/components/configmaps-table"
import { ServicesTable } from "@/components/services-table"
import { IngressTable } from "@/components/ingress-table"

// UI Bileşenleri (shadcn/ui kullandığını varsayıyorum)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchSummary } from "@/lib/api"

export default function KubernetesDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Cluster Genel Özetini Çeken Effect
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
        other: node.others || 0 
      };
      return acc;
    }, {});
  }, [data])

  if (loading) return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm font-medium animate-pulse text-muted-foreground">
        Kubernetes Cluster Verileri Alınıyor...
      </span>
    </div>
  )

  if (!data) return (
    <div className="flex h-screen w-full items-center justify-center p-10 text-center">
      <div className="max-w-md space-y-4">
        <Activity className="mx-auto h-12 w-12 text-destructive opacity-50" />
        <h2 className="text-xl font-bold">Veri Bağlantısı Kesildi</h2>
        <p className="text-muted-foreground">Backend API'ye ulaşılamıyor. Go sunucusunun 8080 portunda çalıştığından emin olun.</p>
        <button 
          onClick={() => setRefreshKey(k => k + 1)}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  )

  const nodes = data.node || []
  const namespaces = data.namespaces || []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header - Refresh tetikleyicisi burada */}
      <DashboardHeader onRefresh={() => setRefreshKey(k => k + 1)} />

      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-[1440px]">
          <Tabs defaultValue="overview" className="space-y-6">
            
            {/* Navigasyon - Tüm K8s Objeleri */}
            <TabsList className="inline-flex h-auto flex-wrap items-center justify-start gap-1 bg-muted p-1 text-muted-foreground">
              <TabsTrigger value="overview" className="gap-2 px-3 py-1.5 text-xs">
                <LayoutDashboard className="h-3.5 w-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="nodes" className="gap-2 px-3 py-1.5 text-xs">
                <Server className="h-3.5 w-3.5" /> Nodes
              </TabsTrigger>
              <TabsTrigger value="deployments" className="gap-2 px-3 py-1.5 text-xs">
                <Layers className="h-3.5 w-3.5" /> Deployments
              </TabsTrigger>
              <TabsTrigger value="pods" className="gap-2 px-3 py-1.5 text-xs">
                <Box className="h-3.5 w-3.5" /> Pods
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-2 px-3 py-1.5 text-xs">
                <Network className="h-3.5 w-3.5" /> Services
              </TabsTrigger>
              <TabsTrigger value="ingress" className="gap-2 px-3 py-1.5 text-xs">
                <Globe className="h-3.5 w-3.5" /> Ingress
              </TabsTrigger>
              <TabsTrigger value="configmaps" className="gap-2 px-3 py-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> ConfigMaps
              </TabsTrigger>
              <TabsTrigger value="secrets" className="gap-2 px-3 py-1.5 text-xs">
                <KeyRound className="h-3.5 w-3.5" /> Secrets
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW CONTENT */}
            <TabsContent value="overview" className="space-y-6 outline-none">
              <ClusterSummary data={data} />
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <PodDistribution distribution={distributionData} nodes={nodes} />
                </div>
                
                {/* Node Quick Status Sidebar */}
                <div className="rounded-xl border border-border bg-card shadow-sm">
                  <div className="border-b border-border px-4 py-3 text-sm font-semibold flex items-center justify-between">
                    <span>Node Status</span>
                    <Badge variant="outline" className="text-[10px]">{nodes.length} Nodes</Badge>
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    {nodes.map((node: any) => (
                      <div key={node.name} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 px-3 py-2.5 transition-hover hover:bg-secondary/40">
                        <div className={`h-2 w-2 rounded-full ${node.status === "Ready" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-destructive animate-pulse"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-mono font-medium">{node.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{node.roles?.join(", ") || "worker"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">{node.pod_count}</p>
                          <p className="text-[10px] text-muted-foreground">pods</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* DETAILED TABLES */}
            <TabsContent value="nodes" className="outline-none"><NodesTable /></TabsContent>
            <TabsContent value="deployments" className="outline-none"><DeploymentsTable /></TabsContent>
            <TabsContent value="pods" className="outline-none"><PodsTable /></TabsContent>
            <TabsContent value="services" className="outline-none"><ServicesTable /></TabsContent>
            <TabsContent value="ingress" className="outline-none"><IngressTable /></TabsContent>
            
            {/* Statik Veri Alanlar (Props ile data paslanıyor) */}
            <TabsContent value="configmaps" className="outline-none">
              <ConfigMapsTable configMaps={data.configMaps || []} namespaces={namespaces} />
            </TabsContent>
            <TabsContent value="secrets" className="outline-none">
              <SecretsTable secrets={data.secrets || []} namespaces={namespaces} />
            </TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  )
}

// Yardımcı Badge bileşeni (Eğer globalde yoksa diye)
function Badge({ children, variant = "default", className = "" }: any) {
  const variants: any = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-border text-muted-foreground",
    destructive: "bg-destructive text-destructive-foreground"
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}