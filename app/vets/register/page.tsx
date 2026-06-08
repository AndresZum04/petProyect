'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Stethoscope, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from '@/hooks/useTranslations'
import useVetStore from '@/store/useVetStore'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'

export default function RegisterVetPage() {
  const t = useTranslations()
  const router = useRouter()
  const { addVet } = useVetStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '', city: '', phone: '', email: '', description: '',
  })

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.city) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    addVet(form)
    setLoading(false)
    setSuccess(true)
    toast.success(t.vets.register.success)
  }

  if (success) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <main className="pt-16 pb-24 md:pb-16 flex items-center justify-center px-4">
          <div className="max-w-sm w-full text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">{t.vets.register.success}</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Tu veterinaria ya está visible en el directorio.
            </p>
            <Link
              href="/vets"
              className="inline-flex items-center gap-2 bg-gradient-amber text-white font-semibold px-6 py-3 rounded-xl shadow-warm"
            >
              {t.vets.register.backToVets}
            </Link>
          </div>
        </main>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      <main className="pt-16 pb-24 md:pb-16">
        <div className="max-w-lg mx-auto px-4 py-6">
          <Link href="/vets" className="inline-flex items-center gap-1.5 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t.vets.profile.back}
          </Link>

          <div className="bg-white rounded-3xl shadow-warm-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-amber flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl text-foreground">{t.vets.register.title}</h1>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-6">{t.vets.register.subtitle}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t.vets.register.name} *</label>
                <input
                  type="text"
                  placeholder={t.vets.register.namePlaceholder}
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t.vets.register.city} *</label>
                <input
                  type="text"
                  placeholder={t.vets.register.cityPlaceholder}
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t.vets.register.phone}</label>
                  <input
                    type="tel"
                    placeholder={t.vets.register.phonePlaceholder}
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t.vets.register.email}</label>
                  <input
                    type="email"
                    placeholder={t.vets.register.emailPlaceholder}
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t.vets.register.description}</label>
                <textarea
                  placeholder={t.vets.register.descriptionPlaceholder}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-amber text-white font-semibold py-3.5 rounded-xl shadow-warm-md hover:shadow-warm-lg transition-all disabled:opacity-70"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {t.vets.register.submitting}</>
                ) : (
                  t.vets.register.submit
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
