'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Vet, Rescuer, VetPet } from '@/types'

const DEMO_VETS: Vet[] = [
  {
    id: 'vet-1',
    name: 'Clínica Veterinaria San Pablo',
    city: 'Ciudad de México',
    phone: '+52 55 1234 5678',
    email: 'contacto@sanpablo.vet',
    description: 'Clínica veterinaria comprometida con el bienestar animal y la adopción responsable. Llevamos más de 10 años rescatando y rehabilitando animales en situación de calle.',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'vet-2',
    name: 'Refugio Animal La Esperanza',
    city: 'Guadalajara',
    phone: '+52 33 9876 5432',
    email: 'info@laesperanza.org',
    description: 'Refugio dedicado al rescate y rehabilitación de animales en situación de calle. Somos 100% voluntarios y dependemos de donaciones para seguir salvando vidas.',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'vet-3',
    name: 'Protectora Huellitas Felices',
    city: 'Monterrey',
    phone: '+52 81 5555 1234',
    email: 'huellitas@correo.com',
    description: 'Asociación civil sin fines de lucro enfocada en la esterilización masiva y el rescate de animales en zonas marginadas del área metropolitana.',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
]

const DEMO_RESCUERS: Rescuer[] = [
  { id: 'res-1', vet_id: 'vet-1', name: 'Dra. Ana López', role: 'Veterinaria', created_at: new Date(Date.now() - 86400000 * 20).toISOString() },
  { id: 'res-2', vet_id: 'vet-1', name: 'Carlos Martín', role: 'Rescatista', created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'res-3', vet_id: 'vet-2', name: 'Sofía Ramírez', role: 'Voluntaria', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'res-4', vet_id: 'vet-2', name: 'Dr. Miguel Torres', role: 'Veterinario', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'res-5', vet_id: 'vet-3', name: 'Laura Gómez', role: 'Hogar Temporal', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
]

const DEMO_VET_PETS: VetPet[] = [
  {
    id: 'vp-1', vet_id: 'vet-1', name: 'Max', species: 'dog', age_label: '1 año',
    description: 'Rescatado de las calles del centro. Muy cariñoso y activo, se lleva bien con niños y otros perros.',
    photos: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80'],
    status: 'available', created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'vp-2', vet_id: 'vet-1', name: 'Mia', species: 'cat', age_label: '6 meses',
    description: 'Rescatada de una colonia felina. Tímida al principio pero muy amorosa una vez que te conoce.',
    photos: ['https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400&q=80'],
    status: 'available', created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'vp-3', vet_id: 'vet-2', name: 'Rocky', species: 'dog', age_label: '3 años',
    description: 'Rescatado de una situación de maltrato. Completamente rehabilitado, busca una familia paciente y amorosa.',
    photos: ['https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400&q=80'],
    status: 'available', created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'vp-4', vet_id: 'vet-3', name: 'Canela', species: 'rabbit', age_label: '2 años',
    description: 'Conejita rescatada de un criadero clandestino. Muy tranquila y fácil de cuidar.',
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
