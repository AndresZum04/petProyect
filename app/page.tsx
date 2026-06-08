'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Search, ArrowRight, Star, PawPrint, CheckCircle2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import PetCard from '@/components/PetCard'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import { useTranslations } from '@/hooks/useTranslations'
import type { Pet } from '@/types'

const DEMO_PETS: Pet[] = [
  { id: 'demo-1', name: 'Luna', species: 'dog', breed: 'Golden Retriever Mix', age_label: '2 años', size: 'large', gender: 'female', status: 'available', special_needs: false, personality_tags: ['juguetona', 'cariñosa', 'energética'], photos: ['https://images.unsplash.com/photo-1612940960267-26e9843ea1e8?w=600&q=80'], created_at: new Date().toISOString() },
  { id: 'demo-2', name: 'Mochi', species: 'cat', breed: 'Doméstico de Pelo Corto', age_label: '1 año', size: 'small', gender: 'male', status: 'available', special_needs: false, personality_tags: ['curioso', 'vocal', 'juguetón'], photos: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80'], created_at: new Date().toISOString() },
  { id: 'demo-3', name: 'Bruno', species: 'dog', breed: 'Bulldog Francés', age_label: '4 años', size: 'small', gender: 'male', status: 'available', special_needs: false, personality_tags: ['calmado', 'entrenado', 'leal'], photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80'], created_at: new Date().toISOString() },
  { id: 'demo-4', name: 'Cleo', species: 'cat', breed: 'Siamés Mix', age_label: '3 años', size: 'medium', gender: 'female', status: 'available', special_needs: false, personality_tags: ['elegante', 'cariñosa', 'independiente'], photos: ['https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600&q=80'], created_at: new Date().toISOString() },
]

const STAT_VALUES = ['2,400+', '1,800+', '120+', '98%']

export default function LandingPage() {
  const t = useTranslations()
  const [pets, setPets] = useState<Pet[]>(DEMO_PETS)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const supabase = createClient()
    supabase.from('pets').select('*').eq('status', 'available').order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => { if (data && data.length > 0) setPets(data) })
  }, [])

  const statLabels = [
    t.landing.stats.rescued,
    t.landing.stats.families,
    t.landing.stats.shelters,
    t.landing.stats.satisfaction,
  ]

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-dvh flex flex-col justify-center bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-8 w-32 h-32 rounded-full bg-primary-100/40 blur-3xl" />
          <div className="absolute bottom-1/3 left-4 w-48 h-48 rounded-full bg-amber-100/30 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-16 flex flex-col md:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <PawPrint className="w-3.5 h-3.5" />
              {t.landing.badge}
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl leading-[1.1] text-foreground mb-6">
              {t.landing.headline1}{' '}
              <span className="text-gradient-amber">{t.landing.headline2}</span>{' '}
              {t.landing.headline3}
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed">
              {t.landing.subtitle}
            </p>

            <div className="flex justify-center md:justify-start">
              <Link href="/pets" className="inline-flex items-center justify-center gap-2 bg-gradient-amber text-white font-semibold text-base px-7 py-4 rounded-full shadow-warm-md hover:shadow-warm-lg transition-all hover:-translate-y-0.5">
                <Heart className="w-5 h-5" />
                {t.landing.ctaPrimary}
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-8 justify-center md:justify-start">
              <div className="flex -space-x-2">
                {['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop'].map((src, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative">
                    <Image src={src} alt="adopter" fill className="object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-muted-foreground">{t.landing.socialProof}</p>
              </div>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="flex-1 w-full max-w-xs md:max-w-md relative flex items-center justify-center">
            <Image
              src="/hero-illustration.png"
              alt="Adopción de mascotas"
              width={500}
              height={420}
              className="w-full h-auto drop-shadow-xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STAT_VALUES.map((value, i) => (
              <div key={i} className="text-center">
                <p className="font-heading font-extrabold text-3xl md:text-4xl text-gradient-amber">{value}</p>
                <p className="text-muted-foreground text-sm mt-1">{statLabels[i]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pets */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">{t.landing.featuredTitle}</h2>
            <p className="text-muted-foreground mt-1">{t.landing.featuredSubtitle}</p>
          </div>
          <Link href="/pets" className="hidden md:inline-flex items-center gap-1.5 text-primary-500 font-semibold text-sm hover:underline">
            {t.landing.seeAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {pets.slice(0, 6).map(pet => <PetCard key={pet.id} pet={pet} />)}
        </div>
        <div className="text-center mt-8 md:hidden">
          <Link href="/pets" className="inline-flex items-center gap-2 text-primary-500 font-semibold">
            {t.landing.seeAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-warm py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">{t.landing.howTitle}</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">{t.landing.howSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.landing.steps.map((step, i) => {
              const icons = [Search, Heart, CheckCircle2]
              const Icon = icons[i]
              return (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-card relative">
                  <div className="absolute -top-3 left-6 w-8 h-8 bg-gradient-amber rounded-full flex items-center justify-center text-white font-bold text-sm shadow-warm">
                    {i + 1}
                  </div>
                  <div className="mt-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-500" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="relative bg-gradient-amber rounded-3xl p-8 md:p-12 overflow-hidden text-center shadow-warm-lg">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
          </div>
          <div className="relative">
            <h2 className="font-heading font-extrabold text-2xl md:text-4xl text-white mb-4">{t.landing.ctaBannerTitle}</h2>
            <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto mb-8">{t.landing.ctaBannerSubtitle}</p>
            <Link href="/pets" className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold text-base px-8 py-4 rounded-full shadow-warm-md hover:shadow-warm-lg transition-all hover:-translate-y-0.5">
              <Heart className="w-5 h-5" />
              {t.landing.ctaBannerButton}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border pb-nav md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-heading font-bold text-lg text-foreground">
            <div className="w-7 h-7 rounded-lg bg-gradient-amber flex items-center justify-center">
              <PawPrint className="w-3.5 h-3.5 text-white" />
            </div>
            PetConnect
          </div>
          <p className="text-muted-foreground text-sm text-center">{t.landing.footerTagline}</p>
          <div className="flex gap-6">
            <Link href="/pets" className="text-muted-foreground text-sm hover:text-primary-500 transition-colors">{t.nav.browse}</Link>
            <Link href="/login" className="text-muted-foreground text-sm hover:text-primary-500 transition-colors">{t.nav.login}</Link>
          </div>
        </div>
      </footer>

      <MobileNav />
    </div>
  )
}
