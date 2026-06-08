'use client'

import useLangStore from '@/store/useLangStore'
import { translations } from '@/lib/translations'

export function useTranslations() {
  const { lang } = useLangStore()
  return translations[lang]
}
