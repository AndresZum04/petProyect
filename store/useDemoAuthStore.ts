'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type DemoRole = 'admin' | 'user' | null

interface DemoAuthStore {
  role: DemoRole
  email: string | null
  login: (email: string, role: DemoRole) => void
  logout: () => void
}

const useDemoAuthStore = create<DemoAuthStore>()(
  persist(
    (set) => ({
      role: null,
      email: null,
      login: (email, role) => set({ email, role }),
      logout: () => set({ email: null, role: null }),
    }),
    { name: 'petconnect-auth' }
  )
)

export default useDemoAuthStore
