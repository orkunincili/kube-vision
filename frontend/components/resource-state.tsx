import { AlertCircle, Loader2 } from "lucide-react"

export function ResourceLoadingState({ message }: { message: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-xs">{message}</span>
    </div>
  )
}

export function ResourceErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-destructive">Connection Error</h3>
        <p className="max-w-[300px] text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
