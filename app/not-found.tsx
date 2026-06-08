import Link from 'next/link'
import { PawPrint, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-gradient-hero flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-amber flex items-center justify-center mb-6 shadow-warm-lg">
        <PawPrint className="w-10 h-10 text-white" />
      </div>
      <h1 className="font-heading font-extrabold text-4xl text-foreground mb-3">Oops!</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-sm">
        This page seems to have wandered off. Let&apos;s get you back on track.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-gradient-amber text-white font-semibold px-6 py-3.5 rounded-full shadow-warm-md hover:shadow-warm-lg transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  )
}
