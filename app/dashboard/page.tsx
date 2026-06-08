'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Eye, ClipboardList, LogOut, PawPrint, Loader2, X, CheckCircle2, AlertCircle, Upload, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { SPECIES_COLORS, cn } from '@/lib/utils'
import { useTranslations } from '@/hooks/useTranslations'
import useDemoAuthStore from '@/store/useDemoAuthStore'
import type { Pet } from '@/types'

const DEMO_PETS: Pet[] = [
  { id: 'demo-1', name: 'Luna', species: 'dog', breed: 'Golden Retriever Mix', age_label: '2 años', size: 'large', gender: 'female', status: 'available', special_needs: false, personality_tags: ['juguetona', 'cariñosa'], photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&q=80'], location: 'Ciudad de México', created_at: new Date().toISOString() },
  { id: 'demo-2', name: 'Mochi', species: 'cat', breed: 'Doméstico de Pelo Corto', age_label: '1 año', size: 'small', gender: 'male', status: 'available', special_needs: false, personality_tags: ['curioso'], photos: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&q=80'], location: 'Guadalajara', created_at: new Date().toISOString() },
  { id: 'demo-3', name: 'Bruno', species: 'dog', breed: 'Bulldog Francés', age_label: '4 años', size: 'small', gender: 'male', status: 'reserved', special_needs: true, personality_tags: ['calmado'], photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&q=80'], location: 'Monterrey', created_at: new Date().toISOString() },
]

const EMPTY_FORM = {
  name: '', species: 'dog', breed: '', age_label: '', size: 'medium', gender: 'male',
  status: 'available', story: '', personality_tags: '', health_notes: '',
  special_needs: false, photos: '', location: '', contact: '', requirements: '', intake_date: '',
}

const STATUS_BADGE: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  adopted:   'bg-gray-100 text-gray-500',
  reserved:  'bg-amber-100 text-amber-700',
}

export default function DashboardPage() {
  const router = useRouter()
  const t = useTranslations()
  const { role: demoRole, logout: demoLogout } = useDemoAuthStore()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editPet, setEditPet] = useState<Pet | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadDashboard() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadDashboard() {
    setLoading(true)
    if (!isSupabaseConfigured) {
      if (!demoRole) { router.push('/login'); return }
      if (demoRole !== 'admin') { router.push('/pets'); return }
      setIsDemo(true)
      setPets(DEMO_PETS)
      setLoading(false)
      return
    }
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/pets'); return }

      const { data, error } = await supabase.from('pets').select('*').order('created_at', { ascending: false })
      if (error || !data) { setIsDemo(true); setPets(DEMO_PETS) } else { setPets(data) }
    } catch {
      setIsDemo(true); setPets(DEMO_PETS)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditPet(null)
    setForm(EMPTY_FORM)
    setUploadedUrls([])
    setShowForm(true)
  }

  function openEdit(pet: Pet) {
    setEditPet(pet)
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age_label: pet.age_label,
      size: pet.size || 'medium',
      gender: pet.gender || 'male',
      status: pet.status,
      story: pet.story || '',
      personality_tags: (pet.personality_tags || []).join(', '),
      health_notes: pet.health_notes || '',
      special_needs: pet.special_needs,
      photos: (pet.photos || []).join('\n'),
      location: pet.location || '',
      contact: pet.contact || '',
      requirements: pet.requirements || '',
      intake_date: pet.intake_date ? pet.intake_date.slice(0, 10) : '',
    })
    setUploadedUrls(pet.photos || [])
    setShowForm(true)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const results = await Promise.all(files.map(f => uploadToCloudinary(f)))
      setUploadedUrls(prev => [...prev, ...results])
      toast.success(`${results.length} imagen(es) subida(s)`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imágenes')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeUploadedUrl(url: string) {
    setUploadedUrls(prev => prev.filter(u => u !== url))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const manualUrls = form.photos ? form.photos.split('\n').map(u => u.trim()).filter(Boolean) : []
      const allPhotos = [...uploadedUrls, ...manualUrls.filter(u => !uploadedUrls.includes(u))]

      const payload: Record<string, unknown> = {
        name: form.name,
        species: form.species,
        breed: form.breed || null,
        age_label: form.age_label,
        size: form.size,
        gender: form.gender,
        status: form.status,
        story: form.story || null,
        personality_tags: form.personality_tags ? form.personality_tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        health_notes: form.health_notes || null,
        special_needs: form.special_needs,
        photos: allPhotos,
        avatar_url: allPhotos[0] || null,
        location: form.location || null,
        contact: form.contact || null,
        requirements: form.requirements || null,
        intake_date: form.intake_date || null,
      }

      if (isDemo) {
        if (editPet) {
          setPets(prev => prev.map(p => p.id === editPet.id ? { ...p, ...payload } as Pet : p))
        } else {
          const newPet: Pet = { id: `demo-${Date.now()}`, created_at: new Date().toISOString(), ...payload } as Pet
          setPets(prev => [newPet, ...prev])
        }
        toast.success(editPet ? '¡Mascota actualizada!' : '¡Mascota agregada!')
        setShowForm(false)
        return
      }

      const supabase = createClient()
      if (editPet) {
        await supabase.from('pets').update(payload).eq('id', editPet.id)
        toast.success('¡Mascota actualizada!')
      } else {
        await supabase.from('pets').insert(payload)
        toast.success('¡Mascota agregada!')
      }
      loadDashboard()
      setShowForm(false)
    } catch {
      toast.error('Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta mascota?')) return
    setDeleting(id)
    try {
      if (isDemo) { setPets(prev => prev.filter(p => p.id !== id)); toast.success('Mascota eliminada'); return }
      const supabase = createClient()
      await supabase.from('pets').delete().eq('id', id)
      toast.success('Mascota eliminada')
      setPets(prev => prev.filter(p => p.id !== id))
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  async function handleLogout() {
    if (isSupabaseConfigured) { const supabase = createClient(); await supabase.auth.signOut() } else { demoLogout() }
    router.push('/')
  }

  const stats = [
    { label: t.dashboard.stats.total,     value: pets.length,                                       color: 'text-foreground' },
    { label: t.dashboard.stats.available, value: pets.filter(p => p.status === 'available').length,  color: 'text-green-600' },
    { label: t.dashboard.stats.adopted,   value: pets.filter(p => p.status === 'adopted').length,    color: 'text-primary-600' },
  ]

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white'

  return (
    <div className="min-h-dvh bg-background">
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg text-foreground">
            <div className="w-7 h-7 rounded-lg bg-gradient-amber flex items-center justify-center">
              <PawPrint className="w-3.5 h-3.5 text-white" />
            </div>
            {t.dashboard.title}
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/requests" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden md:inline">{t.dashboard.requests}</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">{t.dashboard.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {isDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-amber-800 text-sm">
            <AlertCircle className="w-4 h-4 flex-none" />
            {t.dashboard.demoNotice}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-card text-center">
              <p className={cn('font-heading font-extrabold text-3xl', color)}>{value}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-xl text-foreground">{t.dashboard.petsTitle}</h1>
          <button onClick={openAdd} className="flex items-center gap-2 bg-gradient-amber text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-warm hover:shadow-warm-md transition-all">
            <Plus className="w-4 h-4" /> {t.dashboard.addPet}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {pets.map(pet => (
              <div key={pet.id} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-none bg-secondary ring-2 ring-primary-100">
                  {(pet.avatar_url || pet.photos?.[0]) ? (
                    <Image src={pet.avatar_url || pet.photos![0]} alt={pet.name} fill className="object-cover" />
                  ) : (
                    <PawPrint className="w-5 h-5 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-bold text-foreground">{pet.name}</h3>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', SPECIES_COLORS[pet.species] || SPECIES_COLORS.other)}>
                      {(t.browse.speciesLabel as Record<string, string>)[pet.species] || pet.species}
                    </span>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_BADGE[pet.status] || STATUS_BADGE.available)}>
                      {(t.dashboard.statusValues as Record<string, string>)[pet.status] || pet.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm truncate mt-0.5">
                    {pet.breed ? `${pet.breed} · ` : ''}{pet.age_label}{pet.location ? ` · ${pet.location}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-none">
                  <Link href={`/pets/${pet.id}`} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button onClick={() => openEdit(pet)} className="p-2 text-muted-foreground hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(pet.id)} disabled={deleting === pet.id} className="p-2 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                    {deleting === pet.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            {pets.length === 0 && (
              <div className="text-center py-16">
                <PawPrint className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-heading font-semibold text-foreground mb-1">{t.dashboard.noPets}</p>
                <p className="text-muted-foreground text-sm">{t.dashboard.noPetsHint}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal del formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="bg-white w-full max-w-xl rounded-t-3xl md:rounded-3xl shadow-warm-lg max-h-[92dvh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="font-heading font-bold text-lg">{editPet ? t.dashboard.editTitle : t.dashboard.addTitle}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Básicos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.name} *</label>
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Luna" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.species} *</label>
                  <select value={form.species} onChange={e => setForm(p => ({ ...p, species: e.target.value }))} className={inputCls}>
                    {['dog', 'cat', 'bird', 'rabbit', 'other'].map(s => <option key={s} value={s}>{(t.browse.speciesLabel as Record<string, string>)[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.breed}</label>
                  <input value={form.breed} onChange={e => setForm(p => ({ ...p, breed: e.target.value }))} placeholder="Golden Retriever Mix" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.age} *</label>
                  <input required value={form.age_label} onChange={e => setForm(p => ({ ...p, age_label: e.target.value }))} placeholder={t.dashboard.form.agePlaceholder} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.size}</label>
                  <select value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} className={inputCls}>
                    <option value="small">{t.browse.size.small}</option>
                    <option value="medium">{t.browse.size.medium}</option>
                    <option value="large">{t.browse.size.large}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.gender}</label>
                  <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className={inputCls}>
                    <option value="male">{t.dashboard.form.male}</option>
                    <option value="female">{t.dashboard.form.female}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.status}</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                    <option value="available">{t.dashboard.statusValues.available}</option>
                    <option value="adopted">{t.dashboard.statusValues.adopted}</option>
                    <option value="reserved">{t.dashboard.statusValues.reserved}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.intakeDate}</label>
                  <input type="date" value={form.intake_date} onChange={e => setForm(p => ({ ...p, intake_date: e.target.value }))} className={inputCls} />
                </div>
              </div>

              {/* Ubicación y contacto */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.location}</label>
                  <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder={t.dashboard.form.locationPlaceholder} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.contact}</label>
                  <input value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} placeholder={t.dashboard.form.contactPlaceholder} className={inputCls} />
                </div>
              </div>

              {/* Imágenes con Cloudinary */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.uploadImages}</label>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-primary-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">{t.dashboard.form.uploading}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <ImagePlus className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{t.dashboard.form.uploadHint}</p>
                    </div>
                  )}
                </div>

                {/* Preview de imágenes subidas */}
                {uploadedUrls.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {uploadedUrls.map((url, i) => (
                      <div key={url} className="relative group">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary ring-2 ring-primary-100">
                          <Image src={url} alt={`img-${i}`} fill className="object-cover" />
                          {i === 0 && (
                            <span className="absolute bottom-0 left-0 right-0 text-[9px] font-bold text-center bg-primary-500 text-white py-0.5">Principal</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedUrl(url)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-2">{t.dashboard.form.orPasteUrl}</p>
                <textarea value={form.photos} onChange={e => setForm(p => ({ ...p, photos: e.target.value }))} rows={2} placeholder="https://..." className={cn(inputCls, 'resize-none mt-1')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.tags}</label>
                <input value={form.personality_tags} onChange={e => setForm(p => ({ ...p, personality_tags: e.target.value }))} placeholder="juguetona, cariñosa, energética" className={inputCls} />
                <p className="text-xs text-muted-foreground mt-1">{t.dashboard.form.tagsHint}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.story}</label>
                <textarea value={form.story} onChange={e => setForm(p => ({ ...p, story: e.target.value }))} rows={3} placeholder={t.dashboard.form.storyPlaceholder} className={cn(inputCls, 'resize-none')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.requirements}</label>
                <textarea value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} rows={2} placeholder={t.dashboard.form.requirementsPlaceholder} className={cn(inputCls, 'resize-none')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t.dashboard.form.healthNotes}</label>
                <input value={form.health_notes} onChange={e => setForm(p => ({ ...p, health_notes: e.target.value }))} placeholder={t.dashboard.form.healthPlaceholder} className={inputCls} />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.special_needs} onChange={e => setForm(p => ({ ...p, special_needs: e.target.checked }))} className="w-4 h-4 rounded border-border text-primary-500" />
                <span className="text-sm font-medium text-foreground">{t.dashboard.form.specialNeeds}</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
                  {t.dashboard.form.cancel}
                </button>
                <button type="submit" disabled={saving || uploading} className="flex-1 flex items-center justify-center gap-2 bg-gradient-amber text-white py-3 rounded-xl text-sm font-semibold shadow-warm disabled:opacity-70">
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.dashboard.form.saving}</>
                    : <><CheckCircle2 className="w-4 h-4" /> {editPet ? t.dashboard.form.save : t.dashboard.form.add}</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
