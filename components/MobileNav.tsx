'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Heart, User, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/hooks/useTranslations'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import useDemoAuthStore from '@/store/useDemoAuthStore'
import { useState, useEffect } from 'react'

export default function MobileNav() {
  const pathname = usePathname()
  const t = useTranslations()
  const { role: demoRole } = useDemoAuthStore()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoggedIn(!!demoRole)
      setUserRole(demoRole)
      return
    }
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoggedIn(false); return }
      setLoggedIn(true)
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', data.user.id).single()
      setUserRole(profile?.role || 'user')
    })
  }, [demoRole])

  const profileHref = !loggedIn ? '/login' : userRole === 'admin' ? '/dashboard' : '/my-requests'
  const profileActive = pathname.startsWith('/my-requests') || pathname.startsWith('/dashboard') || pathname === '/login'
  const ProfileIcon = loggedIn && userRole === 'admin' ? LayoutDashboard : User

  const tabs = [
    { href: '/',         icon: Home,        label: t.mobileNav.home,    active: pathname === '/' },
    { href: '/pets',     icon: Heart,       label: 'Adoptar',           active: pathname.startsWith('/pets') },
    { href: profileHref, icon: ProfileIcon, label: t.mobileNav.profile, active: profileActive },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border pb-safe">
      <div className="flex items-stretch h-16">
        {tabs.map(({ href, icon: Icon, label, active }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 transition-colors min-h-touch',
              active ? 'text-primary-500' : 'text-muted-foreground'
            )}
          >
            <Icon className={cn('w-5 h-5 transition-transform', active && 'scale-110')} />
            <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
