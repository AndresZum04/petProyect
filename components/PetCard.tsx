'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/hooks/useTranslations'
import type { Pet } from '@/types'

interface PetCardProps {
  pet: Pet
  className?: string
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80'

const STATUS_STYLES: Record<Pet['status'], string> = {
  available: 'bg-green-100 text-green-700 border-green-200',
  adopted:   'bg-gray-100 text-gray-500 border-gray-200',
  reserved:  'bg-amber-100 text-amber-700 border-amber-200',
}

export default function PetCard({ pet, className }: PetCardProps) {
  const t = useTranslations()
  const photo = pet.avatar_url || pet.photos?.[0] || FALLBACK_IMAGE
  const statusLabel = (t.dashboard.statusValues as Record<string, string>)[pet.status] || pet.status

  return (
    <div className={cn('bg-white rounded-2xl shadow-card p-5 flex flex-col items-center gap-2.5 hover:-translate-y-1 hover:shadow-warm-md transition-all duration-200', className)}>
      {/* Avatar circular */}
      <div className="relative w-28 h-28 rounded-full overflow-hidden ring-2 ring-primary-100 flex-none bg-secondary">
        <Image
          src={photo}
          alt={pet.name}
          fill
          className="object-cover"
          sizes="112px"
        />
      </div>

      {/* Info */}
      <div className="text-center w-full">
        <h3 className="font-heading font-bold text-foreground text-base leading-tight">{pet.name}</h3>
        {pet.breed && (
          <p className="text-muted-foreground text-xs mt-0.5 truncate">{pet.breed}</p>
        )}
        <p className="text-muted-foreground text-xs">{pet.age_label}</p>
      </div>

      {/* Status badge */}
      <span className={cn('text-[11px] font-semibold px-3 py-1 rounded-full border', STATUS_STYLES[pet.status])}>
        {statusLabel}
      </span>

      {/* CTA */}
      <Link
        href={`/pets/${pet.id}`}
        className="w-full flex items-center justify-center bg-gradient-amber text-white text-xs font-semibold px-4 py-2 rounded-full shadow-warm hover:shadow-warm-md transition-all mt-0.5"
      >
        Ver más
      </Link>
    </div>
  )
}
