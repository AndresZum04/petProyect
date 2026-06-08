'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, PawPrint, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/hooks/useTranslations'
import useDemoAuthStore from '@/store/useDemoAuthStore'
import type { AdoptionRequest } from '@/types'

const DEMO_REQUESTS: AdoptionRequest[] = [
  {
    id: 'req-1', pet_id: 'demo-1', full_name: 'Sofia Martinez', email: 'sofia@example.com', phone: '+1 555 1234',
    housing_type: 'house', experience: 'experienced', motivation: 'We have a big yard and lots of love to give. We had a Golden Retriever for 12 years and recently lost her.',
    status: 'pending', created_at: new Date(Date.now() - 3600000).toISOString(),
    pets: { name: 'Luna', photos: ['https://images.unsplash.com/photo-1612940960267-26e9843ea1e8?w=100&q=80'] },
  },
  {
    id: 'req-2', pet_id: 'demo-2', full_name: 'Carlos Rivera', email: 'carlos@example.com', phone: '+1 555 5678',
    housing_type: 'apartment', experience: 'some', motivation: 'I work from home and would love the company. I am patient and ready for a cat.',
    status: 'pending', created_at: new Date(Date.now() - 7200000).toISOString(),
    pets: { name: 'Mochi', photos: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&q=80'] },
  },
  {
    id: 'req-3', pet_id: 'demo-3', full_name: 'Ana Gutiérrez', email: 'ana@example.com', phone: '+1 555 9012',
    housing_type: 'house', experience: 'experienced', motivation: 'Bruno sounds perfect for our calm family lifestyle.',
    status: 'approved', created_at: new Date(Date.now() - 86400000).toISOString(),
    pets: { name: 'Bruno', photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=100&q=80'] },
  },
]

const STATUS_CONFIG = {
  pending:  { icon: Clock,        className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { icon: CheckCircle2, className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { icon: XCircle,      className: 'bg-red-50 text-red-600 border-red-200' },
}

export default function RequestsPage() {
  const router = useRouter()
  const t = useTranslations()
  const { role: demoRole } = useDemoAuthStore()
  const [requests, setRequests] = useState<AdoptionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [actioning, setActioning] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { loadRequests() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadRequests() {
    setLoading(true)
    if (!isSupabaseConfigured) {
      if (!demoRole) { router.push('/login'); return }
      setIsDemo(true)
      setRequests(DEMO_REQUESTS)
      setLoading(false)
      return
    }
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('adoption_requests')
        .select('*, pets(name, photos)')
        .order('created_at', { ascending: false })

      if (error || !data) {
        setIsDemo(true)
        setRequests(DEMO_REQUESTS)
      } else {
        setRequests(data as AdoptionRequest[])
      }
    } catch {
      setIsDemo(true)
      setRequests(DEMO_REQUESTS)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setActioning(id)
    try {
      if (!isDemo) {
        const supabase = createClient()
        await supabase.from('adoption_requests').update({ status }).eq('id', id)
      }
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      toast.success(status === 'approved' ? 'Request approved!' : 'Request rejected')
    } catch {
      toast.error('Action failed')
    } finally {
      setActioning(null)
    }
  }

  const pending = requests.filter(r => r.status === 'pending')
  const resolved = requests.filter(r => r.status !== 'pending')

  return (
    <div className="min-h-dvh bg-background">
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-heading font-bold text-lg text-foreground">{t.requestsPage.title}</h1>
          {pending.length > 0 && (
            <span className="ml-auto bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {pending.length} {t.requestsPage.pending}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {isDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-amber-800 text-sm">
            <AlertCircle className="w-4 h-4 flex-none" />
            {t.requestsPage.demoNotice}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <PawPrint className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading font-semibold text-foreground mb-1">{t.requestsPage.noRequests}</p>
            <p className="text-muted-foreground text-sm">{t.requestsPage.noRequestsHint}</p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <section className="mb-8">
                <h2 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  {t.requestsPage.pendingSection}
                </h2>
                <div className="space-y-3">
                  {pending.map(req => (
                    <RequestCard
                      key={req.id} req={req}
                      expanded={expanded === req.id}
                      onToggle={() => setExpanded(expanded === req.id ? null : req.id)}
                      onApprove={() => updateStatus(req.id, 'approved')}
                      onReject={() => updateStatus(req.id, 'rejected')}
                      actioning={actioning === req.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {resolved.length > 0 && (
              <section>
                <h2 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  {t.requestsPage.resolvedSection}
                </h2>
                <div className="space-y-3">
                  {resolved.map(req => (
                    <RequestCard
                      key={req.id} req={req}
                      expanded={expanded === req.id}
                      onToggle={() => setExpanded(expanded === req.id ? null : req.id)}
                      onApprove={() => updateStatus(req.id, 'approved')}
                      onReject={() => updateStatus(req.id, 'rejected')}
                      actioning={actioning === req.id}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function RequestCard({
  req, expanded, onToggle, onApprove, onReject, actioning,
}: {
  req: AdoptionRequest
  expanded: boolean
  onToggle: () => void
  onApprove: () => void
  onReject: () => void
  actioning: boolean
}) {
  const t = useTranslations()
  const config = STATUS_CONFIG[req.status]
  const StatusIcon = config.icon

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-4">
        <div className="flex items-center gap-3">
          {req.pets?.photos?.[0] && (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-none bg-secondary">
              <Image src={req.pets.photos[0]} alt={req.pets?.name || 'pet'} fill className="object-cover" sizes="48px" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground text-sm">{req.full_name}</p>
              <span className={cn('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border', config.className)}>
                <StatusIcon className="w-3 h-3" />
                {(t.requestsPage.statusLabels as Record<string, string>)[req.status]}
              </span>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">
              {t.requestsPage.wantsToAdopt} <strong>{req.pets?.name || 'a pet'}</strong> · {format(new Date(req.created_at), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">{t.requestsPage.email}</p>
              <p className="text-foreground font-medium">{req.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{t.requestsPage.phone}</p>
              <p className="text-foreground font-medium">{req.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{t.requestsPage.housing}</p>
              <p className="text-foreground font-medium capitalize">{req.housing_type?.replace('_', ' ') || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{t.requestsPage.experience}</p>
              <p className="text-foreground font-medium capitalize">{req.experience || '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">{t.requestsPage.motivation}</p>
            <p className="text-foreground text-sm bg-secondary rounded-xl p-3 leading-relaxed">{req.motivation}</p>
          </div>

          {req.status === 'pending' && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={onReject}
                disabled={actioning}
                className="flex-1 flex items-center justify-center gap-1.5 border border-border text-muted-foreground py-2.5 rounded-xl text-sm font-medium hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                {actioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {t.requestsPage.reject}
              </button>
              <button
                onClick={onApprove}
                disabled={actioning}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-amber text-white py-2.5 rounded-xl text-sm font-semibold shadow-warm transition-all disabled:opacity-50"
              >
                {actioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {t.requestsPage.approve}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
