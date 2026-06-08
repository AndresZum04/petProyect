'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Phone, Mail, Users, PawPrint, Plus, Loader2, CheckCircle2, UserPlus, Stethoscope, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/hooks/useTranslations'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import useVetStore from '@/store/useVetStore'
import useDemoAuthStore from '@/store/useDemoAuthStore'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'

export default function VetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const t = useTranslations()
  const { vets, rescuers, vetPets, addRescuer, addVetPet } = useVetStore()
  const { role: demoRole } = useDemoAuthStore()

  const vet = vets.find(v => v.id === id)
  const myRescuers = rescuers.filter(r => r.vet_id === id)
  const myPets = vetPets.filter(p => p.vet_id === id)

  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUserName, setCurrentUserName] = useState('')
  const [joinOpen, setJoinOpen] = useState(false)
  const [addPetOpen, setAddPetOpen] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const [addPetLoading, setAddPetLoading] = useState(false)
  const [joinForm, setJoinForm] = useState({ name: '', role: 'rescuer' })
  const [petForm, setPetForm] = useState({ name: '', species: 'dog', age_label: '', description: '', photoUrl: '' })

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoggedIn(!!demoRole)
      setIsAdmin(demoRole === 'admin')
      return
    }
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setIsLoggedIn(true)
      setCurrentUserName(data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '')
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      setIsAdmin(profile?.role === 'admin')
    })
  }, [demoRole])

  // Pre-rellenar nombre si está logueado
  useEffect(() => {
    if (currentUserName && !joinForm.name) {
      setJoinForm(p => ({ ...p, name: currentUserName }))
    }
  }, [currentUserName]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!joinForm.name) return
    setJoinLoading(true)

    const roleName = (t.vets.join.roles as Record<string, string>)[joinForm.role]

    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 600))
      addRescuer({ vet_id: id, name: joinForm.name, role: roleName })
    } else {
      try {
        const supabase = createClient()
        const { error } = await supabase.from('rescuers').insert({
          vet_id: id,
          name: joinForm.name,
          role: roleName,
        })
        if (error) throw error
        addRescuer({ vet_id: id, name: joinForm.name, role: roleName })
      } catch {
        toast.error('Error al enviar la solicitud')
        setJoinLoading(false)
        return
      }
    }

    setJoinLoading(false)
    setJoinOpen(false)
    setJoinForm(p => ({ ...p, role: 'rescuer' }))
    toast.success(t.vets.join.success)
  }

  async function handleAddPet(e: React.FormEvent) {
    e.preventDefault()
    if (!petForm.name || !petForm.age_label) return
    setAddPetLoading(true)
    await new Promise(r => setTimeout(r, 600))
    addVetPet({
      vet_id: id,
      name: petForm.name,
      species: petForm.species as 'dog' | 'cat' | 'bird' | 'rabbit' | 'other',
      age_label: petForm.age_label,
      description: petForm.description || undefined,
      photos: petForm.photoUrl ? [petForm.photoUrl] : undefined,
      status: 'available',
    })
    setAddPetLoading(false)
    setAddPetOpen(false)
    setPetForm({ name: '', species: 'dog', age_label: '', description: '', photoUrl: '' })
    toast.success(t.vets.addPet.success)
  }

  if (!vet) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <main className="pt-16 pb-24 flex items-center justify-center">
          <div className="text-center py-20">
            <Stethoscope className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading font-semibold text-foreground mb-4">Veterinaria no encontrada</p>
            <Link href="/vets" className="text-primary-500 hover:underline text-sm">{t.vets.profile.back}</Link>
          </div>
        </main>
        <MobileNav />
      </div>
    )
  }

  const speciesOptions = ['dog','cat','bird','rabbit','other'].map(s => ({
    value: s, label: (t.browse.speciesLabel as Record<string,string>)[s]
  }))

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400'

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="pt-16 pb-24 md:pb-16">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/vets" className="inline-flex items-center gap-1.5 text-muted-foreground text-sm mb-5 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t.vets.profile.back}
          </Link>

          {/* Vet Header */}
          <div className="bg-white rounded-2xl shadow-card p-5 mb-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center flex-none">
                <Stethoscope className="w-7 h-7 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-heading font-extrabold text-xl text-foreground mb-1">{vet.name}</h1>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
                  <MapPin className="w-3.5 h-3.5" /> {vet.city}
                </div>
                {vet.description && <p className="text-sm text-muted-foreground leading-relaxed">{vet.description}</p>}
              </div>
            </div>
            {(vet.phone || vet.email) && (
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4">
                {vet.phone && (
                  <a href={`tel:${vet.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="w-4 h-4 text-primary-400" /> {vet.phone}
                  </a>
                )}
                {vet.email && (
                  <a href={`mailto:${vet.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="w-4 h-4 text-primary-400" /> {vet.email}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Rescuers Section */}
          <section className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-500" />
                {t.vets.profile.rescuersTitle}
                <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{myRescuers.length}</span>
              </h2>
              {/* Botón unirse: solo para usuarios logueados */}
              {isLoggedIn ? (
                <button onClick={() => { setJoinOpen(!joinOpen); setAddPetOpen(false) }} className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  <UserPlus className="w-4 h-4" /> {t.vets.profile.joinButton}
                </button>
              ) : (
                <Link href="/login" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary-600 transition-colors">
                  <LogIn className="w-4 h-4" /> Inicia sesión para unirte
                </Link>
              )}
            </div>

            {/* Join Form — solo para logueados */}
            {joinOpen && isLoggedIn && (
              <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-3">
                <h3 className="font-semibold text-foreground text-sm mb-3">{t.vets.join.subtitle(vet.name)}</h3>
                <form onSubmit={handleJoin} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">{t.vets.join.name}</label>
                      <input type="text" placeholder={t.vets.join.namePlaceholder} value={joinForm.name} onChange={e => setJoinForm(p => ({ ...p, name: e.target.value }))} required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">{t.vets.join.role}</label>
                      <select value={joinForm.role} onChange={e => setJoinForm(p => ({ ...p, role: e.target.value }))} className={inputCls}>
                        {Object.entries(t.vets.join.roles).map(([k, v]) => (
                          <option key={k} value={k}>{v as string}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setJoinOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
                      {t.vets.join.cancel}
                    </button>
                    <button type="submit" disabled={joinLoading} className="flex-1 flex items-center justify-center gap-2 bg-gradient-amber text-white py-2.5 rounded-xl text-sm font-semibold shadow-warm disabled:opacity-70">
                      {joinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {joinLoading ? t.vets.join.submitting : t.vets.join.submit}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {myRescuers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 bg-white rounded-2xl border border-border">{t.vets.profile.noRescuers}</p>
            ) : (
              <div className="space-y-2">
                {myRescuers.map(r => (
                  <div key={r.id} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-card">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-none">
                      <span className="text-primary-700 font-bold text-xs">{r.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{r.name}</p>
                      {r.role && <p className="text-xs text-muted-foreground">{r.role}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pets Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                <PawPrint className="w-4 h-4 text-primary-500" />
                {t.vets.profile.petsTitle}
                <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{myPets.length}</span>
              </h2>
              {/* Agregar mascota: solo admin */}
              {isAdmin && (
                <button onClick={() => { setAddPetOpen(!addPetOpen); setJoinOpen(false) }} className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  <Plus className="w-4 h-4" /> {t.vets.profile.addPetButton}
                </button>
              )}
            </div>

            {/* Add Pet Form — solo admin */}
            {addPetOpen && isAdmin && (
              <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-3">
                <h3 className="font-semibold text-foreground text-sm mb-3">{t.vets.addPet.subtitle(vet.name)}</h3>
                <form onSubmit={handleAddPet} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">{t.vets.addPet.name}</label>
                      <input type="text" placeholder={t.vets.addPet.namePlaceholder} value={petForm.name} onChange={e => setPetForm(p => ({ ...p, name: e.target.value }))} required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">{t.vets.addPet.species}</label>
                      <select value={petForm.species} onChange={e => setPetForm(p => ({ ...p, species: e.target.value }))} className={inputCls}>
                        {speciesOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t.vets.addPet.age}</label>
                    <input type="text" placeholder={t.vets.addPet.agePlaceholder} value={petForm.age_label} onChange={e => setPetForm(p => ({ ...p, age_label: e.target.value }))} required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t.vets.addPet.description}</label>
                    <textarea placeholder={t.vets.addPet.descriptionPlaceholder} value={petForm.description} onChange={e => setPetForm(p => ({ ...p, description: e.target.value }))} rows={2} className={cn(inputCls, 'resize-none')} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t.vets.addPet.photoUrl}</label>
                    <input type="url" placeholder={t.vets.addPet.photoPlaceholder} value={petForm.photoUrl} onChange={e => setPetForm(p => ({ ...p, photoUrl: e.target.value }))} className={inputCls} />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setAddPetOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
                      {t.vets.addPet.cancel}
                    </button>
                    <button type="submit" disabled={addPetLoading} className="flex-1 flex items-center justify-center gap-2 bg-gradient-amber text-white py-2.5 rounded-xl text-sm font-semibold shadow-warm disabled:opacity-70">
                      {addPetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {addPetLoading ? t.vets.addPet.submitting : t.vets.addPet.submit}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {myPets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 bg-white rounded-2xl border border-border">{t.vets.profile.noPets}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {myPets.map(pet => (
                  <div key={pet.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                    {pet.photos?.[0] ? (
                      <div className="relative aspect-[4/3] bg-secondary">
                        <Image src={pet.photos[0]} alt={pet.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 200px" />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-primary-50 flex items-center justify-center">
                        <PawPrint className="w-8 h-8 text-primary-200" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="font-semibold text-sm text-foreground">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">{(t.browse.speciesLabel as Record<string,string>)[pet.species]} · {pet.age_label}</p>
                      {pet.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pet.description}</p>}
                      <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border mt-2', pet.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200')}>
                        <CheckCircle2 className="w-3 h-3" />
                        {pet.status === 'available' ? t.vets.profile.available : t.vets.profile.adopted}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
