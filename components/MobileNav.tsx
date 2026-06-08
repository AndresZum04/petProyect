'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Stethoscope, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/hooks/useTranslations'

export default function MobileNav() {
  const pathname = usePathname()
  const t = useTranslations()

  const tabs = [
    { href: '/',      icon: Home,         label: t.mobileNav.home,    active: pathname === '/' },
    { href: '/pets',  icon: Search,       label: t.mobileNav.browse,  active: pathname.startsWith('/pets') },
    { href: '/vets',  icon: Stethoscope,  label: t.mobileNav.vets,    active: pathname.startsWith('/vets') },
    { href: '/login', icon: User,         label: t.mobileNav.profile, active: pathname.startsWith('/login') || pathname.startsWith('/dashboard') },
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
