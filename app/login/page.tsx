'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PawPrint, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import { useTranslations } from '@/hooks/useTranslations'
import useDemoAuthStore from '@/store/useDemoAuthStore'

type Mode = 'login' | 'register'

const DEMO_CREDENTIALS: Record<string, { password: string; role: 'admin' | 'user' }> = {
  'admin@demo.com': { password: 'admin123', role: 'admin' },
  'user@demo.com':  { password: 'user123',  role: 'user'  },
}

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations()
  const { login: demoLogin } = useDemoAuthStore()
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 600))
      if (mode === 'register') {
        toast.error('El registro no está disponible en este momento.')
        setLoading(false)
        return
      }
      const demo = DEMO_CREDENTIALS[form.email.toLowerCase()]
      if (demo && form.password === demo.password) {
        demoLogin(form.email.toLowerCase(), demo.role)
        toast.success(demo.role === 'admin' ? '¡Bienvenido, Admin!' : '¡Bienvenido!')
        router.push(demo.role === 'admin' ? '/dashboard' : '/pets')
      } else {
        toast.error('Credenciales incorrectas')
      }
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name } },
        })
        if (error) throw error
        toast.success('¡Bienvenido a PetConnect!')
        if (data.session) {
          router.push('/pets')
        } else {
          setMode('login')
        }
        return
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (error) throw error

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        router.push(profile?.role === 'admin' ? '/dashboard' : '/pets')
        router.refresh()
      }
    } catch (err: any) {
      toast.error(err.message || 'Algo salió mal. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-hero flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-foreground mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-amber flex items-center justify-center">
          <PawPrint className="w-5 h-5 text-white" />
        </div>
        PetConnect
      </Link>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-warm-lg p-7">
          <div className="flex rounded-xl bg-secondary p-1 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === m ? 'bg-white text-foreground shadow-warm-sm' : 'text-muted-foreground'
                }`}
              >
                {m === 'login' ? t.login.signIn : t.login.register}
              </button>
            ))}
          </div>

          <h2 className="font-heading font-bold text-xl text-foreground mb-1">
            {mode === 'login' ? t.login.welcomeBack : t.login.createAccount}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {mode === 'login' ? t.login.signInSubtitle : t.login.registerSubtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t.login.namePlaceholder}
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder={t.login.emailPlaceholder}
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t.login.passwordPlaceholder}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-amber text-white font-semibold py-3.5 rounded-xl shadow-warm-md hover:shadow-warm-lg transition-all disabled:opacity-70"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {mode === 'login' ? t.login.signingIn : t.login.creatingAccount}</>
              ) : (
                mode === 'login' ? t.login.signIn : t.login.createAccount
              )}
            </button>
          </form>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-4 text-xs text-amber-800 space-y-1">
          <p className="font-semibold mb-1.5">Credenciales de administrador</p>
          <p><span className="font-medium">Correo:</span> admin@petconnect.com</p>
          <p><span className="font-medium">Contraseña:</span> Admin123!</p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link href="/pets" className="hover:text-primary-500 transition-colors">
            {t.login.continueAsGuest}
          </Link>
        </p>
      </div>
    </div>
  )
}
