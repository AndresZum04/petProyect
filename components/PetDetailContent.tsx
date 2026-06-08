'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ArrowLeft, MapPin, Calendar, Ruler, VenetianMask, Stethoscope, Shield, AlertCircle, CheckCircle2, Clock, Phone, ClipboardList } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import { Badge } from '@/components/ui/badge'
import { cn, capitalize } from '@/lib/utils'
import { useTranslations } from '@/hooks/useTranslations'
import type { Pet } from '@/types'

interface Props {
  pet: Pet
  story?: string
  rescueStory?: string
  healthNotes?: string
  vaccines: { name: string; date: string }[]
  requirements?: string
  location?: string
  contact?: string
  intake_date?: string
}

export default function PetDetailContent({ pet, story, rescueStory, healthNotes, vaccines, requirements, location, contact, intake_date }: Props) {
  const t = useTranslations()

  const sizeVal = pet.size ? (t.petDetail.sizeValues as Record<string, string>)[pet.size] : '—'
  const genderVal = pet.gender ? (t.petDetail.genderValues as Record<string, string>)[pet.gender] : '—'
  const speciesVal = (t.browse.speciesLabel as Record<string, string>)[pet.species] || capitalize(pet.species)

  const statItems = [
    { icon: Calendar, label: t.petDetail.statLabels.age,     value: pet.age_label },
    { icon: Ruler,    label: t.petDetail.statLabels.size,    value: sizeVal },
    { icon: VenetianMask, label: t.petDetail.statLabels.gender, value: genderVal },
    { icon: MapPin,   label: t.petDetail.statLabels.species, value: speciesVal },
  ]

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      <main className="pt-16 pb-40 md:pb-16">
        <div className="max-w-2xl mx-auto px-4 mt-8">
          <Link href="/pets" className="inline-flex items-center gap-1.5 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t.petDetail.backLink}
          </Link>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="relative w-36 h-36 rounded-full overflow-hidden ring-4 ring-primary-100 shadow-warm-md bg-secondary">
              <Image
                src={pet.avatar_url || pet.photos?.[0] || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80'}
                alt={pet.name}
                fill
                className="object-cover"
                sizes="144px"
                priority
              />
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-foreground">{pet.name}</h1>
                {pet.status === 'adopted' && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">{t.petDetail.adopted}</Badge>
                )}
              </div>
              {pet.breed && <p className="text-muted-foreground">{pet.breed}</p>}
            </div>
            {pet.special_needs && (
              <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-medium flex-none">
                <AlertCircle className="w-3.5 h-3.5" />
                {t.petDetail.specialNeeds}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 mb-8">
            {statItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-card">
                <Icon className="w-4 h-4 text-primary-500 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                <p className="font-semibold text-sm text-foreground leading-tight mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {pet.personality_tags && pet.personality_tags.length > 0 && (
            <section className="mb-8">
              <h2 className="font-heading font-bold text-lg text-foreground mb-3">{t.petDetail.personality}</h2>
              <div className="flex flex-wrap gap-2">
                {pet.personality_tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-100">
                    {capitalize(tag)}
                  </span>
                ))}
              </div>
            </section>
          )}

          {story && (
            <section className="mb-8">
              <h2 className="font-heading font-bold text-lg text-foreground mb-3">
                {t.petDetail.story(pet.name)}
              </h2>
              <div className="bg-white rounded-2xl p-5 shadow-card border-l-4 border-primary-400">
                <p className="text-foreground/80 leading-relaxed">{story}</p>
              </div>
            </section>
          )}

          {rescueStory && (
            <section className="mb-8">
              <h2 className="font-heading font-bold text-lg text-foreground mb-4">{t.petDetail.rescueJourney}</h2>
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-primary-200" />
                {[
                  { icon: Clock,        title: t.petDetail.timeline.rescued, body: rescueStory },
                  { icon: Heart,        title: t.petDetail.timeline.foster,  body: t.petDetail.timeline.fosterBody(pet.name) },
                  { icon: CheckCircle2, title: t.petDetail.timeline.ready,   body: t.petDetail.timeline.readyBody(pet.name, pet.age_label) },
                ].map(({ icon: Icon, title, body }, i) => (
                  <div key={i} className="relative mb-5 last:mb-0">
                    <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-primary-500 border-2 border-background flex items-center justify-center">
                      <Icon className="w-2 h-2 text-white" />
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-card ml-2">
                      <p className="font-semibold text-sm text-foreground mb-1">{title}</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="font-heading font-bold text-lg text-foreground mb-4">
              <span className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary-500" />
                {t.petDetail.health.title}
              </span>
            </h2>
            <div className="bg-white rounded-2xl p-5 shadow-card space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: t.petDetail.health.vaccinated,   ok: vaccines.length > 0 },
                  { label: t.petDetail.health.spayed,       ok: true },
                  { label: t.petDetail.health.microchipped, ok: true },
                  { label: t.petDetail.health.vetChecked,   ok: true },
                ].map(({ label, ok }) => (
                  <div key={label} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border', ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200')}>
                    <CheckCircle2 className="w-3 h-3" />
                    {label}
                  </div>
                ))}
              </div>

              {vaccines.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">{t.petDetail.health.vaccines}</p>
                  <div className="space-y-2">
                    {vaccines.map((v, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-sm text-foreground">{v.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{v.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {healthNotes && (
                <p className="text-sm text-muted-foreground border-t border-border pt-3">{healthNotes}</p>
              )}
            </div>
          </section>

          {/* Ubicación & Contacto */}
          {(location || contact || intake_date) && (
            <section className="mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-card space-y-3">
                {location && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center flex-none">
                      <MapPin className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t.petDetail.locationLabel}</p>
                      <p className="text-sm font-medium text-foreground">{location}</p>
                    </div>
                  </div>
                )}
                {contact && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center flex-none">
                      <Phone className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t.petDetail.contactLabel}</p>
                      <p className="text-sm font-medium text-foreground">{contact}</p>
                    </div>
                  </div>
                )}
                {intake_date && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center flex-none">
                      <Calendar className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t.petDetail.intakeDateLabel}</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(intake_date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Requisitos de adopción */}
          {requirements && (
            <section className="mb-8">
              <h2 className="font-heading font-bold text-lg text-foreground mb-3">
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary-500" />
                  {t.petDetail.requirementsTitle}
                </span>
              </h2>
              <div className="bg-white rounded-2xl p-5 shadow-card border-l-4 border-amber-400">
                <p className="text-foreground/80 leading-relaxed text-sm">{requirements}</p>
              </div>
            </section>
          )}

          {pet.special_needs && (
            <section className="mb-8">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-heading font-bold text-amber-800">{t.petDetail.specialNeedsTitle}</h3>
                </div>
                <p className="text-amber-700 text-sm leading-relaxed">
                  {pet.special_needs_description || t.petDetail.specialNeedsDefault(pet.name)}
                </p>
              </div>
            </section>
          )}

          <div className="hidden md:block">
            {pet.status === 'available' ? (
              <Link href={`/adopt/${pet.id}`} className="w-full flex items-center justify-center gap-2 bg-gradient-amber text-white font-bold text-lg py-4 rounded-2xl shadow-warm-lg hover:shadow-warm-xl transition-all hover:-translate-y-0.5">
                <Heart className="w-5 h-5" />
                {t.petDetail.adoptButton(pet.name)}
              </Link>
            ) : pet.status === 'reserved' ? (
              <div className="w-full flex items-center justify-center gap-2 bg-amber-100 text-amber-700 font-bold text-lg py-4 rounded-2xl border border-amber-200">
                <Clock className="w-5 h-5" />
                {t.petDetail.reserved}
              </div>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 font-bold text-lg py-4 rounded-2xl border border-green-200">
                <CheckCircle2 className="w-5 h-5" />
                {t.petDetail.adoptedMessage(pet.name)}
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur border-t border-border px-4">
        <div className="py-3">
          {pet.status === 'available' ? (
            <Link href={`/adopt/${pet.id}`} className="w-full flex items-center justify-center gap-2 bg-gradient-amber text-white font-bold text-base py-4 rounded-xl shadow-warm-md">
              <Heart className="w-5 h-5" />
              {t.petDetail.adoptButton(pet.name)}
            </Link>
          ) : pet.status === 'reserved' ? (
            <div className="w-full flex items-center justify-center gap-2 bg-amber-100 text-amber-700 font-semibold py-4 rounded-xl border border-amber-200">
              <Clock className="w-5 h-5" />
              {t.petDetail.reserved}
            </div>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 font-semibold py-4 rounded-xl border border-green-200">
              <CheckCircle2 className="w-5 h-5" />
              {t.petDetail.alreadyAdopted}
            </div>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
