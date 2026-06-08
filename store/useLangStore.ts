import { create } from 'zustand'

type Lang = 'en' | 'es'

interface LangStore {
  lang: Lang
  toggle: () => void
}

const useLangStore = create<LangStore>()((set, get) => ({
  lang: 'es',
  toggle: () => set({ lang: get().lang === 'en' ? 'es' : 'en' }),
}))

export default useLangStore
