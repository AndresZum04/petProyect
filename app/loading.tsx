import { PawPrint } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-dvh bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-amber flex items-center justify-center animate-pulse-warm shadow-warm-md">
          <PawPrint className="w-7 h-7 text-white" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}
