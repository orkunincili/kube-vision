"use client"

import { Box, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardHeader({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Box className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">KubeVision</h1>
          <p className="text-xs text-muted-foreground">Cluster Dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>production-cluster</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </header>
  )
}
