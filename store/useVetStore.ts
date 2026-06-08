'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Vet, Rescuer, VetPet } from '@/types'

const DEMO_VETS: Vet[] = [
  {
    id: 'vet-1',
    name: 'Clínica Veterinaria San Rafael',
    city: 'San José',
    phone: '+506 2224-5678',
    email: 'contacto@sanrafael.cr',
    description: 'Clínica veterinaria comprometida con el bienestar animal y la adopción responsable en el Gran Área Metropolitana. Llevamos más de 10 años rescatando y rehabilitando animales en situación de calle.',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'vet-2',
    name: 'Refugio Animal La Esperanza',
    city: 'Heredia',
    phone: '+506 2261-3490',
    email: 'info@laesperanza.cr',
    description: 'Refugio dedicado al rescate y rehabilitación de animales en situación de calle en Heredia y alrededores. Somos 100% voluntarios y dependemos de donaciones para seguir salvando vidas.',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'vet-3',
    name: 'Protectora Huellitas Felices',
    city: 'Cartago',
    phone: '+506 2552-1234',
    email: 'huellitas@gmail.com',
    description: 'Asociación civil sin fines de lucro enfocada en la esterilización masiva y el rescate de animales en zonas de Cartago y el Valle Central.',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
]

const DEMO_RESCUERS: Rescuer[] = [
  { id: 'res-1', vet_id: 'vet-1', name: 'Dra. Ana Solano', role: 'Veterinario/a', created_at: new Date(Date.now() - 86400000 * 20).toISOString() },
  { id: 'res-2', vet_id: 'vet-1', name: 'Carlos Mora', role: 'Rescatista', created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'res-3', vet_id: 'vet-2', name: 'Sofía Vargas', role: 'Voluntario/a', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'res-4', vet_id: 'vet-2', name: 'Dr. Miguel Arias', role: 'Veterinario/a', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'res-5', vet_id: 'vet-3', name: 'Laura Campos', role: 'Hogar Temporal', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
]

const DEMO_VET_PETS: VetPet[] = [
  {
    id: 'vp-1', vet_id: 'vet-1', name: 'Tico', species: 'dog', age_label: '1 año',
    description: 'Rescatado de las calles de Los Yoses. Muy cariñoso y activo, se lleva bien con niños y otros perros. Busca un hogar con jardín.',
    photos: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80'],
    status: 'available', created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'vp-2', vet_id: 'vet-1', name: 'Mía', species: 'cat', age_label: '6 meses',
    description: 'Rescatada de una colonia felina en Barrio Escalante. Tímida al principio pero muy amorosa una vez que te conoce.',
    photos: ['https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400&q=80'],
    status: 'available', created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'vp-3', vet_id: 'vet-2', name: 'Pura Vida', species: 'dog', age_label: '3 años',
    description: 'Rescatado de una situación de maltrato en San Pablo de Heredia. Completamente rehabilitado, busca una familia paciente y amorosa.',
    photos: ['https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400&q=80'],
    status: 'available', created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'vp-4', vet_id: 'vet-3', name: 'Canela', species: 'rabbit', age_label: '2 años',
    description: 'Conejita rescatada en Cartago. Muy tranquila y fácil de cuidar, perfecta para apartamento.',
    photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=80'],
    status: 'available', created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
]

interface VetStore {
  vets: Vet[]
  rescuers: Rescuer[]
  vetPets: VetPet[]
  addVet: (data: Omit<Vet, 'id' | 'created_at'>) => Vet
  addRescuer: (data: Omit<Rescuer, 'id' | 'created_at'>) => void
  addVetPet: (data: Omit<VetPet, 'id' | 'created_at'>) => void
}

const useVetStore = create<VetStore>()(
  persist(
    (set, get) => ({
      vets: DEMO_VETS,
      rescuers: DEMO_RESCUERS,
      vetPets: DEMO_VET_PETS,
      addVet: (data) => {
        const vet: Vet = { ...data, id: `vet-${Date.now()}`, created_at: new Date().toISOString() }
        set({ vets: [...get().vets, vet] })
        return vet
      },
      addRescuer: (data) => {
        const rescuer: Rescuer = { ...data, id: `res-${Date.now()}`, created_at: new Date().toISOString() }
        set({ rescuers: [...get().rescuers, rescuer] })
      },
      addVetPet: (data) => {
        const pet: VetPet = { ...data, id: `vp-${Date.now()}`, created_at: new Date().toISOString() }
        set({ vetPets: [...get().vetPets, pet] })
      },
    }),
    { name: 'petconnect-vets' }
  )
)

export default useVetStore
