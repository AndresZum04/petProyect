'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import PetCard from '@/components/PetCard'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import { useTranslations } from '@/hooks/useTranslations'
import type { Pet } from '@/types'

const DEMO_PETS: Pet[] = [
  { id: 'demo-1', name: 'Luna', species: 'dog', breed: 'Golden Retriever Mix', age_label: '2 años', size: 'large', gender: 'female', status: 'available', special_needs: false, personality_tags: ['juguetona', 'cariñosa', 'energética'], photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80'], created_at: new Date().toISOString() },
  { id: 'demo-2', name: 'Mochi', species: 'cat', breed: 'Doméstico de Pelo Corto', age_label: '1 año', size: 'small', gender: 'male', status: 'available', special_needs: false, personality_tags: ['curioso', 'vocal', 'juguetón'], photos: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80'], created_at: new Date().toISOString() },
  { id: 'demo-3', name: 'Bruno', species: 'dog', breed: 'Bulldog Francés', age_label: '4 años', size: 'small', gender: 'male', status: 'available', special_needs: false, personality_tags: ['calmado', 'entrenado', 'leal'], photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80'], created_at: new Date().toISOString() },
  { id: 'demo-4', name: 'Cleo', species: 'cat', breed: 'Siamés Mix', age_label: '3 años', size: 'medium', gender: 'female', status: 'available', special_needs: false, personality_tags: ['elegante', 'cariñosa', 'independiente'], photos: ['https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600&q=80'], created_at: new Date().toISOString() },
  { id: 'demo-5', name: 'Max', species: 'dog', breed: 'Labrador Mix', age_label: '6 meses', size: 'medium', gender: 'male', status: 'available', special_needs: false, personality_tags: ['energético', 'sociable', 'amistoso'], photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80'], created_at: new Date().toISOString() },
  { id: 'demo-6', name: 'Bella', species: 'dog', breed: 'Beagle Mix', age_label: '5 años', size: 'medium', gender: 'female', status: 'available', special_needs: false, personality_tags: ['tranquila', 'dulce', 'calmada'], photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80'], created_at: new Date().toISOString() },
  { id: 'demo-7', name: 'Oliver', species: 'cat', breed: 'Tabby Anaranjado', age_label: '2 años', size: 'medium', gender: 'male', status: 'available', special_needs: false, personality_tags: ['juguetón', 'curioso', 'aventurero'], photos: ['https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=600&q=80'], created_at: new Date().toISOString() },
  { id: 'demo-8', name: 'Daisy', species: 'rabbit', breed: 'Holland Lop', age_label: '1 año', size: 'small', gender: 'female', status: 'available', special_needs: false, personality_tags: ['gentil', 'tranquila', 'cariñosa'], photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&q=80'], created_at: new Date().toISOString() },
]

function PetSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

export default function BrowsePage() {
  const t = useTranslations()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [species, setSpecies] = useState('all')
  const [size, setSize] = useState('all')
  const [gender, setGender] = useState('all')

  const speciesFilters = [
    { value: 'all',    label: t.browse.species.all },
    { value: 'dog',    label: t.browse.species.dog },
    { value: 'cat',    label: t.browse.species.cat },
    { value: 'bird',   label: t.browse.species.bird },
    { value: 'rabbit', label: t.browse.species.rabbit },
    { value: 'other',  label: t.browse.species.other },
  ]

  const sizeFilters = [
    { value: 'all',    label: t.browse.size.all },
    { value: 'small',  label: t.browse.size.small },
    { value: 'medium', label: t.browse.size.medium },
    { value: 'large',  label: t.browse.size.large },
  ]

  const genderFilters = [
    { value: 'all',    label: t.browse.gender.all },
    { value: 'male',   label: t.browse.gender.male },
    { value: 'female', label: t.browse.gender.female },
  ]

  const fetchPets = useCallback(async () => {
    setLoading(true)
    if (!isSupabaseConfigured) {
      setPets(filterDemoPets(species, size, gender, search))
      setLoading(false)
      return
    }
    try {
      const supabase = createClient()
      let query = supabase
        .from('pets')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })

      if (species !== 'all') query = query.eq('species', species)
      if (size !== 'all') query = query.eq('size', size)
      if (gender !== 'all') query = query.eq('gender', gender)
      if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)

      const { data, error } = await query
      if (error || !data || data.length === 0) {
        setPets(filterDemoPets(species, size, gender, search))
      } else {
        setPets(data)
      }
    } catch {
      setPets(filterDemoPets(species, size, gender, search))
    } finally {
      setLoading(false)
    }
  }, [species, size, gender, search])

  useEffect(() => {
    const timer = setTimeout(fetchPets, 300)
    return () => clearTimeout(timer)
  }, [fetchPets])

  function filterDemoPets(sp: string, sz: string, gn: string, q: string) {
    return DEMO_PETS.filter(p => {
      if (sp !== 'all' && p.species !== sp) return false
      if (sz !== 'all' && p.size !== sz) return false
      if (gn !== 'all' && p.gender !== gn) return false
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }

  const hasFilters = species !== 'all' || size !== 'all' || gender !== 'all' || search !== ''

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-20 pb-nav-cta md:pb-16">
        <div className="py-6">
          <h1 className="font-heading font-extrabold text-2xl md:text-4xl text-foreground">{t.browse.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            {t.browse.subtitle(pets.length)}
          </p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t.browse.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent shadow-warm-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
          {speciesFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setSpecies(f.value)}
              className={`flex-none text-sm font-medium px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                species === f.value
                  ? 'bg-primary-500 border-primary-500 text-white shadow-warm'
                  : 'bg-white border-border text-muted-foreground hover:border-primary-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6">
          {sizeFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setSize(f.value)}
              className={`flex-none text-xs font-medium px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                size === f.value
                  ? 'bg-foreground border-foreground text-white'
                  : 'bg-white border-border text-muted-foreground hover:border-foreground/30'
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="w-px bg-border flex-none" />
          {genderFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setGender(f.value)}
              className={`flex-none text-xs font-medium px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                gender === f.value
                  ? 'bg-foreground border-foreground text-white'
                  : 'bg-white border-border text-muted-foreground hover:border-foreground/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button
            onClick={() => { setSpecies('all'); setSize('all'); setGender('all'); setSearch('') }}
            className="flex items-center gap-1.5 text-sm text-primary-500 font-medium mb-4 hover:underline"
          >
            <X className="w-3.5 h-3.5" /> {t.browse.clearFilters}
          </button>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => <PetSkeleton key={i} />)}
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🐾</p>
            <h3 className="font-heading font-bold text-xl text-foreground mb-2">{t.browse.noResults}</h3>
            <p className="text-muted-foreground text-sm">{t.browse.noResultsHint}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {pets.map(pet => <PetCard key={pet.id} pet={pet} />)}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
