'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Clock, CheckCircle2, XCircle, PawPrint, Loader2, Heart } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { AdoptionRequest } from '@/types'

const STATUS_CONFIG = {
  pending:  { icon: Clock,        label: 'En revisión',  className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { icon: CheckCircle2, label: 'Aprobada',     className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { icon: XCircle,      label: 'Rechazada',    className: 'bg-red-50 text-red-600 border-red-200' },
}

export default function MyRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<AdoptionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => { loadRequests() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadRequests() {
    if (!isSupabaseConfigured) { router.push('/login'); return }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    setUserEmail(user.email || '')

    const { data } = await supabase
      .from('adoption_requests')
      .select('*, pets(name, photos, avatar_url)')
      .eq('email', user.email)
      .order('created_at', { ascending: false })

    setRequests(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/pets" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-heading font-bold text-lg text-foreground">Mis Solicitudes</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <PawPrint className="w-8 h-8 text-primary-400" />
            </div>
            <p className="font-heading font-semibold text-foreground mb-1">Aún no tienes solicitudes</p>
            <p className="text-muted-foreground text-sm mb-6">Cuando solicites adoptar una mascota aparecerá aquí</p>
            <Link href="/pets" className="inline-flex items-center gap-2 bg-gradient-amber text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-warm">
              <Heart className="w-4 h-4" /> Ver mascotas
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-4">{userEmail} · {requests.length} solicitud{requests.length !== 1 ? 'es' : ''}</p>
            {requests.map(req => {
              const config = STATUS_CONFIG[req.status]
              const StatusIcon = config.icon
              const pet = req.pets as { name: string; photos?: string[]; avatar_url?: string } | undefined
              const photo = pet?.avatar_url || pet?.photos?.[0]
              return (
                <div key={req.id} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden flex-none bg-secondary ring-2 ring-primary-100">
                    {photo ? (
                      <Image src={photo} alt={pet?.name || 'mascota'} fill className="object-cover" sizes="56px" />
                    ) : (
                      <PawPrint className="w-5 h-5 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">
                      Solicitud para <strong>{pet?.name || 'mascota'}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(req.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                  <span className={cn('flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border flex-none', config.className)}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
