export interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  breed?: string
  age_label: string
  size?: 'small' | 'medium' | 'large'
  gender?: 'male' | 'female'
  status: 'available' | 'adopted' | 'reserved'
  story?: string
  personality_tags?: string[]
  rescue_story?: string
  vaccines?: { name: string; date: string }[]
  health_notes?: string
  special_needs: boolean
  special_needs_description?: string
  photos?: string[]
  avatar_url?: string
  requirements?: string
  location?: string
  contact?: string
  intake_date?: string
  created_at: string
}

export interface AdoptionRequest {
  id: string
  pet_id: string
  full_name: string
  email: string
  phone: string
  housing_type?: string
  experience?: string
  motivation: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  pets?: { name: string; photos?: string[] }
}

export interface Profile {
  id: string
  full_name: string
  role: 'user' | 'admin'
}

export interface Vet {
  id: string
  name: string
  city: string
  phone?: string
  email?: string
  description?: string
  photo_url?: string
  created_at: string
}

export interface Rescuer {
  id: string
  vet_id: string
  name: string
  role?: string
  created_at: string
}

export interface VetPet {
  id: string
  vet_id: string
  name: string
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  age_label: string
  description?: string
  photos?: string[]
  status: 'available' | 'adopted'
  created_at: string
}
