"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Loader2, AlertCircle, ZoomIn, ZoomOut, RotateCcw, Server, Box, Network, Globe, Layers } from "lucide-react"
import { fetchPods, fetchServices, fetchDeployments, fetchIngresses } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DiagramNode {
  id: string
  type: "namespace" | "deployment" | "pod" | "service" | "ingress"
  name: string
  namespace: string
  labels: Record<string, string>
  x: number
  y: number
}

interface DiagramEdge {
  from: string
  to: string
  label?: string
}

interface K8sResource {
  name: string
  namespace: string
  labels?: Record<string, string>
  selector?: Record<string, string>
  node_name?: string
  status?: string
}

export function ClusterDiagram() {
  const [pods, setPods] = useState<K8sResource[]>([])
  const [services, setServices] = useState<K8sResource[]>([])
  const [deployments, setDeployments] = useState<K8sResource[]>([])
  const [ingresses, setIngresses] = useState<K8sResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [groupBy, setGroupBy] = useState<"namespace" | "app" | "node">("namespace")
  const [selectedNs, setSelectedNs] = useState("all")

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true)
        const [podsData, servicesData, deploymentsData, ingressesData] = await Promise.all([
          fetchPods().catch(() => []),
          fetchServices().catch(() => []),
          fetchDeployments().catch(() => []),
          fetchIngresses().catch(() => []),
        ])
        setPods(podsData || [])
        setServices(servicesData || [])
        setDeployments(deploymentsData || [])
        setIngresses(ingressesData || [])
        setError(null)
      } catch (err: any) {
        setError(err.message || "Failed to load resources")
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  const namespaces = useMemo(() => {
    const ns = new Set<string>()
    pods.forEach(p => ns.add(p.namespace))
    services.forEach(s => ns.add(s.namespace))
    deployments.forEach(d => ns.add(d.namespace))
    return ["all", ...Array.from(ns).sort()]
  }, [pods, services, deployments])

  const filteredData = useMemo(() => {
    const filterByNs = (items: K8sResource[]) => 
      selectedNs === "all" ? items : items.filter(i => i.namespace === selectedNs)
    
    return {
      pods: filterByNs(pods),
      services: filterByNs(services),
      deployments: filterByNs(deployments),
      ingresses: filterByNs(ingresses),
    }
  }, [pods, services, deployments, ingresses, selectedNs])

  // Build diagram data based on label matching
  const { nodes, edges, groups } = useMemo(() => {
    const nodes: DiagramNode[] = []
    const edges: DiagramEdge[] = []
    const groups: Map<string, DiagramNode[]> = new Map()

    // Group resources
    const getGroupKey = (resource: K8sResource): string => {
      if (groupBy === "namespace") return resource.namespace
      if (groupBy === "app") return resource.labels?.app || resource.labels?.["app.kubernetes.io/name"] || "unknown"
      if (groupBy === "node") return (resource as any).node_name || "unassigned"
      return resource.namespace
    }

    // Add deployments
    filteredData.deployments.forEach((dep, i) => {
      const node: DiagramNode = {
        id: `dep-${dep.namespace}-${dep.name}`,
        type: "deployment",
        name: dep.name,
        namespace: dep.namespace,
        labels: dep.labels || {},
        x: 0, y: 0,
      }
      nodes.push(node)
      const groupKey = getGroupKey(dep)
      if (!groups.has(groupKey)) groups.set(groupKey, [])
      groups.get(groupKey)!.push(node)
    })

    // Add pods and connect to deployments
    filteredData.pods.forEach((pod, i) => {
      const node: DiagramNode = {
        id: `pod-${pod.namespace}-${pod.name}`,
        type: "pod",
        name: pod.name,
        namespace: pod.namespace,
        labels: pod.labels || {},
        x: 0, y: 0,
      }
      nodes.push(node)
      const groupKey = getGroupKey(pod)
      if (!groups.has(groupKey)) groups.set(groupKey, [])
      groups.get(groupKey)!.push(node)

      // Connect pod to deployment via labels
      const appLabel = pod.labels?.app || pod.labels?.["app.kubernetes.io/name"]
      if (appLabel) {
        const matchingDep = filteredData.deployments.find(d => 
          d.labels?.app === appLabel || d.labels?.["app.kubernetes.io/name"] === appLabel ||
          d.name.includes(appLabel)
        )
        if (matchingDep) {
          edges.push({
            from: `dep-${matchingDep.namespace}-${matchingDep.name}`,
            to: node.id,
            label: "manages"
          })
        }
      }
    })

    // Add services and connect to pods via selector
    filteredData.services.forEach((svc, i) => {
      const node: DiagramNode = {
        id: `svc-${svc.namespace}-${svc.name}`,
        type: "service",
        name: svc.name,
        namespace: svc.namespace,
        labels: svc.labels || {},
        x: 0, y: 0,
      }
      nodes.push(node)
      const groupKey = getGroupKey(svc)
      if (!groups.has(groupKey)) groups.set(groupKey, [])
      groups.get(groupKey)!.push(node)

      // Connect service to pods via selector
      const selector = svc.selector || {}
      if (Object.keys(selector).length > 0) {
        filteredData.pods.forEach(pod => {
          const podLabels = pod.labels || {}
          const matches = Object.entries(selector).every(
            ([key, value]) => podLabels[key] === value
          )
          if (matches) {
            edges.push({
              from: node.id,
              to: `pod-${pod.namespace}-${pod.name}`,
              label: "selects"
            })
          }
        })
      }
    })

    // Add ingresses and connect to services
    filteredData.ingresses.forEach((ing, i) => {
      const node: DiagramNode = {
        id: `ing-${ing.namespace}-${ing.name}`,
        type: "ingress",
        name: ing.name,
        namespace: ing.namespace,
        labels: ing.labels || {},
        x: 0, y: 0,
      }
      nodes.push(node)
      const groupKey = getGroupKey(ing)
      if (!groups.has(groupKey)) groups.set(groupKey, [])
      groups.get(groupKey)!.push(node)

      // Connect ingress to services (via backend reference in name)
      const backends = (ing as any).paths || []
      backends.forEach((path: any) => {
        const backendName = path.backend || path.service
        if (backendName) {
          const matchingSvc = filteredData.services.find(s => 
            s.name === backendName || s.name.includes(backendName)
          )
          if (matchingSvc) {
            edges.push({
              from: node.id,
              to: `svc-${matchingSvc.namespace}-${matchingSvc.name}`,
              label: path.path || "/"
            })
          }
        }
      })
    })

    // Calculate positions
    let groupY = 60
    groups.forEach((groupNodes, groupKey) => {
      const typeOrder = ["ingress", "service", "deployment", "pod"]
      const sorted = [...groupNodes].sort((a, b) => 
        typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
      )
      
      sorted.forEach((node, i) => {
        const col = typeOrder.indexOf(node.type)
        node.x = 100 + col * 200
        node.y = groupY + (i % Math.ceil(sorted.filter(n => n.type === node.type).length)) * 60
      })
      groupY += Math.max(sorted.length * 20, 100) + 40
    })

    return { nodes, edges, groups }
  }, [filteredData, groupBy])

  const svgHeight = Math.max(600, nodes.length * 40 + 100)
  const svgWidth = 900

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Building Cluster Diagram...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    )
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "deployment": return <Layers className="h-3 w-3" />
      case "pod": return <Box className="h-3 w-3" />
      case "service": return <Network className="h-3 w-3" />
      case "ingress": return <Globe className="h-3 w-3" />
      default: return <Server className="h-3 w-3" />
    }
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case "deployment": return { bg: "fill-blue-500/20", stroke: "stroke-blue-500", text: "text-blue-600" }
      case "pod": return { bg: "fill-emerald-500/20", stroke: "stroke-emerald-500", text: "text-emerald-600" }
      case "service": return { bg: "fill-purple-500/20", stroke: "stroke-purple-500", text: "text-purple-600" }
      case "ingress": return { bg: "fill-orange-500/20", stroke: "stroke-orange-500", text: "text-orange-600" }
      default: return { bg: "fill-muted", stroke: "stroke-border", text: "text-foreground" }
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Cluster Diagram</h2>
          <p className="text-xs text-muted-foreground">
            {nodes.length} resources, {edges.length} connections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedNs} onValueChange={setSelectedNs}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Namespace" />
            </SelectTrigger>
            <SelectContent>
              {namespaces.map(ns => (
                <SelectItem key={ns} value={ns}>
                  {ns === "all" ? "All Namespaces" : ns}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Group By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="namespace">Namespace</SelectItem>
              <SelectItem value="app">App Label</SelectItem>
              <SelectItem value="node">Node</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 border-l border-border pl-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="w-12 text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(1)}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-2">
        {[
          { type: "ingress", label: "Ingress" },
          { type: "service", label: "Service" },
          { type: "deployment", label: "Deployment" },
          { type: "pod", label: "Pod" },
        ].map(({ type, label }) => {
          const colors = getNodeColor(type)
          return (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`flex h-5 w-5 items-center justify-center rounded ${colors.text}`}>
                {getNodeIcon(type)}
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          )
        })}
      </div>

      {/* Diagram */}
      <div className="overflow-auto p-4" style={{ maxHeight: "600px" }}>
        <svg
          width={svgWidth * zoom}
          height={svgHeight * zoom}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" className="fill-muted-foreground/50" />
            </marker>
          </defs>

          {/* Group backgrounds */}
          {Array.from(groups.entries()).map(([groupKey, groupNodes], i) => {
            if (groupNodes.length === 0) return null
            const minX = Math.min(...groupNodes.map(n => n.x)) - 30
            const maxX = Math.max(...groupNodes.map(n => n.x)) + 150
            const minY = Math.min(...groupNodes.map(n => n.y)) - 25
            const maxY = Math.max(...groupNodes.map(n => n.y)) + 35
            return (
              <g key={groupKey}>
                <rect
                  x={minX}
                  y={minY}
                  width={maxX - minX}
                  height={maxY - minY}
                  rx="8"
                  className="fill-muted/30 stroke-border"
                  strokeDasharray="4 2"
                />
                <text x={minX + 8} y={minY + 14} className="fill-muted-foreground text-[10px]">
                  {groupKey}
                </text>
              </g>
            )
          })}

          {/* Edges */}
          {edges.map((edge, i) => {
            const from = nodes.find(n => n.id === edge.from)
            const to = nodes.find(n => n.id === edge.to)
            if (!from || !to) return null

            const x1 = from.x + 60
            const y1 = from.y + 12
            const x2 = to.x
            const y2 = to.y + 12

            const midX = (x1 + x2) / 2
            const midY = (y1 + y2) / 2

            return (
              <g key={i}>
                <path
                  d={`M${x1},${y1} Q${midX},${y1} ${midX},${midY} Q${midX},${y2} ${x2},${y2}`}
                  fill="none"
                  className="stroke-muted-foreground/30"
                  strokeWidth="1.5"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const colors = getNodeColor(node.type)
            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <rect
                  width="120"
                  height="24"
                  rx="4"
                  className={`${colors.bg} ${colors.stroke}`}
                  strokeWidth="1.5"
                />
                <foreignObject x="4" y="4" width="112" height="16">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={colors.text}>{getNodeIcon(node.type)}</span>
                    <span className="truncate text-[10px] font-medium text-foreground">
                      {node.name.length > 15 ? node.name.slice(0, 15) + "..." : node.name}
                    </span>
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </svg>
      </div>

      {nodes.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No resources found for the selected namespace
        </div>
      )}
    </div>
  )
}
