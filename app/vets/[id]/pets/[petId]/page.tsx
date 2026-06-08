'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Heart, MapPin, Phone, Mail, Calendar, Stethoscope, PawPrint, CheckCircle2, AlertCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import useVetStore from '@/store/useVetStore'
import { useTranslations } from '@/hooks/useTranslations'
import { cn, capitalize } from '@/lib/utils'

export default function VetPetDetailPage() {
  const { id: vetId, petId } = useParams<{ id: string; petId: string }>()
  const { vets, vetPets } = useVetStore()
  const t = useTranslations()

  const vet = vets.find(v => v.id === vetId)
  const pet = vetPets.find(p => p.id === petId)

  if (!pet || !vet) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <main className="pt-16 pb-24 flex items-center justify-center">
          <div className="text-center py-20">
            <PawPrint className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading font-semibold text-foreground mb-4">Mascota no encontrada</p>
            <Link href="/pets" className="text-primary-500 hover:underline text-sm">Ver todas las mascotas</Link>
          </div>
        </main>
        <MobileNav />
      </div>
    )
  }

  const photo = pet.photos?.[0]
  const speciesLabel = (t.browse.speciesLabel as Record<string, string>)[pet.species] || capitalize(pet.species)
  const isAvailable = pet.status === 'available'

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      <main className="pt-16 pb-40 md:pb-16">
        <div className="max-w-2xl mx-auto px-4 mt-8">
          <Link href={`/vets/${vetId}`} className="inline-flex items-center gap-1.5 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a {vet.name}
          </Link>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="relative w-36 h-36 rounded-full overflow-hidden ring-4 ring-primary-100 shadow-warm-md bg-secondary">
              {photo ? (
                <Image src={photo} alt={pet.name} fill className="object-cover" sizes="144px" priority />
              ) : (
                <PawPrint className="w-12 h-12 text-primary-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          {/* Nombre y estado */}
          <div className="text-center mb-6">
            <h1 className="font-heading font-extrabold text-3xl text-foreground mb-1">{pet.name}</h1>
            <p className="text-muted-foreground">{speciesLabel} · {pet.age_label}</p>
            <span className={cn('inline-flex items-center gap-1.5 mt-3 text-sm font-semibold px-4 py-1.5 rounded-full border', isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200')}>
              <CheckCircle2 className="w-4 h-4" />
              {isAvailable ? 'Disponible para adopción' : 'Ya fue adoptado'}
            </span>
          </div>

          {/* Descripción */}
          {pet.description && (
            <section className="mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-card border-l-4 border-primary-400">
                <p className="text-foreground/80 leading-relaxed">{pet.description}</p>
              </div>
            </section>
          )}

          {/* Veterinaria */}
          <section className="mb-6">
            <h2 className="font-heading font-bold text-base text-foreground mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary-500" />
              Pertenece a
            </h2>
            <div className="bg-white rounded-2xl p-5 shadow-card space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-none">
                  <Stethoscope className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{vet.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> {vet.city}
                  </div>
                </div>
              </div>
              {vet.phone && (
                <a href={`tel:${vet.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-500 transition-colors">
                  <Phone className="w-4 h-4 text-primary-400" /> {vet.phone}
                </a>
              )}
              {vet.email && (
                <a href={`mailto:${vet.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-500 transition-colors">
                  <Mail className="w-4 h-4 text-primary-400" /> {vet.email}
                </a>
              )}
            </div>
          </section>

          {/* Botón desktop */}
          {isAvailable && (
            <div className="hidden md:block">
              <Link href={`/adopt/vet-${pet.id}`} className="w-full flex items-center justify-center gap-2 bg-gradient-amber text-white font-bold text-lg py-4 rounded-2xl shadow-warm-lg hover:shadow-warm-xl transition-all hover:-translate-y-0.5">
                <Heart className="w-5 h-5" />
                Adoptar a {pet.name}
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Botón sticky mobile */}
      {isAvailable && (
        <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur border-t border-border px-4">
          <div className="py-3">
            <Link href={`/adopt/vet-${pet.id}`} className="w-full flex items-center justify-center gap-2 bg-gradient-amber text-white font-bold text-base py-4 rounded-xl shadow-warm-md">
              <Heart className="w-5 h-5" />
              Adoptar a {pet.name}
            </Link>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  )
}
