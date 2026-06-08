'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Stethoscope, MapPin, Users, PawPrint, Search, Plus } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import { useTranslations } from '@/hooks/useTranslations'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import useVetStore from '@/store/useVetStore'
import useDemoAuthStore from '@/store/useDemoAuthStore'

export default function VetsPage() {
  const t = useTranslations()
  const { vets, rescuers, vetPets } = useVetStore()
  const { role: demoRole } = useDemoAuthStore()
  const [search, setSearch] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) { setIsAdmin(demoRole === 'admin'); return }
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      setIsAdmin(profile?.role === 'admin')
    })
  }, [demoRole])

  const filtered = vets.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="pt-16 pb-24 md:pb-16">
        <div className="bg-gradient-to-br from-primary-50 to-amber-50 border-b border-amber-100">
          <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-amber flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground">{t.vets.pageTitle}</h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base mb-6">{t.vets.pageSubtitle}</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder={t.vets.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              {isAdmin && (
                <Link href="/vets/register" className="flex items-center gap-2 bg-gradient-amber text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-warm whitespace-nowrap">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.vets.registerButton}</span>
                  <span className="sm:hidden">Registrar</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Stethoscope className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-heading font-semibold text-foreground">{t.vets.noVets}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(vet => {
                const vetRescuers = rescuers.filter(r => r.vet_id === vet.id)
                const vetPetsCount = vetPets.filter(p => p.vet_id === vet.id).length
                return (
                  <div key={vet.id} className="bg-white rounded-2xl shadow-card p-5 hover:shadow-warm-md transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-heading font-bold text-foreground text-lg leading-tight mb-1">{vet.name}</h2>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                          <MapPin className="w-3.5 h-3.5 flex-none" /> {vet.city}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center flex-none">
                        <Stethoscope className="w-6 h-6 text-primary-500" />
                      </div>
                    </div>
                    {vet.description && <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{vet.description}</p>}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 text-primary-400" /> {t.vets.rescuersCount(vetRescuers.length)}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <PawPrint className="w-4 h-4 text-primary-400" /> {t.vets.petsCount(vetPetsCount)}
                      </div>
                    </div>
                    <Link href={`/vets/${vet.id}`} className="inline-flex items-center gap-2 bg-gradient-amber text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-warm hover:shadow-warm-md transition-all">
                      {t.vets.viewProfile}
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
