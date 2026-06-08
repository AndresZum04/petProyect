'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PawPrint, Menu, X, Heart, Stethoscope } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import useDemoAuthStore from '@/store/useDemoAuthStore'
import { useTranslations } from '@/hooks/useTranslations'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [supabaseUser, setSupabaseUser] = useState<{ email?: string } | null>(null)
  const [supabaseRole, setSupabaseRole] = useState<string | null>(null)
  const { role: demoRole, logout: demoLogout } = useDemoAuthStore()
  const t = useTranslations()

  const isLoggedIn = isSupabaseConfigured ? !!supabaseUser : !!demoRole
  const isAdmin = isSupabaseConfigured ? supabaseRole === 'admin' : demoRole === 'admin'

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const supabase = createClient()

    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      setSupabaseUser(data.user)
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
        setSupabaseRole(profile?.role ?? 'user')
      } else {
        setSupabaseRole(null)
      }
    }

    loadUser()

    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('role').eq('id', session.user.id).single()
          .then(({ data: profile }) => setSupabaseRole(profile?.role ?? 'user'))
      } else {
        setSupabaseRole(null)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  async function handleLogout() {
    if (isSupabaseConfigured) {
      const supabase = createClient()
      await supabase.auth.signOut()
    } else {
      demoLogout()
    }
    router.push('/')
    setMenuOpen(false)
  }

  const isHome = pathname === '/'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || !isHome
          ? 'glass border-b border-border shadow-warm-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-foreground">
          <div className="w-8 h-8 rounded-xl bg-gradient-amber flex items-center justify-center">
            <PawPrint className="w-4 h-4 text-white" />
          </div>
          PetConnect
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/pets" className={cn('text-sm font-medium transition-colors hover:text-primary-500', pathname === '/pets' ? 'text-primary-500' : 'text-muted-foreground')}>
            {t.nav.browse}
          </Link>

          <Link href="/vets" className={cn('text-sm font-medium transition-colors hover:text-primary-500', pathname.startsWith('/vets') ? 'text-primary-500' : 'text-muted-foreground')}>
            {t.vets.navLabel}
          </Link>

          {isAdmin && (
            <Link href="/dashboard" className={cn('text-sm font-medium transition-colors hover:text-primary-500', pathname.startsWith('/dashboard') ? 'text-primary-500' : 'text-muted-foreground')}>
              {t.nav.dashboard}
            </Link>
          )}

          {isLoggedIn ? (
            <button onClick={handleLogout} className="text-sm font-medium text-muted-foreground hover:text-primary-500 transition-colors">
              {t.dashboard.logout}
            </button>
          ) : (
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary-500 transition-colors">
              {t.nav.login}
            </Link>
          )}

          <Link
            href="/pets"
            className="flex items-center gap-2 bg-gradient-amber text-white text-sm font-semibold px-4 py-2 rounded-full shadow-warm hover:shadow-warm-md transition-all"
          >
            <Heart className="w-4 h-4" />
            {t.nav.adoptNow}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-b border-border px-4 py-4 flex flex-col gap-3">
          <Link href="/pets" onClick={() => setMenuOpen(false)} className="text-sm font-medium py-2 text-foreground">{t.nav.browse}</Link>
          <Link href="/vets" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium py-2 text-foreground">
            <Stethoscope className="w-4 h-4 text-primary-500" />
            {t.vets.navLabel}
          </Link>
          {isAdmin && (
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium py-2 text-foreground">{t.nav.dashboard}</Link>
          )}
          {isLoggedIn ? (
            <button onClick={handleLogout} className="text-sm font-medium py-2 text-left text-foreground">
              {t.dashboard.logout}
            </button>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium py-2 text-foreground">{t.nav.login}</Link>
          )}
          <Link
            href="/pets"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 bg-gradient-amber text-white text-sm font-semibold px-4 py-3 rounded-full shadow-warm"
          >
            <Heart className="w-4 h-4" />
            {t.nav.adoptNow}
          </Link>
        </div>
      )}
    </header>
  )
}
