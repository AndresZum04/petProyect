'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import { useTranslations } from '@/hooks/useTranslations'
import useVetStore from '@/store/useVetStore'
import type { Pet } from '@/types'

const schema = z.object({
  full_name:    z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email:        z.string().email('Ingresa un correo electrónico válido'),
  phone:        z.string().min(7, 'Ingresa un número de teléfono válido'),
  housing_type: z.string().min(1, 'Selecciona tu tipo de vivienda'),
  experience:   z.string().min(1, 'Selecciona tu nivel de experiencia'),
  motivation:   z.string().min(20, 'Cuéntanos un poco más (mínimo 20 caracteres)'),
})

type FormData = z.infer<typeof schema>

const DEMO_PETS: Record<string, { name: string; photos: string[] }> = {
  'demo-1': { name: 'Luna',  photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80'] },
  'demo-2': { name: 'Mochi', photos: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80'] },
  'demo-3': { name: 'Bruno', photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80'] },
  'demo-4': { name: 'Cleo',  photos: ['https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=400&q=80'] },
  'demo-5': { name: 'Max',   photos: ['https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=400&q=80'] },
}

export default function AdoptionFormPage() {
  const { id } = useParams<{ id: string }>()
  const t = useTranslations()
  const { vetPets } = useVetStore()
  const [pet, setPet] = useState<{ name: string; photos?: string[] } | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    // Mascota de veterinaria (vet-[petId])
    if (id?.startsWith('vet-')) {
      const petId = id.replace('vet-', '')
      const vetPet = vetPets.find(p => p.id === petId)
      setPet(vetPet ? { name: vetPet.name, photos: vetPet.photos } : { name: 'Mascota', photos: [] })
      return
    }
    if (id?.startsWith('demo-')) {
      setPet(DEMO_PETS[id] || { name: 'Mascota', photos: [] })
      return
    }
    if (!isSupabaseConfigured) {
      setPet({ name: 'Mascota', photos: [] })
      return
    }
    const supabase = createClient()
    supabase.from('pets').select('name, photos').eq('id', id).single()
      .then(({ data }) => setPet(data || { name: 'Mascota', photos: [] }))
  }, [id, vetPets])

  const housingOptions = [
    { value: 'house',     label: t.adoptForm.housing.house },
    { value: 'apartment', label: t.adoptForm.housing.apartment },
    { value: 'farm',      label: t.adoptForm.housing.farm },
    { value: 'other',     label: t.adoptForm.housing.other },
  ]

  const experienceOptions = [
    { value: 'none',        label: t.adoptForm.experience.none },
    { value: 'some',        label: t.adoptForm.experience.some },
    { value: 'experienced', label: t.adoptForm.experience.experienced },
  ]

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const isVetPet = id?.startsWith('vet-')
      const isDemoPet = id?.startsWith('demo-')
      if (!isDemoPet && !isVetPet && isSupabaseConfigured) {
        const supabase = createClient()
        const { error } = await supabase.from('adoption_requests').insert({ pet_id: id, ...data })
        if (error) throw error
      }
      await new Promise(r => setTimeout(r, 800))
      setSubmitted(true)
    } catch {
      toast.error('Algo salió mal. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-dvh bg-gradient-hero flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-16">
          <div className="max-w-md w-full text-center">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-[heartPop_0.5s_ease-out]">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="font-heading font-extrabold text-3xl text-foreground mb-3">
              {t.adoptForm.success.title}
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              {t.adoptForm.success.subtitle(pet?.name || '')}
            </p>
            <div className="bg-white rounded-2xl p-5 shadow-card mb-8 text-left">
              <h3 className="font-semibold text-foreground mb-3">{t.adoptForm.success.nextStepsTitle}</h3>
              <ol className="space-y-3">
                {t.adoptForm.success.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-none w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/pets"
                className="w-full flex items-center justify-center gap-2 bg-gradient-amber text-white font-semibold py-4 rounded-xl shadow-warm-md"
              >
                <Heart className="w-4 h-4" />
                {t.adoptForm.success.cta}
              </Link>
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.adoptForm.success.backHome}
              </Link>
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 pt-20 pb-nav-cta md:pb-16">
        <Link href={`/pets/${id}`} className="inline-flex items-center gap-1.5 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t.petDetail.backLink}
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-primary-500" />
            <span className="text-primary-600 font-semibold text-sm">{t.adoptForm.requestLabel}</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground">
            {t.adoptForm.title(pet?.name || '...')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{t.adoptForm.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t.adoptForm.fields.name} <span className="text-destructive">*</span>
            </label>
            <input
              {...register('full_name')}
              placeholder={t.adoptForm.fields.namePlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
            {errors.full_name && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.full_name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t.adoptForm.fields.email} <span className="text-destructive">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder={t.adoptForm.fields.emailPlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t.adoptForm.fields.phone} <span className="text-destructive">*</span>
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder={t.adoptForm.fields.phonePlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t.adoptForm.fields.housing} <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {housingOptions.map(({ value, label }) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" {...register('housing_type')} value={value} className="sr-only peer" />
                  <div className="px-3 py-2.5 rounded-xl border border-border text-sm text-center peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 transition-all">
                    {label}
                  </div>
                </label>
              ))}
            </div>
            {errors.housing_type && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.housing_type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t.adoptForm.fields.experience} <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {experienceOptions.map(({ value, label }) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" {...register('experience')} value={value} className="sr-only peer" />
                  <div className="px-3 py-2.5 rounded-xl border border-border text-xs text-center peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 transition-all">
                    {label}
                  </div>
                </label>
              ))}
            </div>
            {errors.experience && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.experience.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t.adoptForm.fields.motivation(pet?.name || '')} <span className="text-destructive">*</span>
            </label>
            <textarea
              {...register('motivation')}
              rows={4}
              placeholder={t.adoptForm.fields.motivationPlaceholder(pet?.name || '')}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
            />
            {errors.motivation && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.motivation.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-amber text-white font-bold text-base py-4 rounded-xl shadow-warm-md hover:shadow-warm-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {t.adoptForm.submittingButton}</>
            ) : (
              <><Heart className="w-5 h-5" /> {t.adoptForm.submitButton}</>
            )}
          </button>

          <p className="text-xs text-muted-foreground text-center pb-2">
            {t.adoptForm.disclaimer}
          </p>
        </form>
      </main>

      <MobileNav />
    </div>
  )
}
